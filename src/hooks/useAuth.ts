import { useMutation } from "@tanstack/react-query"
import { signIn, signUp } from "@/lib/auth-client"

export function useLogin() {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return await signIn(email, password)
    },
  })
}

export function useSignUp() {
  return useMutation({
    mutationFn: async ({ email, password, name, invitationId }: { email: string; password: string; name: string; invitationId?: string }) => {
      return await signUp(email, password, name, invitationId)
    },
  })
}