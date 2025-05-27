'use client';

import Link from "next/link";
import { Button } from "../ui/button";
import { SquarePenIcon, TrashIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useState } from "react";
import { deleteTicket } from "@/actions/ticket";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
interface TicketProps {
    ticket: {
        id: string;
        customerName: string;
        product: string;
        status: string;
        priority: string;
    }
}

export default function TicketActions({ ticket }: TicketProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const handleDelete = async () => {
        const result = await deleteTicket(ticket.id);
        if (result) {
            toast.success("Your support ticket has been deleted successfully");
            setOpen(false);
            router.refresh();
        } else {
            toast.error("Failed to delete support ticket. Please try again.");
        }
    }
  return (
    <div>
      <Link href={`/tickets/${ticket.id}`}>
        <Button variant="ghost" size="icon">
          <SquarePenIcon className="h-4 w-4" />
        </Button>
      </Link>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <TrashIcon className="h-4 w-4 text-red-500" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {ticket.customerName}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {ticket.customerName}? This action cannot be undone. <br />
              {ticket.customerName && ` This will permanently delete "${ticket.customerName}".`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
