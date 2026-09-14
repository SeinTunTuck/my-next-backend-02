// src/lib/utils.js

import { NextResponse } from "next/server";
import { getCorsHeaders } from "./cors";
export function printExceptionLog(logMessage, error) {
  console.log(`==>${logMessage} Exception`);
  console.log(error);
}
export function errorResponse(message, status, request) {
  return NextResponse.json(
    {
      message: message,
    },
    {
      status: status,
      headers: getCorsHeaders(request),
    },
  );
}
export function successResponse(jsonData, status, request) {
  return NextResponse.json(jsonData, {
    status: status,
    headers: getCorsHeaders(request),
  });
}
