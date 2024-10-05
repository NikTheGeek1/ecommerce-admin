"use client";
import axios from "axios";
import { useState } from "react";
import * as z from "zod";
import toast from "react-hot-toast";
import { Trash } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Category, Color, Image, Product, Size } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Logger from "@/logger/Logger";
import { AlertModal } from "@/components/modals/alert-modal";
import ImageUpload from "@/components/ui/image-upload";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface ProductFormProps {
    initialData: Product & {
        images: Image[];
    } | null;
    categories: Category[];
    colors: Color[];
    sizes: Size[];
}

type ProductFormValues = z.infer<typeof formSchema>;

const formSchema = z.object({
    name: z.string().min(1),
    images: z.object({ url: z.string() }).array(),
    price: z.number().min(0),
    categoryId: z.string().min(1),
    sizeId: z.string().min(1),
    colorId: z.string().min(1),
    isFeatured: z.boolean(),
    isArchived: z.boolean(),
});

const SHOW_LOGS = true;
const TAG = "[[ProductForm]]";

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, categories, colors, sizes }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const router = useRouter();

    const title = initialData ? "Edit Product." : "New Product.";
    const description = initialData ? "Edit your store product." : "Create a new store product.";
    const toastMessage = initialData ? "Product updated successfully." : "Product created successfully.";
    const action = initialData ? "Save Changes" : "Create Product";

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ? {
            ...initialData,
            price: parseFloat(initialData.price.toString()),
        } : {
            name: "",
            images: [],
            price: 0,
            categoryId: "",
            sizeId: "",
            colorId: "",
            isFeatured: false,
            isArchived: false,
        }
    });

    const onSubmit = async (data: ProductFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/products/${params.productId}`, data);
            } else {
                await axios.post(`/api/${params.storeId}/products`, data);
            }
            toast.success(toastMessage);
            router.push(`/${params.storeId}/products`);
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
            await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
            toast.success("Product deleted successfully.");
            setOpen(false);
            router.push(`/${params.storeId}/products`);
            router.refresh();
        } catch (error) {
            Logger.error(SHOW_LOGS, TAG, `Error: ${error}`);
            toast.error("Make sure to delete all categories using this product before deleting it.");
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
                    <Controller
                        control={form.control}
                        name="images"
                        render={({ field }) => {
                            return (
                                <FormItem>
                                    <FormLabel>Images</FormLabel>
                                    <FormControl>
                                        <ImageUpload
                                            value={field.value.map((image) => image.url)}
                                            onChange={(url) => {
                                                const currentImages = form.getValues("images");
                                                field.onChange([...currentImages, { url }]);
                                            }}
                                            onRemove={(url) => {
                                                const currentImages = form.getValues("images");
                                                field.onChange([...currentImages.filter((current) => current.url !== url)])
                                            }}
                                            disabled={loading}
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
                            name="name"
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input disabled={loading} placeholder="Product name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                disabled={loading}
                                                placeholder="9.99"
                                                {...field}
                                                onChange={(e) => {
                                                    const price = parseFloat(e.target.value);
                                                    field.onChange(price);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                        <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select
                                            disabled={loading}
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue defaultValue={field.value} placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((category) => {
                                                    return (
                                                        <SelectItem key={category.id} value={category.id}>
                                                            {category.name}
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
                        <FormField
                            control={form.control}
                            name="sizeId"
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <FormLabel>Size</FormLabel>
                                        <Select
                                            disabled={loading}
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue defaultValue={field.value} placeholder="Select a size" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {sizes.map((size) => {
                                                    return (
                                                        <SelectItem key={size.id} value={size.id}>
                                                            {size.name}
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
                        <FormField
                            control={form.control}
                            name="colorId"
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <FormLabel>Color</FormLabel>
                                        <Select
                                            disabled={loading}
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue defaultValue={field.value} placeholder="Select a color" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {colors.map((color) => {
                                                    return (
                                                        <SelectItem key={color.id} value={color.id}>
                                                            <div className="w-4 h-4 rounded-full mr-x-2" style={{ backgroundColor: color.value }} />
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
                        <FormField
                            control={form.control}
                            name="isFeatured"
                            render={({ field }) => {
                                return (
                                    <FormItem className="flex flex-row items-start  space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Featured</FormLabel>
                                            <FormDescription>
                                                This product will appear on the hope page
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )
                            }}
                        />
                        <FormField
                            control={form.control}
                            name="isArchived"
                            render={({ field }) => {
                                return (
                                    <FormItem className="flex flex-row items-start  space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Archived</FormLabel>
                                            <FormDescription>
                                                This product will not appear anywhere in the store
                                            </FormDescription>
                                        </div>
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