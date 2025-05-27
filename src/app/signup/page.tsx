"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from "sonner"
import Link from 'next/link'
import { useSignUp } from "@/hooks/useAuth"
// import { signUp, useSession } from '@/lib/auth-client'
import { Skeleton } from "@/components/ui/skeleton"


export default function SignUpPage() {
  const searchParams = useSearchParams()
  const invitationId = searchParams.get('invitationId')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const redirect = useRouter().push
  const { mutate, isPending: isLoading, error } = useSignUp()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate(
      { email, password, name, invitationId: invitationId || undefined },
      {
        onSuccess: (result) => {
          if (result.error) {
            return
          }
          redirect('/login')
          toast.success("Account created successfully. Please sign in.")
        },
      }
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {isLoading ? (
        <Skeleton className="w-[400px] h-96" />
      ) : (
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>Sign up to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                  {error.message}
                </div>
              )}
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing up..." : "Sign Up"}
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
