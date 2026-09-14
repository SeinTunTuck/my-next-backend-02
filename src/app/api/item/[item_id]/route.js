// src/app/api/item/[item_id]/route.js

import { getCorsHeaders } from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { errorResponse, printExceptionLog, successResponse } from "@/lib/utils";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  const { item_id } = await params;

  if (!ObjectId.isValid(item_id)) {
    return errorResponse("Invalid item ID", 400, request);
  }

  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const item = await db.collection("item").findOne({
      _id: new ObjectId(item_id),
      status: { $ne: "DELETED" },
    });
    if (item) {
      return successResponse(
        {
          item,
        },
        200,
        request,
      );
    } else return errorResponse("Item not found", 404, request);
  } catch (error) {
    printExceptionLog("GET Item Exception", error);
    return errorResponse("GET Item Internal Error", 500, request);
  }
}

export async function DELETE(request, { params }) {
  const { item_id } = await params;

  if (!ObjectId.isValid(item_id)) {
    return errorResponse("Invalid item ID", 400, request);
  }

  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const deleteResult = await db.collection("item").updateOne(
      {
        _id: new ObjectId(item_id),
        status: { $ne: "DELETED" },
      },
      {
        $set: {
          status: "DELETED",
        },
      },
    );

    if (deleteResult.matchedCount === 0) {
      return errorResponse("Item not found or already deleted", 404, request);
    }

    return successResponse({ message: "Item deleted successfully" }, 200, request);
  } catch (error) {
    printExceptionLog("DELETE Item Exception", error);
    return errorResponse("DELETE Item Internal Error", 500, request);
  }
}

export async function PUT(request, { params }) {
  const { item_id } = await params;

  if (!ObjectId.isValid(item_id)) {
    return errorResponse("Invalid item ID", 400, request);
  }

  try {
    const data = await request.json();
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const updatedResult = await db.collection("item").updateOne(
      {
        _id: new ObjectId(item_id),
        status: { $ne: "DELETED" },
      },
      {
        $set: {
          name: data.name,
          price: data.price,
          amount: data.amount,
          category: data.category,
          status: "ACTIVE",
        },
      },
    );

    if (updatedResult.matchedCount === 0) {
      return errorResponse("Item not found or deleted", 404, request);
    }

    return successResponse({ message: "Item updated successfully" }, 200, request);
  } catch (error) {
    printExceptionLog("PUT Item Exception", error);
    return errorResponse("PUT Item Internal Error", 500, request);
  }
}

export async function OPTIONS(request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}
