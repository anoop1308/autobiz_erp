'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useOrganizations, useCreateOrganization, useUpdateOrganization, useDeleteOrganization, useInviteOrgMember } from '@/hooks/useOrganization'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Clock, Copy, Loader2, PencilIcon, Plus, TrashIcon, UserPlusIcon, UsersIcon } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { copyToClipboard, createInviteLink, getOrgsPendingInvitations } from '@/lib/commonFunc'
import { Invitation } from '../team/page'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

export default function CreateOrganizationPage() {
    const { data: organizationsList, isLoading: isLoadingOrgs } = useOrganizations()
    const createOrgMutation = useCreateOrganization()
    const updateOrgMutation = useUpdateOrganization()
    const deleteOrgMutation = useDeleteOrganization()
    const inviteOrgMemberMutation = useInviteOrgMember()
    const [organizationName, setOrganizationName] = useState('')
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState<'member' | 'admin' | 'owner'>('member')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingOrg, setEditingOrg] = useState<{ id: string; name: string } | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [isInviting, setIsInviting] = useState(false)
    const [orgToDelete, setOrgToDelete] = useState<{ id: string; name: string } | null>(null)
    const [invitingOrg, setInvitingOrg] = useState<{ id: string; name: string } | null>(null)
    const [isPendingInvitationsOpen, setIsPendingInvitationsOpen] = useState(false)
    const [invitationsData, setInvitationsData] = useState<Invitation[]>([])

    const getInvitations = async () => {
        const data = await getOrgsPendingInvitations()
        if (data) {
            setInvitationsData(data as Invitation[])
        }
    }
    useEffect(() => {
        getInvitations()
    }, [])


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsCreating(true)
        createOrgMutation.mutate(organizationName, {
            onSuccess: () => {
                setOrganizationName('')
                setIsDialogOpen(false)
                setIsCreating(false)
                toast.success("Organization created successfully!")
            },
            onError: (error) => {
                console.error('Error creating organization:', error)
                toast.error("Failed to create successfully!")
            }
        })
    }

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingOrg) return
        setIsUpdating(true)
        updateOrgMutation.mutate({ organizationId: editingOrg.id, name: organizationName }, {
            onSuccess: () => {
                setOrganizationName('')
                setIsEditDialogOpen(false)
                setIsUpdating(false)
                setEditingOrg(null)
                toast.success("Organization updated successfully!")
            },
            onError: (error) => {
                console.error('Error updating organization:', error)
                toast.error("Failed to update successfully!")
            }
        })
    }

    const handleDelete = async () => {
        if (!orgToDelete) return
        setIsDeleting(orgToDelete.id)
        deleteOrgMutation.mutate(orgToDelete.id, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false)
                setOrgToDelete(null)
                toast.success("Organization deleted successfully!")
                setIsDeleting(null)
            },
            onError: (error) => {
                console.error('Error deleting organization:', error)
                toast.error("Failed to delete successfully!")
                setIsDeleting(null)
            }
        })
    }

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!invitingOrg) return
        setIsInviting(true)
        inviteOrgMemberMutation.mutate({ email: inviteEmail, role: inviteRole }, {
            onSuccess: () => {
                setInviteEmail('')
                setInviteRole('member')
                setIsInviteDialogOpen(false)
                setInvitingOrg(null)
                toast.success("Invitation sent successfully!")
                setIsInviting(false)
            },
            onError: (error) => {
                console.error('Error inviting member:', error)
                toast.error("Failed to send invitation")
                setIsInviting(false)
            }
        })
    }

    const openEditDialog = (org: { id: string; name: string }) => {
        setEditingOrg(org)
        setOrganizationName(org.name)
        setIsEditDialogOpen(true)
    }

    const openDeleteDialog = (org: { id: string; name: string }) => {
        setOrgToDelete(org)
        setIsDeleteDialogOpen(true)
    }

    const openInviteDialog = (org: { id: string; name: string }) => {
        setInvitingOrg(org)
        setIsInviteDialogOpen(true)
    }
    const pendingInvitationsCount = invitationsData.filter(inv => inv.status === 'pending').length
    if (isLoadingOrgs) {
        return <div>
            <Skeleton />
            <Skeleton />
            <Skeleton />
        </div>
    }
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="space-y-8">
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold">Organizations</h2>
                        <div className='flex gap-5'>
                            <Dialog open={isPendingInvitationsOpen} onOpenChange={setIsPendingInvitationsOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <Clock className="h-4 w-4 mr-2" />
                                        Pending Invitations ({pendingInvitationsCount})
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl">
                                    <DialogHeader>
                                        <DialogTitle>Pending Invitations</DialogTitle>
                                    </DialogHeader>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Team</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Invite Link</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {invitationsData.filter(inv => inv.status === 'pending').map((invitation) => (
                                                <TableRow key={invitation.id}>
                                                    <TableCell>{invitation.email}</TableCell>
                                                    <TableCell>{invitation.role}</TableCell>
                                                    <TableCell>{invitation.teamName || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                                                            Pending
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm truncate max-w-[200px]">
                                                                {createInviteLink(invitation.id)}
                                                            </span>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => copyToClipboard(createInviteLink(invitation.id))}
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {invitationsData.filter(inv => inv.status === 'pending').length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center text-gray-500">
                                                        No pending invitations
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </DialogContent>
                            </Dialog>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" /> Add Organization
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create Organization</DialogTitle>
                                    </DialogHeader>
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
                                                disabled={isCreating}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={isCreating}
                                            className="w-full bg-black hover:bg-black text-white font-semibold py-3 rounded-lg transition-colors duration-200"
                                        >
                                            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Create Organization
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Organization</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleEdit} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="editOrganizationName" className="text-sm font-semibold text-gray-700">
                                        Organization Name
                                    </label>
                                    <Input
                                        id="editOrganizationName"
                                        type="text"
                                        value={organizationName}
                                        onChange={(e) => setOrganizationName(e.target.value)}
                                        placeholder="Enter organization name"
                                        required
                                        disabled={isUpdating}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="w-full bg-black hover:bg-black text-white font-semibold py-3 rounded-lg transition-colors duration-200"
                                >
                                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Organization
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Organization</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete {orgToDelete?.name}? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDeleteDialogOpen(false)}
                                    disabled={isDeleting !== null}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={isDeleting !== null}
                                >
                                    {isDeleting !== null ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Delete'
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Invite Member</DialogTitle>
                                <DialogDescription>
                                    Invite a new member to {invitingOrg?.name}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleInvite} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="inviteEmail" className="text-sm font-semibold text-gray-700">
                                        Email Address
                                    </label>
                                    <Input
                                        id="inviteEmail"
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="Enter email address"
                                        required
                                        disabled={isInviting}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="inviteRole" className="text-sm font-semibold text-gray-700">
                                        Role
                                    </label>
                                    <Select
                                        value={inviteRole}
                                        onValueChange={(value) => setInviteRole(value as 'member' | 'admin' | 'owner')}
                                        disabled={isInviting}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="member">Member</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="owner">Owner</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isInviting}
                                    className="w-full bg-black hover:bg-black text-white font-semibold py-3 rounded-lg transition-colors duration-200"
                                >
                                    {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Send Invitation
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <div className="bg-white rounded-lg shadow">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[300px]">Organization Name</TableHead>
                                    <TableHead>Members</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingOrgs ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    organizationsList && organizationsList.map((org: { id: string; name: string }) => (
                                        <TableRow key={org.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">{org.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <UsersIcon className="h-5 w-5 text-gray-400" />
                                                    <span className="text-gray-600">3 members</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-4">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog(org)}
                                                        disabled={isDeleting === org.id}
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openDeleteDialog(org)}
                                                        disabled={isDeleting === org.id}
                                                    >
                                                        {isDeleting === org.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <TrashIcon className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openInviteDialog(org)}
                                                        disabled={isDeleting === org.id}
                                                    >
                                                        <UserPlusIcon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        {!isLoadingOrgs && (!organizationsList || organizationsList.length === 0) && (
                            <div className="text-center py-8">
                                <p className="text-gray-500 text-lg">No organizations found</p>
                                <p className="text-gray-400 text-sm mt-2">Create your first organization to get started</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
