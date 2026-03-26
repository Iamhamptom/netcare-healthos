import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";

/**
 * SDK Widget Endpoint — Embeddable AI chat agent for practice websites
 *
 * GET  /api/public/sdk?practice=rheumcare → returns the embed script
 * POST /api/public/sdk → handles chat messages from the widget
 */

// GET: Return the embeddable JavaScript snippet
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const practice = searchParams.get("practice") || "default";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://healthos.visiocorp.co";

  // Return embeddable widget script
  const script = `
(function() {
  var d = document, s = d.createElement('script');

  // Styles
  var style = d.createElement('style');
  style.textContent = \`
    #vrl-sdk-widget {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #vrl-sdk-btn {
      width: 60px; height: 60px; border-radius: 50%; border: none;
      background: #6366f1; color: white; cursor: pointer;
      box-shadow: 0 4px 24px rgba(99,102,241,0.4);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s;
    }
    #vrl-sdk-btn:hover { transform: scale(1.1); }
    #vrl-sdk-btn svg { width: 28px; height: 28px; }
    #vrl-sdk-panel {
      display: none; position: absolute; bottom: 72px; right: 0;
      width: 380px; height: 560px; border-radius: 16px;
      background: #0f0f10; border: 1px solid #222;
      box-shadow: 0 8px 48px rgba(0,0,0,0.5);
      overflow: hidden; flex-direction: column;
    }
    #vrl-sdk-panel.open { display: flex; }
    #vrl-sdk-header {
      padding: 16px 20px; background: #111; border-bottom: 1px solid #222;
      display: flex; align-items: center; gap: 12px;
    }
    #vrl-sdk-header h3 { margin: 0; color: #fff; font-size: 15px; font-weight: 600; }
    #vrl-sdk-header p { margin: 0; color: #888; font-size: 12px; }
    #vrl-sdk-messages {
      flex: 1; overflow-y: auto; padding: 16px 20px;
      display: flex; flex-direction: column; gap: 12px;
    }
    .vrl-msg {
      max-width: 85%; padding: 10px 14px; border-radius: 12px;
      font-size: 14px; line-height: 1.5; word-wrap: break-word;
    }
    .vrl-msg.ai {
      background: #1a1a2e; color: #e0e0e0; align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    .vrl-msg.user {
      background: #6366f1; color: white; align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .vrl-msg.typing { opacity: 0.6; font-style: italic; }
    #vrl-sdk-input-wrap {
      padding: 12px 16px; border-top: 1px solid #222;
      display: flex; gap: 8px;
    }
    #vrl-sdk-input {
      flex: 1; padding: 10px 14px; border-radius: 8px;
      border: 1px solid #333; background: #111; color: #fff;
      font-size: 14px; outline: none;
    }
    #vrl-sdk-input:focus { border-color: #6366f1; }
    #vrl-sdk-send {
      padding: 8px 16px; border-radius: 8px; border: none;
      background: #6366f1; color: white; font-size: 14px;
      cursor: pointer; font-weight: 500;
    }
    #vrl-sdk-send:hover { background: #5558e6; }
    #vrl-sdk-send:disabled { opacity: 0.5; cursor: not-allowed; }
    #vrl-sdk-powered {
      padding: 8px; text-align: center; font-size: 11px; color: #555;
    }
    #vrl-sdk-powered a { color: #6366f1; text-decoration: none; }
  \`;
  d.head.appendChild(style);

  // Widget HTML
  var widget = d.createElement('div');
  widget.id = 'vrl-sdk-widget';
  widget.innerHTML = \`
    <div id="vrl-sdk-panel">
      <div id="vrl-sdk-header">
        <div>
          <h3>Health Assistant</h3>
          <p>Powered by AI — typically responds in seconds</p>
        </div>
      </div>
      <div id="vrl-sdk-messages">
        <div class="vrl-msg ai">Hi! 👋 I'm your health assistant. I can help you book an appointment, answer questions about our services, or connect you with our team. How can I help?</div>
      </div>
      <div id="vrl-sdk-input-wrap">
        <input id="vrl-sdk-input" placeholder="Type a message..." autocomplete="off" />
        <button id="vrl-sdk-send">Send</button>
      </div>
      <div id="vrl-sdk-powered">Powered by <a href="https://visiocorp.co" target="_blank">Visio Research Labs</a></div>
    </div>
    <button id="vrl-sdk-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    </button>
  \`;
  d.body.appendChild(widget);

  // Logic
  var panel = d.getElementById('vrl-sdk-panel');
  var btn = d.getElementById('vrl-sdk-btn');
  var input = d.getElementById('vrl-sdk-input');
  var sendBtn = d.getElementById('vrl-sdk-send');
  var msgs = d.getElementById('vrl-sdk-messages');
  var sessionId = 'vrl-' + Math.random().toString(36).substr(2, 9);

  btn.onclick = function() {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) input.focus();
  };

  function addMsg(text, role) {
    var el = d.createElement('div');
    el.className = 'vrl-msg ' + role;
    el.textContent = text;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  async function send() {
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    addMsg(text, 'user');
    sendBtn.disabled = true;
    var typing = addMsg('Thinking...', 'ai typing');

    try {
      var res = await fetch('${baseUrl}/api/public/sdk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, practice: '${practice}', sessionId: sessionId })
      });
      var data = await res.json();
      typing.remove();
      addMsg(data.reply || 'Sorry, I had trouble processing that. Please try again.', 'ai');
    } catch(e) {
      typing.remove();
      addMsg('Connection error. Please try again.', 'ai');
    }
    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.onclick = send;
  input.onkeydown = function(e) { if (e.key === 'Enter') send(); };
})();
`;

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

