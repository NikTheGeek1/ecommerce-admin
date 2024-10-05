import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import Logger from "@/logger/Logger";
import prismadb from "@/lib/prismadb";

const SHOW_LOGS = true;
const TAG = "[[CATEGORIES_API_ROUTE]]";

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        Logger.info(SHOW_LOGS, TAG, "In POST method");
        const { userId } = auth();
        const body = await req.json();

        const { name, billboardId } = body;

        if (!userId) {
            Logger.error(SHOW_LOGS, TAG, "User not authenticated");
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!name) {
            Logger.error(SHOW_LOGS, TAG, "Name is required");
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!billboardId) {
            Logger.error(SHOW_LOGS, TAG, "Billboard ID is required");
            return new NextResponse("Billboard ID is required", { status: 400 });
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

        const category = await prismadb.category.create({
            data: {
                name,
                billboardId,
                storeId: params.storeId,
            }
        });

        Logger.info(SHOW_LOGS, TAG, `Category created: ${category.id}`);
        return NextResponse.json(category);
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

        const categories = await prismadb.category.findMany({
            where: {
                storeId: params.storeId,
            },
        });

        Logger.info(SHOW_LOGS, TAG, `Categories found: ${categories.length}`);
        return NextResponse.json(categories);
    } catch (error) {
        Logger.error(SHOW_LOGS, TAG, `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}