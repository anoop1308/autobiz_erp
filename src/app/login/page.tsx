'use client'
import { LoginForm, LoginFormData } from "@/components/login-form"
import { toast } from "@/hooks/use-toast"
import {  signIn } from "@/lib/auth-client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Page() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const redirect = useRouter().push


  const handleSubmit = async (formData: LoginFormData) => {

    setIsLoading(true)
    setError('')
    
    try {
      const { data, error } = await signIn(formData.email, formData.password)
      
      if (error) {
        setIsLoading(true)
        setError(error.message || 'An unknown error occurred')
      } else {
        toast({
          title: "Success",
          description: "Signed in successfully",
          variant: "default"
        })
        localStorage.setItem('user', JSON.stringify(data));
        redirect('/dashboard')
      }
    } catch (error: unknown) {
      setIsLoading(true)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive"
      })
    }
  }
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
      </div>
    </div>
  )
}
