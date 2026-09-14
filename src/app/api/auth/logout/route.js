//src/app/api/auth/logout/route.js

import { getCorsHeaders } from "@/lib/cors";
import { NextResponse } from "next/server";

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

export async function GET(request) {
  const response = NextResponse.json(
    {
      message: "Logout successful",
    },
    {
      status: 200,
      headers: getCorsHeaders(request),
    },
  );
  response.cookies.set("token", "", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV == "development" ? "lax" : "none",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