// POST: Handle chat messages from the SDK widget
export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "public/sdk", { limit: 30 });
  if (!rl.allowed) return NextResponse.json({ reply: "You're sending messages too fast. Please wait a moment." }, { status: 429 });

  try {
    const { message, practice, sessionId } = await request.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ reply: "Please send a message." }, { status: 400 });
    }

    // Use Gemini for fast, cheap responses
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: "Our assistant is being set up. Please call us directly or try again shortly." });
    }

    const practiceContext = getPracticeContext(practice || "default");

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${practiceContext}\n\nPatient message: "${message}"\n\nRespond helpfully in 2-3 sentences. Be warm, professional, and concise. If they want to book, collect: name, phone number, which service they need, and preferred date/time. If they ask about pricing or services, give them specific information from the practice context above.` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
        }),
      }
    );

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble right now. Please call us directly.";

    return NextResponse.json({ reply, sessionId });
  } catch {
    return NextResponse.json({ reply: "Something went wrong. Please try again or call us directly." });
  }
}

function getPracticeContext(practice: string): string {
  const contexts: Record<string, string> = {
    rheumcare: `You are the AI assistant for RheumCare Clinic Inc (rheumcare.co.za), a specialist rheumatology practice founded by Dr Joyce Ziki.

SERVICES & PRICING:
- New Patient Consultation: R2,600 (60 min)
- Follow-up Consultation: R1,400 (30 min)
- Biologic Infusion (Rituximab): R8,500 (4 hrs)
- Biologic Infusion (Actemra): R6,200 (90 min)
- Joint Injection (Large): R1,800
- Joint Injection (Small): R1,200
- Joint Aspiration: R1,500
- Musculoskeletal Ultrasound: R2,000
- DAS28 Assessment: R800

LOCATIONS:
- Main: Wits Donald Gordon Medical Centre, Parktown, Johannesburg (Mon-Fri)
- Netcare Sunward Park Hospital, Boksburg (Mon & Wed)
- Life Groenkloof Hospital, Pretoria (Fridays)
- Mediclinic Trichardt, Mpumalanga (Last Saturday of month)

CONDITIONS TREATED: Rheumatoid arthritis, Lupus (SLE), Sjogren's syndrome, Ankylosing spondylitis, Psoriatic arthritis, Gout, Systemic sclerosis, Vasculitis, Juvenile arthritis

WHAT TO BRING: Referral letter from GP, ID document, previous blood results, list of current medications, medical aid card (if applicable)

PAYMENT: Cash patients accepted. New patients pay R2,600 upfront. Medical aid patients also welcome.

CONTACT: admin@rheumcare.co.za | 011 356 6317 | Practice Manager: Buhle Dube`,

    default: `You are a healthcare AI assistant. Help patients with booking appointments, answering questions about services, and providing general information. Be warm, professional, and concise. Always recommend calling the practice directly for urgent matters.`,
  };

  return contexts[practice] || contexts.default;
}
