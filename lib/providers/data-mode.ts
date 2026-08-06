export function getDataMode(): "mock" | "live" {
  return process.env.DATA_MODE === "live" ? "live" : "mock";
}
