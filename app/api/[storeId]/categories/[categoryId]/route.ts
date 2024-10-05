import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import Logger from "@/logger/Logger";
import prismadb from "@/lib/prismadb";

const SHOW_LOGS = true;
const TAG = '[[CATEGORY_ID_ROUTE]]';

export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string, categoryId: string } },
) {
    try {
        const { userId } = auth();
        const body = await req.json();

        const { name, billboardId } = body;

        if (!userId) {
            Logger.error(SHOW_LOGS, TAG + "|PATCH", "User Unauthenticated");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!name) {
            Logger.error(SHOW_LOGS, TAG + "|PATCH", "Name is required");
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!billboardId) {
            Logger.error(SHOW_LOGS, TAG + "|PATCH", "Billboard ID is required");
            return new NextResponse("Billboard ID is required", { status: 400 });
        }

        if (!params.categoryId) {
            Logger.error(SHOW_LOGS, TAG + "|PATCH", "Category ID is required");
            return new NextResponse("Category ID is required", { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId,
            },
        });

        if (!storeByUserId) {
            Logger.error(SHOW_LOGS, TAG, "User is not authorized to create category for this store");
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const category = await prismadb.category.update({
            where: {
                id: params.categoryId,
            },
            data: {
                name,
                billboardId,
            },
        });

        Logger.info(SHOW_LOGS, TAG + "|PATCH", `Store updated: ${category.id}`);
        return NextResponse.json(category);
    } catch (error) {
        Logger.error(SHOW_LOGS, TAG + "|PATCH", `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string, categoryId: string } },
) {
    try {
        const { userId } = auth();

        if (!userId) {
            Logger.error(SHOW_LOGS, TAG + "|DELETE", "User Unauthenticated");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!params.categoryId) {
            Logger.error(SHOW_LOGS, TAG + "|DELETE", "Category ID is required");
            return new NextResponse("Category ID is required", { status: 400 });
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
            Logger.error(SHOW_LOGS, TAG, "User is not authorized to create category for this store");
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const category = await prismadb.category.delete({
            where: {
                id: params.categoryId,
            }
        });

        Logger.info(SHOW_LOGS, TAG + "|DELETE", `Category updated: ${category.id}`);
        return NextResponse.json(category);
    } catch (error) {
        Logger.error(SHOW_LOGS, TAG + "|DELETE", `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


export async function GET(
    req: Request,
    { params }: { params: { categoryId: string } }
) {
    try {
        Logger.info(SHOW_LOGS, TAG, "In GET method");

        if (!params.categoryId) {
            Logger.error(SHOW_LOGS, TAG, "Category ID is required");
            return new NextResponse("Category ID is required", { status: 400 });
        }

        const category = await prismadb.category.findUnique({
            where: {
                id: params.categoryId,
            },
            include: {
                billboard: true,
            }
        });

        if (!category) {
            Logger.error(SHOW_LOGS, TAG, "Category not found");
            return new NextResponse("Category not found", { status: 404 });
        }

        return NextResponse.json(category);
    } catch (error) {
        Logger.error(SHOW_LOGS, TAG, `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}