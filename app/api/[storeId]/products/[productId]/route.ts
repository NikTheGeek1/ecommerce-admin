import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import Logger from "@/logger/Logger";
import prismadb from "@/lib/prismadb";

const SHOW_LOGS = true;
const TAG = '[[PRODUCT_ID_ROUTE]]';

export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string, productId: string } },
) {
    try {
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
            Logger.error(SHOW_LOGS, TAG + "|PATCH", "User Unauthenticated");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!name) {
            Logger.error(SHOW_LOGS, TAG + "|PATCH", "Name is required");
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!price) {
            Logger.error(SHOW_LOGS, TAG + "|PATCH", "Price is required");
            return new NextResponse("Price is required", { status: 400 });
        }

        if (!categoryId) {
            Logger.error(SHOW_LOGS, TAG + "|PATCH", "Category ID is required");
            return new NextResponse("Category ID is required", { status: 400 });
        }

        if (!colorId) {
            Logger.error(SHOW_LOGS, TAG + "|PATCH", "Color ID is required");
            return new NextResponse("Color ID is required", { status: 400 });
        }

        if (!sizeId) {
            Logger.error(SHOW_LOGS, TAG + "|PATCH", "Size ID is required");
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

        if (!params.productId) {
            Logger.error(SHOW_LOGS, TAG + "|PATCH", "Product ID is required");
            return new NextResponse("Product ID is required", { status: 400 });
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

        await prismadb.product.update({
            where: {
                id: params.productId,
            },
            data: {
                name,
                price,
                categoryId,
                colorId,
                sizeId,
                images: {
                    deleteMany: {},
                },
                isFeatured,
                isArchived,
            },
            include: {
                images: true,
                category: true,
                color: true,
                size: true,
            },
        });

        const product = await prismadb.product.update({
            where: {
                id: params.productId,
            },
            data: {
                images: {
                    createMany: {
                        data: [
                            ...images.map((image: string) => image),
                        ],
                    },
                },
            },
            include: {
                images: true,
                category: true,
                color: true,
                size: true,
            },
        });

        Logger.info(SHOW_LOGS, TAG + "|PATCH", `Store updated: ${product.id}`);
        return NextResponse.json(product);
    } catch (error) {
        Logger.error(SHOW_LOGS, TAG + "|PATCH", `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string, productId: string } },
) {
    try {
        const { userId } = auth();

        if (!userId) {
            Logger.error(SHOW_LOGS, TAG + "|DELETE", "User Unauthenticated");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!params.productId) {
            Logger.error(SHOW_LOGS, TAG + "|DELETE", "Product ID is required");
            return new NextResponse("Product ID is required", { status: 400 });
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
            Logger.error(SHOW_LOGS, TAG, "User is not authorized to create product for this store");
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const product = await prismadb.product.delete({
            where: {
                id: params.productId,
            }
        });

        Logger.info(SHOW_LOGS, TAG + "|DELETE", `Product updated: ${product.id}`);
        return NextResponse.json(product);
    } catch (error) {
        Logger.error(SHOW_LOGS, TAG + "|DELETE", `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: { productId: string } }
) {
    try {
        Logger.info(SHOW_LOGS, TAG, "In GET method");

        if (!params.productId) {
            Logger.error(SHOW_LOGS, TAG, "Product ID is required");
            return new NextResponse("Product ID is required", { status: 400 });
        }

        const product = await prismadb.product.findUnique({
            where: {
                id: params.productId,
            },
            include: {
                images: true,
                category: true,
                color: true,
                size: true,
            }
        });

        if (!product) {
            Logger.error(SHOW_LOGS, TAG, "Product not found");
            return new NextResponse("Product not found", { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        Logger.error(SHOW_LOGS, TAG, `Error: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}