import { useMutation } from "@tanstack/react-query";

export function useCreateSupportTicket() {
  return useMutation({
    mutationFn: async (formData: any) => {
      const response = await fetch("/api/support/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to submit ticket");
      return response.json();
    },
  });
}