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
    <section className="rounded-2xl bg-white p-4 text-slate-900 shadow-sm">
      <div className="space-y-1">
        <Text as="p" variant="body" className="font-medium text-slate-900">
          {AUTH_PANEL_COPY.title}
        </Text>
        <Text variant="caption" className="text-slate-500">
          {ROLE_HELPER_COPY_BY_ROLE[role]}
        </Text>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <Text variant="caption" className="mb-2 block text-slate-600">
          {AUTH_PANEL_COPY.modeLabel}
        </Text>
        <Select
          value={role}
          onChange={(event) => handleRoleChange(event.target.value)}
          disabled={disabled}
          fullWidth
          controlSize="md"
        >
          <option value="user">{AUTH_PANEL_COPY.userModeLabel}</option>
          <option value="manager">{AUTH_PANEL_COPY.managerModeLabel}</option>
        </Select>

        <Text as="p" className="text-sm font-medium text-slate-900">
          <span className="mt-3 inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
            {session.roleLabel}
          </span>
        </Text>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <Text as="p" className="text-sm font-medium text-slate-900">
          {session.name}
        </Text>
        <Text variant="caption" className="mt-1 block text-slate-600">
          {session.email}
        </Text>
        <Text variant="caption" className="block text-slate-500">
          {session.team} · {AUTH_PANEL_COPY.managerLabelPrefix}: {session.manager}
        </Text>
        {session.role === "manager" ? (
          <Text variant="caption" className="mt-2 block text-slate-500">
            {AUTH_PANEL_COPY.directReportsLabel}:{" "}
            {session.managedEmployees.map((employee) => employee.name).join(", ")}
          </Text>
        ) : null}
      </div>
    </section>
  );
}
