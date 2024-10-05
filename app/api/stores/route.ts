import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import Logger from "@/logger/Logger";
import prismadb from "@/lib/prismadb";

const SHOW_LOGS = true;
const TAG = "[[STORES_API_ROUTE]]";

export async function POST(
    req: Request,
) {
    try {
        Logger.info(SHOW_LOGS, TAG, "In POST method");
        const { userId } = auth();
        const body = await req.json();

        if (!userId) {
            Logger.error(SHOW_LOGS, TAG, "User not authorized");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!body.name) {
            Logger.error(SHOW_LOGS, TAG, "Name is required");
            return new NextResponse("Name is required", { status: 400 });
        }

        const store = await prismadb.store.create({
            data: {
                name: body.name,
                userId,
            }
        });

        Logger.info(SHOW_LOGS, TAG, `Store created: ${store.id}`);
        return NextResponse.json(store);
    } catch (error) {
        Logger.error(SHOW_LOGS, TAG, `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}