'use client'
import { getFullOrganization } from "./auth-client"

export const getTeamsPendingInvitations = async () => {
    const data = await getFullOrganization()
    if (data.error) {
      console.error('Error fetching organization:', data.error)
      alert('Failed to fetch organization')
      return
    }
    if (!data.data) return
  
    const invitations = data.data?.invitations.map(inv => ({
      ...inv,
      expiresAt: inv.expiresAt.toString()
    }));
  
    const filteredInvitationsByStatus = invitations?.filter(inv => inv.status === 'pending')
    const filteredInvitations = filteredInvitationsByStatus?.filter(inv => inv.teamId)
    return filteredInvitations
  }
  
  export const getOrgsPendingInvitations = async () => {
    const data = await getFullOrganization()
    if (data.error) {
      console.error('Error fetching organization:', data.error)
      alert('Failed to fetch organization')
      return
    }
    if (!data.data) return
  
    const invitations = data.data?.invitations.map(inv => ({
      ...inv,
      expiresAt: inv.expiresAt.toString()
    }));
  
    const filteredInvitationsByStatus = invitations?.filter(inv => inv.status === 'pending')
    const filteredInvitations = filteredInvitationsByStatus?.filter(inv => !inv.teamId)
    return filteredInvitations
  }
  
  export const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text)
        alert('Invite link copied to clipboard!')
    } catch (err) {
        console.error('Failed to copy text: ', err)
    }
  }
  
  export const createInviteLink = (userId: string) => {
    return `http://localhost:3000/signup?invitationId=${userId}`
  }