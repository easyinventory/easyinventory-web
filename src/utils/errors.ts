export function extractApiError(err: unknown): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as Record<string, unknown>).response === "object" &&
    (err as { response?: { data?: { detail?: unknown } } }).response?.data?.detail
  ) {
    const detail = (err as { response: { data: { detail: unknown } } }).response
      .data.detail;
    if (typeof detail === "string") {
      return detail;
    }
  }

  return "Something went wrong. Please try again.";
}
