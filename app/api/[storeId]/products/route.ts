import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import Logger from "@/logger/Logger";
import prismadb from "@/lib/prismadb";

const SHOW_LOGS = true;
const TAG = "[[PRODUCT_API_ROUTE]]";

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        Logger.info(SHOW_LOGS, TAG, "In POST method");
        const { userId } = auth();
        const body = await req.json();

        const {
            name,
            price,
            categoryId,
            colorId,
            sizeId,
            images,
            isFeatured,
            isArchived,
        } = body;


        if (!userId) {
            Logger.error(SHOW_LOGS, TAG, "User not authenticated");
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!name) {
            Logger.error(SHOW_LOGS, TAG, "Name is required");
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!price) {
            Logger.error(SHOW_LOGS, TAG, "Price is required");
            return new NextResponse("Price is required", { status: 400 });
        }

        if (!categoryId) {
            Logger.error(SHOW_LOGS, TAG, "Category ID is required");
            return new NextResponse("Category ID is required", { status: 400 });
        }

        if (!colorId) {
            Logger.error(SHOW_LOGS, TAG, "Color ID is required");
            return new NextResponse("Color ID is required", { status: 400 });
        }

        if (!sizeId) {
            Logger.error(SHOW_LOGS, TAG, "Size ID is required");
            return new NextResponse("Size ID is required", { status: 400 });
        }

        if (!images || images.length === 0) {
            Logger.error(SHOW_LOGS, TAG, "Images are required");
            return new NextResponse("Images are required", { status: 400 });
        }

        if (isFeatured !== true && isFeatured !== false) {
            Logger.error(SHOW_LOGS, TAG, "Is Featured is required");
            return new NextResponse("Is Featured is required", { status: 400 });
        }

        if (isArchived !== true && isArchived !== false) {
            Logger.error(SHOW_LOGS, TAG, "Is Archived is required");
            return new NextResponse("Is Archived is required", { status: 400 });
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
            Logger.error(SHOW_LOGS, TAG, "User is not authorized to create product for this store");
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const product = await prismadb.product.create({
            data: {
                name,
                price,
                storeId: params.storeId,
                categoryId,
                colorId,
                sizeId,
                images: {
                    createMany: {
                        data: [...images.map((image: { url: string }) => image)],
                    },
                },
                isFeatured,
                isArchived,
            }
        });

        Logger.info(SHOW_LOGS, TAG, `Product created: ${product.id}`);
        return NextResponse.json(product);
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

        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get("categoryId") || undefined;
        const colorId = searchParams.get("colorId") || undefined;
        const sizeId = searchParams.get("sizeId") || undefined;
        const isFeatured = searchParams.get("isFeatured");

        if (!params.storeId) {
            Logger.error(SHOW_LOGS, TAG, "Store ID is required");
            return new NextResponse("Store ID is required", { status: 400 });
        }

        const products = await prismadb.product.findMany({
            where: {
                storeId: params.storeId,
                categoryId,
                colorId,
                sizeId,
                isFeatured: isFeatured ? true : undefined, // we don't want to use false value because 'undefined' completely ignores this field
                isArchived: false // we never want to show archived products
            },
            include: {
                images: true,
                category: true,
                color: true,
                size: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        Logger.info(SHOW_LOGS, TAG, `Products found: ${products.length}`);
        return NextResponse.json(products);
    } catch (error) {
        Logger.error(SHOW_LOGS, TAG, `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}