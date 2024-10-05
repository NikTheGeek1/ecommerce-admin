import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import Logger from "@/logger/Logger";
import prismadb from "@/lib/prismadb";

const SHOW_LOGS = true;
const TAG = '[[COLOR_ID_ROUTE]]';

export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string, colorId: string } },
) {
    try {
        const { userId } = auth();
        const body = await req.json();

        const { name, value } = body;

        if (!userId) {
            Logger.error(SHOW_LOGS, TAG + "|PATCH", "User Unauthenticated");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!name) {
            Logger.error(SHOW_LOGS, TAG + "|PATCH", "Name is required");
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!value) {
            Logger.error(SHOW_LOGS, TAG + "|PATCH", "Value is required");
            return new NextResponse("Value is required", { status: 400 });
        }

        if (!params.colorId) {
            Logger.error(SHOW_LOGS, TAG + "|PATCH", "Color ID is required");
            return new NextResponse("Color ID is required", { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId,
            },
        });

        if (!storeByUserId) {
            Logger.error(SHOW_LOGS, TAG, "User is not authorized to create color for this store");
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const color = await prismadb.color.update({
            where: {
                id: params.colorId,
            },
            data: {
                name,
                value,
            },
        });

        Logger.info(SHOW_LOGS, TAG + "|PATCH", `Color updated: ${color.id}`);
        return NextResponse.json(color);
    } catch (error) {
        Logger.error(SHOW_LOGS, TAG + "|PATCH", `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string, colorId: string } },
) {
    try {
        const { userId } = auth();

        if (!userId) {
            Logger.error(SHOW_LOGS, TAG + "|DELETE", "User Unauthenticated");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!params.colorId) {
            Logger.error(SHOW_LOGS, TAG + "|DELETE", "Color ID is required");
            return new NextResponse("Color ID is required", { status: 400 });
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
            Logger.error(SHOW_LOGS, TAG, "User is not authorized to create color for this store");
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const color = await prismadb.color.delete({
            where: {
                id: params.colorId,
            }
        });

        Logger.info(SHOW_LOGS, TAG + "|DELETE", `Color updated: ${color.id}`);
        return NextResponse.json(color);
    } catch (error) {
        Logger.error(SHOW_LOGS, TAG + "|DELETE", `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


export async function GET(
    req: Request,
    { params }: { params: { colorId: string } }
) {
    try {
        Logger.info(SHOW_LOGS, TAG, "In GET method");

        if (!params.colorId) {
            Logger.error(SHOW_LOGS, TAG, "Color ID is required");
            return new NextResponse("Color ID is required", { status: 400 });
        }

        const color = await prismadb.color.findUnique({
            where: {
                id: params.colorId,
            },
        });

        if (!color) {
            Logger.error(SHOW_LOGS, TAG, "Color not found");
            return new NextResponse("Color not found", { status: 404 });
        }

        return NextResponse.json(color);
    } catch (error) {
        Logger.error(SHOW_LOGS, TAG, `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}