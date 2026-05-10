import { createHmac, timingSafeEqual } from "node:crypto";

export type Role = "ADMIN" | "WRITER" | "VISITOR";
export type Permission = "READ" | "WRITE" | "DELETE";

export type TokenPayload = {
  sub: string;
  role: Role;
  permissions: Permission[];
  iat: number;
  exp: number;
};

export type TokenRequest = {
  role?: Role;
  permissions?: Permission[];
};

export type IssuedToken = {
  token: string;
  tokenType: "Bearer";
  expiresIn: number;
  expiresAt: string;
  role: Role;
  permissions: Permission[];
};

export type AuthResult =
  | {
      ok: true;
      payload: TokenPayload;
    }
  | {
      ok: false;
      status: 401 | 403;
      error: string;
    };

export const tokenTtlSeconds = 60;
export const permissionOptions: Permission[] = ["READ", "WRITE", "DELETE"];
export const roleOptions: Role[] = ["ADMIN", "WRITER", "VISITOR"];

export const rolePermissions: Record<Role, Permission[]> = {
  ADMIN: ["READ", "WRITE", "DELETE"],
  WRITER: ["READ", "WRITE"],
  VISITOR: ["READ"]
};

const jwtSecret = process.env.JWT_SECRET ?? "lab7-development-secret-change-me-before-production";

export function issueToken(request: TokenRequest = {}): IssuedToken {
  const role = request.role ?? "VISITOR";

  if (!roleOptions.includes(role)) {
    throw new Error("role must be ADMIN, WRITER, or VISITOR.");
  }

  const permissions = request.permissions?.length ? request.permissions : rolePermissions[role];
  const invalidPermission = permissions.find((permission) => !permissionOptions.includes(permission));

  if (invalidPermission) {
    throw new Error("permissions can contain only READ, WRITE, and DELETE.");
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + tokenTtlSeconds;
  const payload: TokenPayload = {
    sub: "lab7-demo-user",
    role,
    permissions: Array.from(new Set(permissions)),
    iat: issuedAt,
    exp: expiresAt
  };

  return {
    token: signJwt(payload),
    tokenType: "Bearer",
    expiresIn: tokenTtlSeconds,
    expiresAt: new Date(expiresAt * 1000).toISOString(),
    role,
    permissions: payload.permissions
  };
}

export function authorize(authorizationHeader: string | null, permission: Permission): AuthResult {
  const token = authorizationHeader?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    return { ok: false, status: 401, error: "Missing Bearer token." };
  }

  const payload = verifyJwt(token);

  if (!payload) {
    return { ok: false, status: 401, error: "Invalid or expired token." };
  }

  if (!payload.permissions.includes(permission)) {
    return { ok: false, status: 403, error: `Token does not include ${permission} permission.` };
  }

  return { ok: true, payload };
}

function signJwt(payload: TokenPayload) {
  const header = {
    alg: "HS256",
    typ: "JWT"
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = createSignature(`${encodedHeader}.${encodedPayload}`);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyJwt(token: string): TokenPayload | null {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = createSignature(`${encodedHeader}.${encodedPayload}`);

  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as TokenPayload;
    const now = Math.floor(Date.now() / 1000);

    if (
      payload.exp <= now ||
      !roleOptions.includes(payload.role) ||
      !Array.isArray(payload.permissions) ||
      payload.permissions.some((permission) => !permissionOptions.includes(permission))
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function createSignature(value: string) {
  return createHmac("sha256", jwtSecret).update(value).digest("base64url");
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function safeEqual(first: string, second: string) {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);

  return firstBuffer.length === secondBuffer.length && timingSafeEqual(firstBuffer, secondBuffer);
}
