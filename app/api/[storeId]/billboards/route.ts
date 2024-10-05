import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import Logger from "@/logger/Logger";
import prismadb from "@/lib/prismadb";

const SHOW_LOGS = true;
const TAG = "[[BILLBOARDS_API_ROUTE]]";

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        Logger.info(SHOW_LOGS, TAG, "In POST method");
        const { userId } = auth();
        const body = await req.json();

        if (!userId) {
            Logger.error(SHOW_LOGS, TAG, "User not authenticated");
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!body.label) {
            Logger.error(SHOW_LOGS, TAG, "Label is required");
            return new NextResponse("Label is required", { status: 400 });
        }

        if (!body.imageUrl) {
            Logger.error(SHOW_LOGS, TAG, "Image URL is required");
            return new NextResponse("Image URL is required", { status: 400 });
        }

        if (!params.storeId) {
            Logger.error(SHOW_LOGS, TAG, "Store ID is required");
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

        const billboard = await prismadb.billboard.create({
            data: {
                label: body.label,
                imageUrl: body.imageUrl,
                storeId: params.storeId,
            }
        });

        Logger.info(SHOW_LOGS, TAG, `Billboard created: ${billboard.id}`);
        return NextResponse.json(billboard);
    } catch (error) {
        Logger.error(SHOW_LOGS, TAG, `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        Logger.info(SHOW_LOGS, TAG, "In GET method");

        if (!params.storeId) {
            Logger.error(SHOW_LOGS, TAG, "Store ID is required");
            return new NextResponse("Store ID is required", { status: 400 });
        }

        const billboards = await prismadb.billboard.findMany({
            where: {
                storeId: params.storeId,
            },
        });

        Logger.info(SHOW_LOGS, TAG, `Billboards found: ${billboards.length}`);
        return NextResponse.json(billboards);
    } catch (error) {
        Logger.error(SHOW_LOGS, TAG, `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}