import type { VoiceCommand } from "./types";

interface CommandPattern {
  triggers: string[];
  type: VoiceCommand["type"];
}

const PATTERNS: CommandPattern[] = [
  { triggers: ["add to plan", "plan is", "the plan is"], type: "add_plan" },
  { triggers: ["add to assessment", "assessment is", "my assessment"], type: "add_assessment" },
  { triggers: ["diagnosis is", "diagnosis", "differential is"], type: "add_diagnosis" },
  { triggers: ["prescribe", "prescription", "start on", "commence"], type: "prescribe" },
  { triggers: ["refer to", "referral to", "refer the patient to"], type: "refer" },
  { triggers: ["note that", "please note", "important note"], type: "add_note" },
];

export function parseVoiceCommands(text: string): VoiceCommand[] {
  const commands: VoiceCommand[] = [];
  const lower = text.toLowerCase();

  for (const pattern of PATTERNS) {
    for (const trigger of pattern.triggers) {
      let idx = lower.indexOf(trigger);
      while (idx !== -1) {
        const afterTrigger = text.slice(idx + trigger.length).trim();
        const endMatch = afterTrigger.match(/[.!?\n]/);
        const content = endMatch
          ? afterTrigger.slice(0, endMatch.index).trim()
          : afterTrigger.trim();

        if (content.length > 2) {
          const cleaned = content.replace(/^[,:]\s*/, "").trim();
          if (cleaned.length > 2) {
            commands.push({
              type: pattern.type,
              content: cleaned,
              timestamp: Date.now(),
              applied: false,
            });
          }
        }
        idx = lower.indexOf(trigger, idx + trigger.length);
      }
    }
  }

  return commands;
}
