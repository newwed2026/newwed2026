import { HttpError } from "@/server/http";

const requestIdPattern = /^[A-Za-z0-9._:-]{8,128}$/;

export function requestIdFrom(request: Request) {
  const supplied = request.headers.get("x-request-id")?.trim();
  return supplied && requestIdPattern.test(supplied) ? supplied : crypto.randomUUID();
}

export function responseWithRequestId(response: Response, requestId: string) {
  response.headers.set("x-request-id", requestId);
  return response;
}

export async function readJsonWithLimit(request: Request, maxBytes: number) {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > maxBytes) throw new HttpError(413,"PAYLOAD_TOO_LARGE","O payload excede o limite permitido.");
  const body = await request.arrayBuffer();
  if (body.byteLength > maxBytes) throw new HttpError(413,"PAYLOAD_TOO_LARGE","O payload excede o limite permitido.");
  try { return JSON.parse(new TextDecoder().decode(body)) as unknown; }
  catch { throw new HttpError(400,"INVALID_JSON","O payload JSON é inválido."); }
}

export function logContext(requestId: string, fields: Record<string,unknown> = {}) {
  return { requestId,...fields };
}
