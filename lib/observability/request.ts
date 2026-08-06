import { log } from "@/lib/observability/log";

export type ApiRequestContext = {
  requestId: string;
  /** Response headers that must always be set (correlation). */
  headers: { "x-request-id": string };
  finish: (fields: {
    route: string;
    status: number;
    source?: string;
    degraded?: boolean;
  }) => void;
};

export function beginApiRequest(req: Request): ApiRequestContext {
  const requestId =
    req.headers.get("x-request-id")?.trim() || crypto.randomUUID();
  const started = Date.now();
  return {
    requestId,
    headers: { "x-request-id": requestId },
    finish(fields) {
      log("info", "api_request", {
        requestId,
        durationMs: Date.now() - started,
        ...fields,
      });
    },
  };
}
