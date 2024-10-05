"use client";
import axios from "axios";
import { useState } from "react";
import * as z from "zod";
import toast from "react-hot-toast";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Size } from "@prisma/client";
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

interface SizeFormProps {
    initialData: Size | null;
}

type SizeFormValues = z.infer<typeof formSchema>;

const formSchema = z.object({
    name: z.string().min(1),
    value: z.string().min(1),
});

const SHOW_LOGS = true;
const TAG = "[[SizeForm]]";

export const SizeForm: React.FC<SizeFormProps> = ({ initialData }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const router = useRouter();

    const title = initialData ? "Edit Size." : "New Size.";
    const description = initialData ? "Edit your store size." : "Create a new store size.";
    const toastMessage = initialData ? "Size updated successfully." : "Size created successfully.";
    const action = initialData ? "Save Changes" : "Create Size";

    const form = useForm<SizeFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            value: "",
        }
    });

    const onSubmit = async (data: SizeFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/sizes/${params.sizeId}`, data);
            } else {
                await axios.post(`/api/${params.storeId}/sizes`, data);
            }
            toast.success(toastMessage);
            router.push(`/${params.storeId}/sizes`);
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
            await axios.delete(`/api/${params.storeId}/sizes/${params.sizeId}`);
            toast.success("Store deleted successfully.");
            setOpen(false);
            router.push(`/${params.storeId}/sizes`);
            router.refresh();
        } catch (error) {
            Logger.error(SHOW_LOGS, TAG, `Error: ${error}`);
            toast.error("Make sure to delete all categories using this size before deleting it.");
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
                                            <Input disabled={loading} placeholder="Size name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                        <FormField
                            control={form.control}
                            name="value"
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <FormLabel>Value</FormLabel>
                                        <FormControl>
                                            <Input disabled={loading} placeholder="Size value" {...field} />
                                        </FormControl>
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