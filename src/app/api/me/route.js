//src/app/api/me/route.js

import { verifyJWT } from "@/lib/auth";
import { getCorsHeaders } from "@/lib/cors";
import { errorResponse } from "@/lib/utils";
import { NextResponse } from "next/server";

export function OPTIONS(request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

export function GET(request) {
  const user = verifyJWT(request);
  if (!user) {
    return errorResponse("Unauthorized Request", 401, request);
  }
  return NextResponse.json(user, {
    status: 201,
    headers: getCorsHeaders(request),
  });
}
