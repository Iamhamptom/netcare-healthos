import { NextResponse } from "next/server";
import { guardPlatformAdmin, isErrorResponse } from "@/lib/api-helpers";
import { sendEmail } from "@/lib/resend";
import { SEGMENT_TEMPLATES } from "@/lib/outreach-templates";
import { FOLLOW_UP_STEPS, FOLLOW_UP_DAYS } from "@/lib/outreach-followups";

export async function POST(request: Request) {
  const guard = await guardPlatformAdmin(request, "outreach-send", { limit: 10 });
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const { targetId, campaignId, isFollowUp } = body;

  if (!targetId) {
    return NextResponse.json({ error: "targetId is required" }, { status: 400 });
  }

  const { prisma } = await import("@/lib/prisma");

  const target = await prisma.outreachTarget.findUnique({
    where: { id: targetId },
    include: { campaign: true },
  });

  if (!target) {
    return NextResponse.json({ error: "Target not found" }, { status: 404 });
  }

  if (!target.email) {
    return NextResponse.json({ error: "Target has no email address" }, { status: 400 });
  }

  if (target.status === "opted_out") {
    return NextResponse.json({ error: "Target has opted out" }, { status: 400 });
  }

  let subject: string;
  let html: string;
  let templateKey: string;

  const templateData = {
    recipientName: target.name,
    recipientTitle: target.title,
    organization: target.organization,
    customData: target.personalizationData ? JSON.parse(target.personalizationData) : {},
  };

  if (isFollowUp && target.followUpStep > 0 && target.followUpStep <= 4) {
    // Send follow-up based on current step
    const stepIndex = target.followUpStep - 1;
    const followUpFn = FOLLOW_UP_STEPS[stepIndex];
    // Get original subject from first email
    const firstEmail = await prisma.outreachEmail.findFirst({
      where: { targetId: target.id },
      orderBy: { createdAt: "asc" },
    });
    const result = followUpFn({
      recipientName: target.name,
      organization: target.organization,
      segment: target.segment,
      originalSubject: firstEmail?.subject || "VRL Research",
    });
    subject = result.subject;
    html = result.html;
    templateKey = `followup_${target.followUpStep}`;
  } else {
    // Send initial segment email
    const segmentConfig = SEGMENT_TEMPLATES[target.campaign.segment];
    if (!segmentConfig) {
      return NextResponse.json({ error: `No template for segment ${target.campaign.segment}` }, { status: 400 });
    }
    const result = segmentConfig.generator(templateData);
    subject = result.subject;
    html = result.html;
    templateKey = segmentConfig.key;
  }

  // Send via Resend
  const emailResult = await sendEmail({
    to: target.email,
    subject,
    html,
    replyTo: "hampton@visiohealth.co.za",
  });

  const resendId = (emailResult as { data?: { id?: string } })?.data?.id || "";

  // Create email record
  await prisma.outreachEmail.create({
    data: {
      targetId: target.id,
      campaignId: target.campaignId,
      templateKey,
      subject,
      resendId,
      status: resendId ? "sent" : "failed",
      sentAt: resendId ? new Date() : null,
    },
  });

  // Update target status and follow-up scheduling
  const nextStep = (target.followUpStep || 0) + 1;
  const cadence: number[] = JSON.parse(target.campaign.followUpCadence || "[3,7,14,30]");
  const nextFollowUpDays = cadence[nextStep - 1]; // step 1 = index 0

  await prisma.outreachTarget.update({
    where: { id: target.id },
    data: {
      status: target.status === "pending" ? "sent" : target.status,
      lastEmailSentAt: new Date(),
      followUpStep: nextStep,
      nextFollowUpAt: nextFollowUpDays
        ? new Date(Date.now() + nextFollowUpDays * 86400000)
        : null,
    },
  });

  // Update campaign sent count
  const sentCount = await prisma.outreachTarget.count({
    where: {
      campaignId: target.campaignId,
      status: { notIn: ["pending", "queued"] },
    },
  });
  await prisma.outreachCampaign.update({
    where: { id: target.campaignId },
    data: { sentCount },
  });

  return NextResponse.json({
    success: true,
    resendId,
    subject,
    nextFollowUp: nextFollowUpDays ? `${nextFollowUpDays} days` : null,
  });
}
