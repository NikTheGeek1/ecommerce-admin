"use client"
import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"

export type ProductColumn = {
    id: string;
    name: string;
    price: string;
    size: string;
    category: string;
    color: string;
    isFeatured: boolean;
    isArchived: boolean;
    createdAt: string;
}

export const columns: ColumnDef<ProductColumn>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "price",
        header: "Price",
    },
    {
        accessorKey: "size",
        header: "Size",
    },
    {
        accessorKey: "category",
        header: "Category",
    },
    {
        accessorKey: "color",
        header: "Color",
        cell: ({ row }) => <div className="flex items-center gap-x-2">
            <span>{row.original.color}</span>
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: row.original.color }} />
        </div>
    },
    {
        accessorKey: "isFeatured",
        header: "Featured",
    },
    {
        accessorKey: "isArchived",
        header: "Archived",
    },
    {
        accessorKey: "createdAt",
        header: "Date",
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original} />,
    }
]
