/** Network failures must return control to the form instead of leaving it permanently busy. */
export async function formRequest(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(20000) });
  } catch {
    return Response.json({ error: "Connection interrupted. Please check your connection and try again." }, { status: 503 });
  }
}
