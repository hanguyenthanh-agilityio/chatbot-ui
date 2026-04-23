import { isAppRole, type AppRole, type MockAuthSession } from "@/lib/auth/session";
import { Select } from "@/components/ui/select";
import { AUTH_PANEL_COPY, ROLE_HELPER_COPY_BY_ROLE } from "@/constants/auth";
import { Text } from "@/components/ui/text";

type AuthPanelProps = {
  role: AppRole;
  session: MockAuthSession;
  disabled?: boolean;
  onRoleChange: (role: AppRole) => void;
};

export function AuthPanel({
  role,
  session,
  disabled = false,
  onRoleChange,
}: AuthPanelProps) {
  function handleRoleChange(value: string) {
    if (!isAppRole(value)) return;
    onRoleChange(value);
  }

  return (
    <section className="rounded-2xl border border-white/[.08] bg-white/[.04] p-4 text-white">
      <div className="space-y-1">
        <Text as="p" variant="sectionTitle">
          {AUTH_PANEL_COPY.title}
        </Text>
        <Text variant="captionStrong">
          {ROLE_HELPER_COPY_BY_ROLE[role]}
        </Text>
      </div>

      <div className="mt-4 rounded-2xl border border-white/[.08] bg-white/[.04] px-4 py-3">
        <Text variant="caption" className="mb-2 block">
          {AUTH_PANEL_COPY.modeLabel}
        </Text>
        <Select
          value={role}
          onChange={(event) => handleRoleChange(event.target.value)}
          disabled={disabled}
          fullWidth
          controlSize="md"
          variant="dark"
        >
          <option value="user">{AUTH_PANEL_COPY.userModeLabel}</option>
          <option value="manager">{AUTH_PANEL_COPY.managerModeLabel}</option>
        </Select>
      </div>

      <div className="mt-4 rounded-2xl border border-white/[.08] bg-white/[.04] px-4 py-3">
        <Text as="p" variant="bodyStrong">
          {session.name}
        </Text>
        <Text variant="captionStrong" className="mt-1 block">
          Email: {session.email}
        </Text>
        <Text variant="caption">
          {session.team} · {AUTH_PANEL_COPY.managerLabelPrefix}: {session.manager}
        </Text>
        {session.role === "manager" ? (
          <Text variant="caption" className="mt-2 block">
            {AUTH_PANEL_COPY.directReportsLabel}:{" "}
            {session.managedEmployees.map((employee) => employee.name).join(", ")}
          </Text>
        ) : null}
      </div>
    </section>
  );
}
