import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import Logger from "@/logger/Logger";
import prismadb from "@/lib/prismadb";

const SHOW_LOGS = true;
const TAG = "[[COLORS_API_ROUTE]]";

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        Logger.info(SHOW_LOGS, TAG, "In POST method");
        const { userId } = auth();
        const body = await req.json();

        const { name, value } = body;

        if (!userId) {
            Logger.error(SHOW_LOGS, TAG, "User not authenticated");
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!name) {
            Logger.error(SHOW_LOGS, TAG, "Name is required");
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!value) {
            Logger.error(SHOW_LOGS, TAG, "Value is required");
            return new NextResponse("Value is required", { status: 400 });
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
            Logger.error(SHOW_LOGS, TAG, "User is not authorized to create color for this store");
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const color = await prismadb.color.create({
            data: {
                name,
                value,
                storeId: params.storeId,
            }
        });

        Logger.info(SHOW_LOGS, TAG, `Color created: ${color.id}`);
        return NextResponse.json(color);
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

        const colors = await prismadb.color.findMany({
            where: {
                storeId: params.storeId,
            },
        });

        Logger.info(SHOW_LOGS, TAG, `Colors found: ${colors.length}`);
        return NextResponse.json(colors);
    } catch (error) {
        Logger.error(SHOW_LOGS, TAG, `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}