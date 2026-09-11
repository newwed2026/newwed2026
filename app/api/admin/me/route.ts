import { requireAccessUser } from "@/server/auth/access";
import { errorResponse, json } from "@/server/http";

export async function GET(request: Request) {
  try { return json(await requireAccessUser(request)); }
  catch (error) { return errorResponse(error); }
}
