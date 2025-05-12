'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SupportPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        customerName: '',
        product: '',
        issueType: '',
        description: '',
        whatsapp: ''
    });

    const resetForm = () => {
        setFormData({
            customerName: '',
            product: '',
            issueType: '',
            description: '',
            whatsapp: ''
        });
    };

    const validateWhatsAppNumber = (number: string) => {
        const whatsappRegex = /^\+?[1-9]\d{1,14}$/;
        return whatsappRegex.test(number);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateWhatsAppNumber(formData.whatsapp)) {
            toast({
                title: "Invalid WhatsApp Number",
                description: "Please enter a valid WhatsApp number with country code",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/support/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to submit ticket');

            toast({
                title: "Success",
                description: "Your support ticket has been submitted successfully",
                variant: "default"
            });
            resetForm();
        } catch (error) {
            console.error('Error submitting ticket:', error);
            toast({
                title: "Error",
                description: "Failed to submit support ticket. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, product: value }));
    };

    return (
        <div className='w-full flex justify-center'>
            <Card className="w-1/2 justify-center mt-8 mb-8">
                <CardHeader>
                    <CardTitle>Raise an Issue</CardTitle>
                    <CardDescription>Fill out the form below to submit a support ticket</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="customerName">Customer Name</Label>
                            <Input
                                type="text"
                                id="customerName"
                                name="customerName"
                                value={formData.customerName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product">Product</Label>
                            <Select onValueChange={handleSelectChange} value={formData.product}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="product1">Product 1</SelectItem>
                                    <SelectItem value="product2">Product 2</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="issueType">Issue Type</Label>
                            <Input
                                type="text"
                                id="issueType"
                                name="issueType"
                                placeholder="e.g. Battery not charging"
                                value={formData.issueType}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Issue Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Describe the problem in detail"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">WhatsApp Number</Label>
                            <Input
                                type="tel"
                                id="whatsapp"
                                name="whatsapp"
                                placeholder="+1234567890"
                                value={formData.whatsapp}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? "Submitting..." : "Submit Ticket"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}