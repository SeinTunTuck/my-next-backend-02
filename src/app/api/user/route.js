//src/app/api/user/route.js

import { getCorsHeaders } from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { isAdmin } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/utils";
import { ObjectId } from "mongodb";

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

export async function GET(request) {
  if (!isAdmin(request)) {
    return errorResponse("Unauthorized Request", 403, request);
  }

  const searchParams = request.nextUrl.searchParams;
  const pageParam = searchParams.get("page") || "1";

  let page = Number(pageParam) - 1;
  page = page < 0 ? 0 : page; //Ensure that page not less than 0.!!
  const size = 10;

  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const result = await db
      .collection("user")
      .find({}, { projection: { password: 0 } })
      .skip(page * size)
      .limit(size)
      .toArray();
    const output = {
      users: result,
      page: page,
      size: size,
    };
    return successResponse(output, 200, request);
  } catch (error) {
    console.log("==>GET user exception");
    console.log(error);
    return errorResponse("GET User Internal Error", 500, request);
  }
}

export async function POST(request) {
  if (!isAdmin(request)) {
    return errorResponse("Unauthorized Request", 403, request);
  }
  const data = await request.json();
  const username = data.username;
  const email = data.email;
  const password = data.password;
  const firstname = data.firstname;
  const lastname = data.lastname;
  if (!username || !email || !password) {
    return errorResponse("Missing mandatory data", 400, request);
  }

  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const result = await db.collection("user").insertOne({
      username: username,
      email: email,
      firstname: firstname,
      lastname: lastname,
      password: await bcrypt.hash(password, 12),
      status: "ACTIVE",
    });
    console.log("==>Insert User Result:", result);
    return successResponse({ id: result.insertedId }, 200, request);
  } catch (error) {
    console.log("==>POST user exception");
    const errorResponseMessage = error.errorResponse.errmsg;
    console.log(errorResponseMessage);
    let errorType;
    let errorMsg;
    if (errorResponseMessage.includes("duplicate")) {
      errorMsg = errorResponseMessage.includes("username")
        ? "username"
        : "email";
      errorType = "Duplicate Data";
    } else {
      errorType = "Others";
      errorMsg = errorResponseMessage;
    }
    return NextResponse.json(
      {
        errorType: errorType,
        errorMsg: errorMsg,
      },
      {
        status: 400,
        headers: getCorsHeaders(request),
      },
    );
  }
}

export async function PUT(request) {
  if (!isAdmin(request)) {
    return errorResponse("Unauthorized Request", 403, request);
  }

  const data = await request.json();
  const userId = data.userId;
  const password = data.password;

  if (!userId || !password) {
    return errorResponse("Missing user ID or password", 400, request);
  }

  if (!ObjectId.isValid(userId)) {
    return errorResponse("Invalid user ID", 400, request);
  }

  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const updateResult = await db.collection("user").updateOne(
      {
        _id: new ObjectId(userId),
      },
      {
        $set: {
          password: await bcrypt.hash(password, 12),
        },
      },
    );

    if (updateResult.matchedCount === 0) {
      return errorResponse("User not found", 404, request);
    }

    return successResponse(
      { message: "Password changed successfully" },
      200,
      request,
    );
  } catch (error) {
    console.log("==>PUT user exception");
    console.log(error);
    return errorResponse("PUT User Internal Error", 500, request);
  }
}
