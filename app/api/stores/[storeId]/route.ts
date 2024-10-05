import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import Logger from "@/logger/Logger";
import prismadb from "@/lib/prismadb";

const SHOW_LOGS = true;
const TAG = '[[STOREID_ROUTE]]';

export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string } },
) {
    try {
        const { userId } = auth();
        const body = await req.json();

        const { name } = body;

        if(!userId) {
            Logger.error(SHOW_LOGS, TAG+"|PATCH", "User Unauthenticated");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!name) {
            Logger.error(SHOW_LOGS, TAG+"|PATCH", "Name is required");
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!params.storeId) {
            Logger.error(SHOW_LOGS, TAG+"|PATCH", "Store ID is required");
            return new NextResponse("Store ID is required", { status: 400 });
        }

        const store = await prismadb.store.update({
            where: {
                id: params.storeId,
                userId,
            },
            data: {
                name,
            },
        });

        Logger.info(SHOW_LOGS, TAG+"|PATCH", `Store updated: ${store.id}`);
        return NextResponse.json(store);
    } catch(error) {
        Logger.error(SHOW_LOGS, TAG+"|PATCH", `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string } },
) {
    try {
        const { userId } = auth();

        if(!userId) {
            Logger.error(SHOW_LOGS, TAG+"|DELETE", "User Unauthenticated");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!params.storeId) {
            Logger.error(SHOW_LOGS, TAG+"|DELETE", "Store ID is required");
            return new NextResponse("Store ID is required", { status: 400 });
        }

        const store = await prismadb.store.delete({
            where: {
                id: params.storeId,
                userId,
            }
        });

        Logger.info(SHOW_LOGS, TAG+"|DELETE", `Store updated: ${store.id}`);
        return NextResponse.json(store);
    } catch(error) {
        Logger.error(SHOW_LOGS, TAG+"|DELETE", `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
