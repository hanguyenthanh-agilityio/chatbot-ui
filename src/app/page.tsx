import { TimeOffApp } from "@/components/time-off/time-off-app";
import { getMockAuthSessionsByRole } from "@/lib/auth/session-store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const authSessions = await getMockAuthSessionsByRole();

  return <TimeOffApp authSessions={authSessions} />;
}
