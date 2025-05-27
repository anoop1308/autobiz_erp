"use client";
import { Ticket, TicketsTable } from "@/components/ticket/TicketsTable";
import { useTicketsList } from "@/hooks/useTickets";

const Tickets = () => {
  const { data: tickets, isLoading, isError } = useTicketsList();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Failed to load tickets.</div>;

  return <TicketsTable tickets={tickets as Ticket[]} />;
};

export default Tickets;
