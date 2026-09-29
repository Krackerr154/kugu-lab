import { coercePresentationState, M3_DEMO_AGENT_IDS, M3_FOCUS_IDS, M3_PRESENTATION_VERSION, M3_STAGE_IDS } from "../shared/m3-contract.mjs";
export { coercePresentationState, M3_STAGE_IDS, M3_FOCUS_IDS, M3_DEMO_AGENT_IDS, M3_PRESENTATION_VERSION } from "../shared/m3-contract.mjs";

const id = (value, max = 200) => typeof value === "string" && value.length > 0 && value.length <= max;
export function coerceClientMessage(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  if (input.t === "join") {
    if (!id(input.roomId, 64) || (input.role !== "student" && input.role !== "presenter")) return null;
    if (input.ticket !== undefined && !id(input.ticket, 256)) return null;
    return { t: "join", roomId: input.roomId, role: input.role, ...(input.ticket ? { ticket: input.ticket } : {}) };
  }
  if (input.t === "present") {
    const state = coercePresentationState(input.state);
    return state ? { t: "present", state } : null;
  }
  if (input.t === "snapshot" || input.t === "end" || input.t === "ping") return { t: input.t };
  return null;
}
