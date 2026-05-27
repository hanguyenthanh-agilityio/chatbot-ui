import "@testing-library/jest-dom/vitest";

// Keep Intl date snapshots identical on CI (UTC) and local machines.
process.env.TZ = "UTC";
