'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { authClient, createOrganization } from '@/lib/auth-client'

export default function CreateOrganizationPage() {
    const { data: organizationsList } = authClient.useListOrganizations()
    const [organizationName, setOrganizationName] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const data = await createOrganization(organizationName)
        if (data.error) {
            console.error('Error creating organization:', data.error)
            alert('Failed to create organization')
            return
        }
        // Reset form after successful submission
        setOrganizationName('')
        alert('Organization created successfully!')
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
                <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                        <CardTitle className="text-2xl font-bold text-center">
                            Create Organization
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="organizationName" className="text-sm font-semibold text-gray-700">
                                    Organization Name
                                </label>
                                <Input
                                    id="organizationName"
                                    type="text"
                                    value={organizationName}
                                    onChange={(e) => setOrganizationName(e.target.value)}
                                    placeholder="Enter organization name"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <Button 
                                type="submit" 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
                            >
                                Create Organization
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                        <CardTitle className="text-2xl font-bold text-center">
                            Organizations List
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {organizationsList && organizationsList.length > 0 ? (
                            <ul className="space-y-3">
                                {organizationsList.map((org: { id: string; name: string }) => (
                                    <li 
                                        key={org.id} 
                                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between shadow-sm"
                                    >
                                        <span className="font-medium text-gray-800">{org.name}</span>
                                        <span className="text-gray-400 text-sm">#{org.id.slice(0, 8)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 text-lg">No organizations found</p>
                                <p className="text-gray-400 text-sm mt-2">Create your first organization to get started</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
