import { NextRequest, NextResponse } from "next/server";
import { issueToken, type Permission, type Role } from "@/lib/auth";
import { jsonError, readJsonBody } from "@/lib/responses";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get("role") as Role | null;
  const permissions = request.nextUrl.searchParams.get("permissions");

  return createTokenResponse({
    role: role ?? undefined,
    permissions: permissions ? (permissions.split(",").map((permission) => permission.trim()) as Permission[]) : undefined
  });
}

export async function POST(request: NextRequest) {
  const body = await readJsonBody(request);

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonError(400, "Request body must be a JSON object.");
  }

  const tokenRequest = body as {
    role?: Role;
    permissions?: Permission[];
  };

  return createTokenResponse(tokenRequest);
}

function createTokenResponse(tokenRequest: { role?: Role; permissions?: Permission[] }) {
  try {
    return NextResponse.json(issueToken(tokenRequest), {
      status: 200,
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return jsonError(400, error instanceof Error ? error.message : "Invalid token request.");
  }
}
