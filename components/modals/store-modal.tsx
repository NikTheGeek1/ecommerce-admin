'use-client';

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Modal } from "@/components/ui/modal";
import { useStoreModal } from "@/hooks/use-store-modal";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Logger from "@/logger/Logger";

const formSchema = z.object({
    name: z.string().min(1).max(20),
});

const SHOW_LOGS = true;
const TAG = "[[StoreModal]]";

export const StoreModal = () => {
    const storeModal = useStoreModal();

    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            Logger.info(SHOW_LOGS, TAG, `Submitting Form: ${values}`);
            setLoading(true);
            const response = await axios.post("/api/stores", values);
            Logger.info(SHOW_LOGS, TAG, `Response: ${JSON.stringify(response.data)}`);
            window.location.assign(`/${response.data.id}`);
        } catch (error) {
            Logger.error(SHOW_LOGS, TAG, `Error Submitting Form: ${error}`);
            toast.error("Error creating store");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Create Store"
            description="Add a new store to manage products and categories."
            isOpen={storeModal.isOpen}
            onClose={storeModal.onClose}
        >
            <div>
                <div className="space-y-4 py-2 pb-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => {
                                    return (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={loading}
                                                placeholder="E-Commerce"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage>{form.formState.errors.name?.message}</FormMessage>
                                    </FormItem>
                                )}}
                            />
                            <div className="pt-6 space-x-2 flex items-center justify-end">
                                <Button disabled={loading} variant="outline" onClick={storeModal.onClose}>Cancel</Button>
                                <Button disabled={loading} type="submit">Continue</Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </Modal>
    );
}