import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";

// GET: List all team members for the practice
export async function GET(request: Request) {
  const guard = await guardRoute(request, "team", { roles: ["admin", "platform_admin"] });
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({ members: demoStore.getTeamMembers() });
  }

  // Production: query Supabase
  const { supabaseAdmin, tables } = await import("@/lib/supabase");
  const { data, error } = await supabaseAdmin
    .from(tables.users)
    .select("*")
    .eq("practice_id", guard.practiceId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
  }

  return NextResponse.json({ members: data || [] });
}

// POST: Create/invite new team member
export async function POST(request: Request) {
  const guard = await guardRoute(request, "team", { roles: ["admin", "platform_admin"] });
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const { name, email, role } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Name, email, and role are required" }, { status: 400 });
    }

    const validRoles = ["admin", "doctor", "receptionist", "nurse"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}` }, { status: 400 });
    }

    if (isDemoMode) {
      // Check for duplicate email
      const existing = demoStore.getTeamMembers().find(m => m.email === email);
      if (existing) {
        return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
      }

      const member = demoStore.addTeamMember({ name, email, role });

      // Log the action
      demoStore.addAuditLog({
        action: "team_member_invite",
        details: `Invited ${name} (${email}) as ${role}`,
        userId: guard.user.id,
        userName: guard.user.name,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
      });

      return NextResponse.json({ member, message: "Team member invited successfully" }, { status: 201 });
    }

    // Production: create user in Supabase
    const { supabaseAdmin, tables } = await import("@/lib/supabase");
    const bcrypt = (await import("bcryptjs")).default;

    // Check for existing user
    const { data: existing } = await supabaseAdmin
      .from(tables.users)
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    // Generate temp password
    const crypto = await import("crypto");
    const tempPassword = crypto.randomBytes(8).toString("hex");
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const { data: newUser, error } = await supabaseAdmin
      .from(tables.users)
      .insert({
        name,
        email,
        role,
        password_hash: passwordHash,
        practice_id: guard.practiceId,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
    }

    // Try sending welcome email via Resend
    try {
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      if (RESEND_API_KEY) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Netcare Health OS <noreply@netcare-healthos.vercel.app>",
            to: email,
            subject: "Welcome to Netcare Health OS",
            html: `
              <h2>Welcome to Netcare Health OS, ${name}!</h2>
              <p>You have been invited to join the team as a <strong>${role}</strong>.</p>
              <p>Your temporary credentials:</p>
              <ul>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Temporary Password:</strong> ${tempPassword}</li>
              </ul>
              <p>Please log in and change your password immediately.</p>
              <p><a href="https://netcare-healthos.vercel.app/login">Log in now</a></p>
            `,
          }),
        });
      }
    } catch {
      // Email sending is best-effort
    }

    return NextResponse.json({ member: newUser, message: "Team member invited successfully" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

// PATCH: Update team member
export async function PATCH(request: Request) {
  const guard = await guardRoute(request, "team", { roles: ["admin", "platform_admin"] });
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const { id, role, status, name } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (isDemoMode) {
      const updates: Record<string, unknown> = {};
      if (role) updates.role = role;
      if (status) updates.status = status;
      if (name) updates.name = name;

      const member = demoStore.updateTeamMember(id, updates);
      if (!member) {
        return NextResponse.json({ error: "Team member not found" }, { status: 404 });
      }

      demoStore.addAuditLog({
        action: "team_member_update",
        details: `Updated ${member.name}: ${Object.entries(updates).map(([k, v]) => `${k}=${v}`).join(", ")}`,
        userId: guard.user.id,
        userName: guard.user.name,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
      });

      return NextResponse.json({ member });
    }

    // Production
    const { supabaseAdmin, tables } = await import("@/lib/supabase");
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (role) updates.role = role;
    if (status) updates.status = status;
    if (name) updates.name = name;

    const { data, error } = await supabaseAdmin
      .from(tables.users)
      .update(updates)
      .eq("id", id)
      .eq("practice_id", guard.practiceId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Failed to update team member" }, { status: 500 });
    }

    return NextResponse.json({ member: data });
  } catch {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

// DELETE: Soft-delete (deactivate) team member
export async function DELETE(request: Request) {
  const guard = await guardRoute(request, "team", { roles: ["admin", "platform_admin"] });
  if (isErrorResponse(guard)) return guard;

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Prevent self-deletion
    if (id === guard.user.id) {
      return NextResponse.json({ error: "You cannot deactivate your own account" }, { status: 400 });
    }

    if (isDemoMode) {
      const member = demoStore.deleteTeamMember(id);
      if (!member) {
        return NextResponse.json({ error: "Team member not found" }, { status: 404 });
      }

      demoStore.addAuditLog({
        action: "team_member_deactivate",
        details: `Deactivated ${member.name} (${member.email})`,
        userId: guard.user.id,
        userName: guard.user.name,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
      });

      return NextResponse.json({ message: "Team member deactivated" });
    }

    // Production
    const { supabaseAdmin, tables } = await import("@/lib/supabase");
    const { error } = await supabaseAdmin
      .from(tables.users)
      .update({ status: "inactive", updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("practice_id", guard.practiceId);

    if (error) {
      return NextResponse.json({ error: "Failed to deactivate team member" }, { status: 500 });
    }

    return NextResponse.json({ message: "Team member deactivated" });
  } catch {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
