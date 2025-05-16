import { getTicketsList } from "@/actions/ticket";
import TicketActions from "@/components/ticket/TicketAction";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

const priorityColors = {
  Low: "text-green-500",
  Medium: "text-yellow-500",
  High: "text-red-500",
}

const Tickets = async () => {
  const tickets = await getTicketsList();
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
              <TableCell colSpan={5} className="h-24 text-center">
                Create your first Ticket !!!
              </TableCell>
            </TableRow>
          )}
          {tickets.map((item, index) => (
            <TableRow key={item.id}>
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

export default Tickets;
