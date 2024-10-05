"use client";
import { useState } from "react";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CategoryColumn } from "./columns";
import axios from "axios";
import Logger from "@/logger/Logger";
import { AlertModal } from "@/components/modals/alert-modal";

interface CellActionProps {
    data: CategoryColumn;
};

const SHOW_LOGS = true;
const TAG = "CellAction";

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const params = useParams();

    const onCopy = () => {
        navigator.clipboard.writeText(data.id);
        toast.success("Category ID copied to clipboard");
    };

    const onUpdate = () => {
        router.push(`/${params.storeId}/categories/${data.id}`);
    };

    const onDelete = async () => {
        try {
            setLoading(true);
            await axios.delete(`/api/${params.storeId}/categories/${data.id}`);
            setOpen(false);
            router.refresh();
            toast.success("Category deleted successfully");
        } catch (error) {
            Logger.error(SHOW_LOGS, TAG, `Error: ${error}`);
            toast.error("Make sure to delete all products using this category before deleting it.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AlertModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={onDelete}
                loading={loading}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant={"ghost"} className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem className="cursor-pointer" onClick={onCopy} disabled={loading}>
                        <Copy className="h-2 w-2 mr-2" />
                        Copy Id
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={onUpdate} disabled={loading}>
                        <Edit className="h-2 w-2 mr-2" />
                        Update
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => setOpen(true)} disabled={loading}>
                        <Trash className="h-2 w-2 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}