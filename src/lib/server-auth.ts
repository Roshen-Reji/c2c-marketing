import "server-only";

import type { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export type ServerRole = "student" | "admin" | "organiser" | "evaluator";

export interface ServerUser {
  uid: string;
  email: string;
  role: ServerRole;
  fullName: string;
}

const ROLE_COLLECTIONS: { collection: string; role: ServerRole }[] = [
  { collection: "admins", role: "admin" },
  { collection: "organisers", role: "organiser" },
  { collection: "evaluators", role: "evaluator" },
  { collection: "students", role: "student" },
];

export class ApiAuthError extends Error {
  constructor(
    message: string,
    public status: 401 | 403 = 401,
  ) {
    super(message);
  }
}

export async function requireUser(
  request: NextRequest | Request,
  allowedRoles?: ServerRole[],
): Promise<ServerUser> {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) throw new ApiAuthError("Authentication required.");

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch {
    throw new ApiAuthError("Your session is invalid or has expired.");
  }

  for (const item of ROLE_COLLECTIONS) {
    const snapshot = await adminDb.collection(item.collection).doc(decoded.uid).get();
    if (!snapshot.exists) continue;

    const data = snapshot.data() || {};
    const role = (data.role || item.role) as ServerRole;
    if (allowedRoles && !allowedRoles.includes(role)) {
      throw new ApiAuthError("You do not have permission to perform this action.", 403);
    }

    return {
      uid: decoded.uid,
      email: decoded.email || String(data.email || ""),
      role,
      fullName: String(data.fullName || data.name || ""),
    };
  }

  throw new ApiAuthError("No platform profile is linked to this account.", 403);
}

export function authErrorResponse(error: unknown) {
  if (error instanceof ApiAuthError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  return null;
}
