"use client";
import axios from "axios";
import { useState } from "react";
import * as z from "zod";
import toast from "react-hot-toast";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Color } from "@prisma/client";
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

interface ColorFormProps {
    initialData: Color | null;
}

type ColorFormValues = z.infer<typeof formSchema>;

const formSchema = z.object({
    name: z.string().min(1),
    value: z.string().min(4).regex(/^#/, { message: "String must be a valid hex code" }),
});

const SHOW_LOGS = true;
const TAG = "[[ColorForm]]";

export const ColorForm: React.FC<ColorFormProps> = ({ initialData }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const router = useRouter();

    const title = initialData ? "Edit Color." : "New Color.";
    const description = initialData ? "Edit your store color." : "Create a new store color.";
    const toastMessage = initialData ? "Color updated successfully." : "Color created successfully.";
    const action = initialData ? "Save Changes" : "Create Color";

    const form = useForm<ColorFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            value: "",
        }
    });

    const onSubmit = async (data: ColorFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/colors/${params.colorId}`, data);
            } else {
                await axios.post(`/api/${params.storeId}/colors`, data);
            }
            toast.success(toastMessage);
            router.push(`/${params.storeId}/colors`);
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
            await axios.delete(`/api/${params.storeId}/colors/${params.colorId}`);
            toast.success("Store deleted successfully.");
            setOpen(false);
            router.push(`/${params.storeId}/colors`);
            router.refresh();
        } catch (error) {
            Logger.error(SHOW_LOGS, TAG, `Error: ${error}`);
            toast.error("Make sure to delete all categories using this color before deleting it.");
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
                        color="icon"
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
                                            <Input disabled={loading} placeholder="Color name" {...field} />
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
                                            <Input disabled={loading} placeholder="Color value" {...field} />
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