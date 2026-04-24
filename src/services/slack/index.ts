import { SLACK_API_POST_MESSAGE } from "./constants";

function formatHumanDateRange(startDate: string, endDate: string): string {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth();
  const sameDay = sameMonth && start.getUTCDate() === end.getUTCDate();

  const monthFmt = (d: Date) =>
    d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const dayFmt = (d: Date) => d.getUTCDate();
  const yearFmt = (d: Date) => d.getUTCFullYear();

  if (sameDay) {
    return `${monthFmt(start)} ${dayFmt(start)}, ${yearFmt(start)}`;
  }

  if (sameMonth) {
    return `${monthFmt(start)} ${dayFmt(start)}–${dayFmt(end)}, ${yearFmt(start)}`;
  }

  if (sameYear) {
    return `${monthFmt(start)} ${dayFmt(start)} – ${monthFmt(end)} ${dayFmt(end)}, ${yearFmt(start)}`;
  }

  return `${monthFmt(start)} ${dayFmt(start)}, ${yearFmt(start)} – ${monthFmt(end)} ${dayFmt(end)}, ${yearFmt(end)}`;
}

async function postSlackMessage(text: string): Promise<void> {
  const token = process.env.SLACK_BOT_TOKEN || process.env.SLACK_USER_TOKEN;
  const channel = process.env.SLACK_DEFAULT_CHANNEL;
  if (!token || !channel) return;

  await fetch(SLACK_API_POST_MESSAGE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ channel, text }),
  });
}

export async function notifyTimeOffApproved(
  employeeName: string,
  startDate: string,
  endDate: string,
): Promise<void> {
  const dateRange = formatHumanDateRange(startDate, endDate);
  await postSlackMessage(`${employeeName} will be off ${dateRange}`);
}
