import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllTeams, createTeam, updateTeam, deleteTeam, inviteTeamMember } from "@/lib/auth-client";

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data } = await getAllTeams();
      return data;
    },
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => await createTeam(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, teamId }: { name: string; teamId: string }) => await updateTeam(name, teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (teamId: string) => await deleteTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useInviteTeamMember() {
  return useMutation({
    mutationFn: async ({ email, role, teamId }: { email: string; role: "member" | "admin" | "owner"; teamId: string }) => await inviteTeamMember(email, role, teamId),
  });
}