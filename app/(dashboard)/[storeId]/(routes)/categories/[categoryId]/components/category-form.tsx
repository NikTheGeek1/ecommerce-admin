"use client";
import axios from "axios";
import { useState } from "react";
import * as z from "zod";
import toast from "react-hot-toast";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Billboard, Category } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Logger from "@/logger/Logger";
import { AlertModal } from "@/components/modals/alert-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategoryFormProps {
    initialData: Category | null;
    billboards: Billboard[];
}

type CategoryFormValues = z.infer<typeof formSchema>;

const formSchema = z.object({
    name: z.string().min(1),
    billboardId: z.string().min(1),
});

const SHOW_LOGS = true;
const TAG = "[[CategoryForm]]";

export const CategoryForm: React.FC<CategoryFormProps> = ({ initialData, billboards }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const router = useRouter();

    const title = initialData ? "Edit Category." : "New Category.";
    const description = initialData ? "Edit your store category." : "Create a new store category.";
    const toastMessage = initialData ? "Category updated successfully." : "Category created successfully.";
    const action = initialData ? "Save Changes" : "Create Category";

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            billboardId: "",
        }
    });

    const onSubmit = async (data: CategoryFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/categories/${params.categoryId}`, data);
            } else {
                await axios.post(`/api/${params.storeId}/categories`, data);
            }
            toast.success(toastMessage);
            router.push(`/${params.storeId}/categories`);
            router.refresh();
        } catch (error) {
            Logger.error(SHOW_LOGS, TAG, `Error: ${error}`);
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
        setLoading(false);
    };

    const onDelete = async () => {
        try {
            setLoading(true);
            await axios.delete(`/api/${params.storeId}/categories/${params.categoryId}`);
            toast.success("Store deleted successfully.");
            setOpen(false);
            router.push(`/${params.storeId}/categories`);
            router.refresh();
        } catch (error) {
            Logger.error(SHOW_LOGS, TAG, `Error: ${error}`);
            toast.error("Make sure to delete all categories using this category before deleting it.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
            <div className="flex items-center justify-between">
                <Heading
                    title={title}
                    description={description}
                />
                {initialData && (
                    <Button
                        disabled={loading}
                        variant="destructive"
                        size="icon"
                        onClick={() => setOpen(true)}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>)}
            </div>
            <Separator />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                    <div className="grid grid-cols-3 gap-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input disabled={loading} placeholder="Category Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                        <FormField
                            control={form.control}
                            name="billboardId"
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <FormLabel>Billboard</FormLabel>
                                        <Select
                                            disabled={loading}
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue defaultValue={field.value} placeholder="Select a billboard" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {billboards.map((billboard) => {
                                                    return (
                                                        <SelectItem key={billboard.id} value={billboard.id}>
                                                            {billboard.label}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                    </div>
                    <Button disabled={loading} type="submit" className="ml-auto">
                        {action}
                    </Button>
                </form>
            </Form >
        </>
    );
};