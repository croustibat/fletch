import type { AgentRecord } from "@/api/types/agent";
import { firstLine } from "./format";

/** What the agent is working on, as the sidebar names it: its own title once
 *  it has set one (the `set_title` mailbox op), else the first line of the
 *  prompt. The codename is the secondary handle, not what anyone scans by.
 *  Shared with the mobile app, so it stays free of store/UI imports. */
export function agentTitle(agent: Pick<AgentRecord, "title" | "task">): string {
  return agent.title || firstLine(agent.task, 80) || "Untitled";
}
