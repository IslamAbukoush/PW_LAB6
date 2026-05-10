import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/auth";
import { createAppointment, listAppointments, parseListParams } from "@/lib/appointments";
import { authError, jsonError, readJsonBody } from "@/lib/responses";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const auth = authorize(request.headers.get("authorization"), "READ");

  if (!auth.ok) {
    return authError(auth);
  }

  const params = parseListParams(request.nextUrl.searchParams);

  if (!params.ok) {
    return jsonError(400, params.error);
  }

  return NextResponse.json(listAppointments(params.value), {
    status: 200,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

export async function POST(request: NextRequest) {
  const auth = authorize(request.headers.get("authorization"), "WRITE");

  if (!auth.ok) {
    return authError(auth);
  }

  const body = await readJsonBody(request);
  const result = createAppointment(body);

  if (!result.ok) {
    return jsonError(400, result.error);
  }

  return NextResponse.json(result.value, {
    status: 201,
    headers: {
      Location: `/api/appointments/${result.value.id}`
    }
  });
}
