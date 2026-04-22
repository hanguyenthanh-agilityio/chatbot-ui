export function leaveTypeLabel(value: unknown): string {
  switch (value) {
    case "annual":
      return "Annual leave";
    case "sick":
      return "Sick leave";
    case "personal":
      return "Personal leave";
    case "unpaid":
      return "Unpaid leave";
    default:
      return typeof value === "string" ? value : "Time off";
  }
}
