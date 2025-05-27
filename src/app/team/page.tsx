'use client'

import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Loader2, PencilIcon, PlusIcon, TrashIcon, UserPlusIcon, Copy, Clock } from 'lucide-react'
import { useTeams, useCreateTeam, useUpdateTeam, useDeleteTeam, useInviteTeamMember } from '@/hooks/useTeam'
import { copyToClipboard, createInviteLink, getTeamsPendingInvitations } from '@/lib/commonFunc'
import { toast } from 'sonner'
// import { getTeamById } from '@/lib/auth-helper'

type Team = {
    id: string
    name: string
    memberCount: number
}

export interface Invitation {
    organizationId: string
    email: string
    role: string
    teamId: string
    status: string
    expiresAt: string
    inviterId: string
    id: string
    teamName?: string
}

type Role = 'member' | 'admin' | 'owner'

export default function TeamsPage() {
    const { data: teams, isLoading } = useTeams()
    const createTeamMutation = useCreateTeam()
    const updateTeamMutation = useUpdateTeam()
    const deleteTeamMutation = useDeleteTeam()
    const inviteTeamMemberMutation = useInviteTeamMember()
    const [isAddTeamOpen, setIsAddTeamOpen] = useState(false)
    const [isEditTeamOpen, setIsEditTeamOpen] = useState(false)
    const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [isPendingInvitationsOpen, setIsPendingInvitationsOpen] = useState(false)
    const [invitationEmail, setInvitationEmail] = useState('')
    const [selectedRole, setSelectedRole] = useState<Role>('member')
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
    const [formData, setFormData] = useState({
        name: '',
    })
    const [invitationsData, setInvitationsData] = useState<Invitation[]>([])

    const getInvitations = async () => {
        const data = await getTeamsPendingInvitations()
        if (data) {
            setInvitationsData(data as Invitation[])
        }
    }
    useEffect(() => {
        getInvitations()
    }, [])

    const handleAddTeam = async () => {
        createTeamMutation.mutate(formData.name, {
            onSuccess: (data: any) => {
                if (data?.error) {
                    console.error('Error creating organization:', data.error)
                    toast.error('Failed to create Team')
                    return
                }
                toast.success(`${data.data?.name} is created successfully`)
                setIsAddTeamOpen(false)
                setFormData({ name: '' })
            },
            onError: () => {
                toast.error('Failed to create Team')
            }
        })
    }

    const handleEditTeam = async () => {
        if (!selectedTeam) return
        updateTeamMutation.mutate({ name: formData.name, teamId: selectedTeam.id }, {
            onSuccess: () => {
                toast.success(`${selectedTeam?.name} is updated successfully`)
                setIsEditTeamOpen(false)
                setSelectedTeam(null)
                setFormData({ name: '' })
            },
            onError: () => {
                toast.error('Failed to update Team')
            }
        })
    }

    const handleDeleteTeam = async (teamId: string) => {
        deleteTeamMutation.mutate(teamId, {
            onSuccess: () => {
                toast.success(`${selectedTeam?.name} is deleted successfully`)
                setIsDeleteConfirmOpen(false)
            },
            onError: () => {
                toast.error('Failed to delete Team')
            }
        })
    }

    const handleInviteMember = async (teamId: string) => {
        inviteTeamMemberMutation.mutate({ email: invitationEmail, role: selectedRole, teamId }, {
            onSuccess: (data: any) => {
                if (data?.error) {
                    toast.error("Failed to invite member")
                    return
                }
                toast.success(`${data.data.email} is invited successfully`)
                setIsInviteMemberOpen(false)
                setInvitationEmail('')
                setSelectedRole('member')
                // TODO: Refetch invitations if needed
            },
            onError: () => {
                toast.error("Failed to invite member")
            }
        })
    }

    const pendingInvitationsCount = invitationsData.filter(inv => inv.status === 'pending').length

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Teams</h1>
                <div className="flex gap-2">
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
                    <Dialog open={isAddTeamOpen} onOpenChange={setIsAddTeamOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Add Team
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Team</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <Input
                                    placeholder="Team Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    disabled={isLoading}
                                />
                                <Button onClick={handleAddTeam} disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Team
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Team Name</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            </TableCell>
                        </TableRow>
                    ) : (
                        teams?.map((team: unknown) => {
                            const typedTeam = team as Team;
                            return (
                            <TableRow key={typedTeam.id}>
                                <TableCell>{typedTeam.name}</TableCell>
                                <TableCell>{typedTeam.memberCount}</TableCell>
                                <TableCell>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedTeam(typedTeam)
                                                setFormData({ name: typedTeam.name })
                                                setIsEditTeamOpen(true)
                                            }}
                                            disabled={isLoading}
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </Button>
                                        {teams.length > 1 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedTeam(typedTeam)
                                                    setIsDeleteConfirmOpen(true)
                                                }}
                                                disabled={isLoading}
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedTeam(typedTeam)
                                                setIsInviteMemberOpen(true)
                                            }}
                                            disabled={isLoading}
                                        >
                                            <UserPlusIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )})
                    )}
                </TableBody>
            </Table>

            <Dialog open={isEditTeamOpen} onOpenChange={setIsEditTeamOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Team</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            placeholder="Team Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            disabled={isLoading}
                        />
                        <Button onClick={handleEditTeam} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Team</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the team &quot;{selectedTeam?.name}&quot;? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => handleDeleteTeam(selectedTeam?.id || '')}
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isInviteMemberOpen} onOpenChange={setIsInviteMemberOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email Address
                            </label>
                            <Input
                                id="email"
                                placeholder="Enter email address"
                                value={invitationEmail}
                                onChange={(e) => setInvitationEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="role" className="text-sm font-medium">
                                Role
                            </label>
                            <Select
                                value={selectedRole}
                                onValueChange={(value: Role) => setSelectedRole(value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger id="role">
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
                            onClick={() => handleInviteMember(selectedTeam?.id || '')}
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Invitation
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
