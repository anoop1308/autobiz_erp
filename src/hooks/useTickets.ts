import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTicketsList, getTicket, updateTicket } from "@/actions/ticket";

export function useTicketsList() {
  return useQuery({
    queryKey: ["tickets"],
    queryFn: getTicketsList,
  });
}

export function useTicket(ticketId: string) {
  return useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => getTicket(ticketId),
    enabled: !!ticketId,
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticketId, data }: { ticketId: string; data: any }) => await updateTicket(ticketId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ticket", variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}