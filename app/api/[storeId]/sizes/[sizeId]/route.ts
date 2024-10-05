import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import Logger from "@/logger/Logger";
import prismadb from "@/lib/prismadb";

const SHOW_LOGS = true;
const TAG = '[[SIZE_ID_ROUTE]]';

export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string, sizeId: string } },
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

        if (!params.sizeId) {
            Logger.error(SHOW_LOGS, TAG + "|PATCH", "Size ID is required");
            return new NextResponse("Size ID is required", { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId,
            },
        });

        if (!storeByUserId) {
            Logger.error(SHOW_LOGS, TAG, "User is not authorized to create size for this store");
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const size = await prismadb.size.update({
            where: {
                id: params.sizeId,
            },
            data: {
                name,
                value,
            },
        });

        Logger.info(SHOW_LOGS, TAG + "|PATCH", `Size updated: ${size.id}`);
        return NextResponse.json(size);
    } catch (error) {
        Logger.error(SHOW_LOGS, TAG + "|PATCH", `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string, sizeId: string } },
) {
    try {
        const { userId } = auth();

        if (!userId) {
            Logger.error(SHOW_LOGS, TAG + "|DELETE", "User Unauthenticated");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!params.sizeId) {
            Logger.error(SHOW_LOGS, TAG + "|DELETE", "Size ID is required");
            return new NextResponse("Size ID is required", { status: 400 });
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
            Logger.error(SHOW_LOGS, TAG, "User is not authorized to create size for this store");
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const size = await prismadb.size.delete({
            where: {
                id: params.sizeId,
            }
        });

        Logger.info(SHOW_LOGS, TAG + "|DELETE", `Size updated: ${size.id}`);
        return NextResponse.json(size);
    } catch (error) {
        Logger.error(SHOW_LOGS, TAG + "|DELETE", `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


export async function GET(
    req: Request,
    { params }: { params: { sizeId: string } }
) {
    try {
        Logger.info(SHOW_LOGS, TAG, "In GET method");

        if (!params.sizeId) {
            Logger.error(SHOW_LOGS, TAG, "Size ID is required");
            return new NextResponse("Size ID is required", { status: 400 });
        }

        const size = await prismadb.size.findUnique({
            where: {
                id: params.sizeId,
            },
        });

        if (!size) {
            Logger.error(SHOW_LOGS, TAG, "Size not found");
            return new NextResponse("Size not found", { status: 404 });
        }

        return NextResponse.json(size);
    } catch (error) {
        Logger.error(SHOW_LOGS, TAG, `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}