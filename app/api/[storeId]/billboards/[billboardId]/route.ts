import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import Logger from "@/logger/Logger";
import prismadb from "@/lib/prismadb";

const SHOW_LOGS = true;
const TAG = '[[BILLBOARD_ID_ROUTE]]';

export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string, billboardId: string } },
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

        if (!params.billboardId) {
            Logger.error(SHOW_LOGS, TAG + "|PATCH", "Billboard ID is required");
            return new NextResponse("Billboard ID is required", { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId,
            },
        });

        if (!storeByUserId) {
            Logger.error(SHOW_LOGS, TAG, "User is not authorized to create billboard for this store");
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const billboard = await prismadb.billboard.update({
            where: {
                id: params.billboardId,
            },
            data: {
                label,
                imageUrl,
            },
        });

        Logger.info(SHOW_LOGS, TAG + "|PATCH", `Store updated: ${billboard.id}`);
        return NextResponse.json(billboard);
    } catch (error) {
        Logger.error(SHOW_LOGS, TAG + "|PATCH", `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string, billboardId: string } },
) {
    try {
        const { userId } = auth();

        if (!userId) {
            Logger.error(SHOW_LOGS, TAG + "|DELETE", "User Unauthenticated");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!params.billboardId) {
            Logger.error(SHOW_LOGS, TAG + "|DELETE", "Billboard ID is required");
            return new NextResponse("Billboard ID is required", { status: 400 });
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
            Logger.error(SHOW_LOGS, TAG, "User is not authorized to create billboard for this store");
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const billboard = await prismadb.billboard.delete({
            where: {
                id: params.billboardId,
            }
        });

        Logger.info(SHOW_LOGS, TAG + "|DELETE", `Billboard updated: ${billboard.id}`);
        return NextResponse.json(billboard);
    } catch (error) {
        Logger.error(SHOW_LOGS, TAG + "|DELETE", `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


export async function GET(
    req: Request,
    { params }: { params: { billboardId: string } }
) {
    try {
        Logger.info(SHOW_LOGS, TAG, "In GET method");

        if (!params.billboardId) {
            Logger.error(SHOW_LOGS, TAG, "Billboard ID is required");
            return new NextResponse("Billboard ID is required", { status: 400 });
        }

        const billboard = await prismadb.billboard.findUnique({
            where: {
                id: params.billboardId,
            },
        });

        if (!billboard) {
            Logger.error(SHOW_LOGS, TAG, "Billboard not found");
            return new NextResponse("Billboard not found", { status: 404 });
        }

        return NextResponse.json(billboard);
    } catch (error) {
        Logger.error(SHOW_LOGS, TAG, `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}