import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient, createOrganization, updateOrganization, deleteOrganization, inviteOrgMember } from "@/lib/auth-client";

export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data } = await authClient.useListOrganizations();
      return data;
    },
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => await createOrganization(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ organizationId, name }: { organizationId: string; name: string }) => await updateOrganization(organizationId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (organizationId: string) => await deleteOrganization(organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function useInviteOrgMember() {
  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: "member" | "admin" | "owner" }) => await inviteOrgMember(email, role),
  });
}