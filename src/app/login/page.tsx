'use client'
import { LoginForm, LoginFormData } from "@/components/login-form"
import { toast } from "sonner"
import { useLogin } from "@/hooks/useAuth"
import { Skeleton } from "@/components/ui/skeleton"

import { useRouter } from "next/navigation"


export default function Page() {
  const { mutate, isPending: isLoading, error } = useLogin()
  const redirect = useRouter().push

  const handleSubmit = (formData: LoginFormData) => {
    mutate(
      { email: formData.email, password: formData.password },
      {
        onSuccess: (result) => {
          if (result.error) {
            toast.error(result.error.message || "An unknown error occurred")
            return
          }
          redirect('/dashboard')
          toast.success("Signed in successfully")
          localStorage.setItem('user', JSON.stringify(result.data));
        },
      }
    )
  }
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error?.message || ''} />
        )}
      </div>
    </div>
  )
}
