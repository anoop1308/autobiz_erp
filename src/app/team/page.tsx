'use client'

import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { PencilIcon, PlusIcon, TrashIcon, UserPlusIcon } from 'lucide-react'
import { createTeam, deleteTeam, getAllTeams, inviteTeamMember, updateTeam } from '@/lib/auth-client'

interface Team {
    id: string
    name: string
    memberCount: number
}

type Role = 'member' | 'admin' | 'owner'

export default function TeamsPage() {
    const [teams, setTeams] = useState<Team[]>([])
    const [isAddTeamOpen, setIsAddTeamOpen] = useState(false)
    const [isEditTeamOpen, setIsEditTeamOpen] = useState(false)
    const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false)
    const [invitationEmail, setInvitationEmail] = useState('')
    const [selectedRole, setSelectedRole] = useState<Role>('member')
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
    const [teamFetched, setTeamFetched] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
    })
    const fetchTeams = async () => {
        const { data, error } = await getAllTeams()
        console.log("🚀 ~ fetchTeams ~ data:", data)
        if (error) throw new Error(error.message)

        setTeams(data as Team[])
    }

    useEffect(() => {
        if (teamFetched) return
        fetchTeams()
        setTeamFetched(true)
    },[teamFetched])

    const handleAddTeam = async () => {
        await createTeam(formData.name)
        fetchTeams()
        setIsAddTeamOpen(false)
        setFormData({ name: '' })
    }

    const handleEditTeam = async () => {
        await updateTeam(formData.name, selectedTeam?.id || '')
        fetchTeams()
        setIsEditTeamOpen(false)
        setSelectedTeam(null)
        setFormData({ name: '' })
    }

    const handleDeleteTeam = async (teamId: string) => {
        await deleteTeam(teamId)
        fetchTeams()
    }

    const handleInviteMember = async (teamId: string) => {
        const data = await inviteTeamMember(invitationEmail, selectedRole, teamId)
        if (data.error) {
            console.error('Error creating organization:', data.error)
            alert('Failed to create organization')
            return
        }
        setIsInviteMemberOpen(false)
        setInvitationEmail('')
        setSelectedRole('member')
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Teams</h1>
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
                            />
                            <Button onClick={handleAddTeam}>Create Team</Button>
                        </div>
                    </DialogContent>
                </Dialog>
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
                    {teams.map((team) => (
                        <TableRow key={team.id}>
                            <TableCell>{team.name}</TableCell>
                            <TableCell>{team.memberCount}</TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedTeam(team)
                                            setFormData({ name: team.name })
                                            setIsEditTeamOpen(true)
                                        }}
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteTeam(team.id)}
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedTeam(team)
                                            setIsInviteMemberOpen(true)
                                        }}
                                    >
                                        <UserPlusIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
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
                        />
                        <Button onClick={handleEditTeam}>Save Changes</Button>
                    </div>
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
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="role" className="text-sm font-medium">
                                Role
                            </label>
                            <Select 
                                value={selectedRole} 
                                onValueChange={(value: Role) => setSelectedRole(value)}
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
                        <Button onClick={() => handleInviteMember(selectedTeam?.id || '')}>
                            Send Invitation
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
