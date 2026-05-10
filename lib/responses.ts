import { NextResponse } from "next/server";
import type { AuthResult } from "./auth";

export function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export function authError(result: Extract<AuthResult, { ok: false }>) {
  return jsonError(result.status, result.error);
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
