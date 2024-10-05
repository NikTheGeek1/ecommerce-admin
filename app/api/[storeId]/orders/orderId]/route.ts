import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import Logger from "@/logger/Logger";
import prismadb from "@/lib/prismadb";

const SHOW_LOGS = true;
const TAG = '[[ORDER_ID_ROUTE]]';

export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string, orderId: string } },
) {
    try {
        const { userId } = auth();
        const body = await req.json();

        const { label, imageUrl } = body;

        if (!userId) {
            Logger.error(SHOW_LOGS, TAG + "|PATCH", "User Unauthenticated");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!label) {
            Logger.error(SHOW_LOGS, TAG + "|PATCH", "Label is required");
            return new NextResponse("Label is required", { status: 400 });
        }

        if (!imageUrl) {
            Logger.error(SHOW_LOGS, TAG + "|PATCH", "Image URL is required");
            return new NextResponse("Image URL is required", { status: 400 });
        }

        if (!params.orderId) {
            Logger.error(SHOW_LOGS, TAG + "|PATCH", "Order ID is required");
            return new NextResponse("Order ID is required", { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId,
            },
        });

        if (!storeByUserId) {
            Logger.error(SHOW_LOGS, TAG, "User is not authorized to create order for this store");
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const order = await prismadb.order.update({
            where: {
                id: params.orderId,
            },
            data: {
                label,
                imageUrl,
            },
        });

        Logger.info(SHOW_LOGS, TAG + "|PATCH", `Store updated: ${order.id}`);
        return NextResponse.json(order);
    } catch (error) {
        Logger.error(SHOW_LOGS, TAG + "|PATCH", `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string, orderId: string } },
) {
    try {
        const { userId } = auth();

        if (!userId) {
            Logger.error(SHOW_LOGS, TAG + "|DELETE", "User Unauthenticated");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!params.orderId) {
            Logger.error(SHOW_LOGS, TAG + "|DELETE", "Order ID is required");
            return new NextResponse("Order ID is required", { status: 400 });
        }

        if (!params.storeId) {
            Logger.error(SHOW_LOGS, TAG + "|DELETE", "Store ID is required");
            return new NextResponse("Store ID is required", { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId,
            },
        });

        if (!storeByUserId) {
            Logger.error(SHOW_LOGS, TAG, "User is not authorized to create order for this store");
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const order = await prismadb.order.delete({
            where: {
                id: params.orderId,
            }
        });

        Logger.info(SHOW_LOGS, TAG + "|DELETE", `Order updated: ${order.id}`);
        return NextResponse.json(order);
    } catch (error) {
        Logger.error(SHOW_LOGS, TAG + "|DELETE", `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


export async function GET(
    req: Request,
    { params }: { params: { orderId: string } }
) {
    try {
        Logger.info(SHOW_LOGS, TAG, "In GET method");

        if (!params.orderId) {
            Logger.error(SHOW_LOGS, TAG, "Order ID is required");
            return new NextResponse("Order ID is required", { status: 400 });
        }

        const order = await prismadb.order.findUnique({
            where: {
                id: params.orderId,
            },
        });

        if (!order) {
            Logger.error(SHOW_LOGS, TAG, "Order not found");
            return new NextResponse("Order not found", { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        Logger.error(SHOW_LOGS, TAG, `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}