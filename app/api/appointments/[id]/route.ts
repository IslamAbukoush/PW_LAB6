import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/auth";
import { deleteAppointment, getAppointment, updateAppointment } from "@/lib/appointments";
import { authError, jsonError, readJsonBody } from "@/lib/responses";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = authorize(request.headers.get("authorization"), "READ");

  if (!auth.ok) {
    return authError(auth);
  }

  const { id } = await context.params;
  const appointment = getAppointment(id);

  if (!appointment) {
    return jsonError(404, "Appointment not found.");
  }

  return NextResponse.json(appointment, {
    status: 200,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = authorize(request.headers.get("authorization"), "WRITE");

  if (!auth.ok) {
    return authError(auth);
  }

  const { id } = await context.params;
  const body = await readJsonBody(request);
  const result = updateAppointment(id, body);

  if (!result.ok) {
    return jsonError(400, result.error);
  }

  if (!result.value) {
    return jsonError(404, "Appointment not found.");
  }

  return NextResponse.json(result.value, { status: 200 });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = authorize(request.headers.get("authorization"), "DELETE");

  if (!auth.ok) {
    return authError(auth);
  }

  const { id } = await context.params;
  const deleted = deleteAppointment(id);

  if (!deleted) {
    return jsonError(404, "Appointment not found.");
  }

  return new NextResponse(null, { status: 204 });
}
