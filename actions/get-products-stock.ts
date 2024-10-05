import prismadb from "@/lib/prismadb";

export const getProductsCount = async (storeId: string) => {
    const productsCount = await prismadb.product.count({
        where: {
            storeId,
            isArchived: false,
        },
    });

    return productsCount;
}