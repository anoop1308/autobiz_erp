"use client"
import Link from "next/link";
import { Button } from "../ui/button";
import { PlusIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import TicketActions from "./TicketAction";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";

export type Ticket = {
    id: string;
    customerName: string;
    description: string;
    product: string;
    status: string;
    priority: "Low" | "Medium" | "High";
};

const priorityColors = {
    Low: "text-green-500",
    Medium: "text-yellow-500",
    High: "text-red-500",
};

export const TicketsTable = ({ tickets = [] }: { tickets?: Ticket[] }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true)
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 3000)
        return () => clearTimeout(timer)
    }, [])

    if (isLoading) {
        return (
            <div className="gap-4 flex flex-col p-5">
                <Skeleton className="h-36 w-full" />
                <Skeleton className="h-36 w-full" />
                <Skeleton className="h-36 w-full" />
                <Skeleton className="h-36 w-full" />
            </div>
        )
    }
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Ticket Lists</h1>
                <Link href={`/support`}>
                    <Button>
                        <PlusIcon className="h-4 w-4" />
                        Add Ticket
                    </Button>
                </Link>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>S.No</TableHead>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tickets.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                Create your first Ticket !!!
                            </TableCell>
                        </TableRow>
                    )}
                    {tickets.map((item, index) => (
                        <TableRow key={item.id} onClick={() => router.push(`tickets/${item.id}`)}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{item.customerName}</TableCell>
                            <TableCell>{item.product}</TableCell>
                            <TableCell>{item.status}</TableCell>
                            <TableCell className={`${priorityColors[item.priority]}`}>{item.priority}</TableCell>
                            <TableCell>
                                <TicketActions ticket={item} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};