const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
].filter(Boolean);

export function getCorsHeaders(request) {
  const origin = request?.headers.get("origin");
  const allowedOrigin = allowedOrigins.includes(origin)
    ? origin
    : process.env.FRONTEND_URL || "http://localhost:5173";

  return {
    ...corsHeaders,
    "Access-Control-Allow-Origin": allowedOrigin,
  };
}

const corsHeaders = {
  "Access-Control-Allow-Credentials": "true",

  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",

  "Access-Control-Allow-Headers": "Content-Type, Authorization",

  "Access-Control-Max-Age": "86400",
};

export default corsHeaders;
