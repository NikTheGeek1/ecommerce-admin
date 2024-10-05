"use client";
import axios from "axios";
import { useState } from "react";
import * as z from "zod";
import toast from "react-hot-toast";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Billboard } from "@prisma/client";
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
import ImageUpload from "@/components/ui/image-upload";

interface BillboardFormProps {
    initialData: Billboard | null;
}

type BillboardFormValues = z.infer<typeof formSchema>;

const formSchema = z.object({
    label: z.string().min(1),
    imageUrl: z.string().min(1),
});

const SHOW_LOGS = true;
const TAG = "[[BillboardForm]]";

export const BillboardForm: React.FC<BillboardFormProps> = ({ initialData }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const router = useRouter();

    const title = initialData ? "Edit Billboard." : "New Billboard.";
    const description = initialData ? "Edit your store billboard." : "Create a new store billboard.";
    const toastMessage = initialData ? "Billboard updated successfully." : "Billboard created successfully.";
    const action = initialData ? "Save Changes" : "Create Billboard";

    const form = useForm<BillboardFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            label: "",
            imageUrl: "",
        }
    });

    const onSubmit = async (data: BillboardFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/billboards/${params.billboardId}`, data);
            } else {
                await axios.post(`/api/${params.storeId}/billboards`, data);
            }
            toast.success(toastMessage);
            router.push(`/${params.storeId}/billboards`);
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
            await axios.delete(`/api/${params.storeId}/billboards/${params.billboardId}`);
            toast.success("Store deleted successfully.");
            setOpen(false);
            router.push(`/${params.storeId}/billboards`);
            router.refresh();
        } catch (error) {
            Logger.error(SHOW_LOGS, TAG, `Error: ${error}`);
            toast.error("Make sure to delete all categories using this billboard before deleting it.");
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
                    <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => {
                            return (
                                <FormItem>
                                    <FormLabel>Background image</FormLabel>
                                    <FormControl>
                                        <ImageUpload
                                            onChange={(url) => field.onChange(url)}
                                            onRemove={() => field.onChange("")}
                                            value={field.value ? [field.value] : []} disabled={loading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )
                        }}
                    />
                    <div className="grid grid-cols-3 gap-8">
                        <FormField
                            control={form.control}
                            name="label"
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <FormLabel>Label</FormLabel>
                                        <FormControl>
                                            <Input disabled={loading} placeholder="Billboard label" {...field} />
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