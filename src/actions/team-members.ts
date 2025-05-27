'use server';

import { auth, prisma } from "@/lib/auth";
import { headers } from "next/headers";

export async function getEngineerTeamMembers() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const activeOrgId = session?.session.activeOrganizationId;
  if(!activeOrgId) return [];

  try {
    const engineerTeam = await prisma.team.findFirst({
      where: {
        name: "Engineer's Team",
        organizationId: activeOrgId,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!engineerTeam) {
      return [];
    }
    return engineerTeam.members.map(member => ({
      id: member.id,
      name: member.user.name,
      email: member.user.email
    }));
  } catch (error) {
    console.error('Error fetching Engineer\'s Team members:', error);
    return [];
  }
}

export async function getAllOrganizationMembers(filter?: { name?: string; email?: string }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  const activeOrgId = session?.session.activeOrganizationId;
  if(!activeOrgId) return [];

  try {
    // If filter is provided and only one field is present, try to filter at DB level
    let membersData;
    if (filter && (filter.name || filter.email)) {
      // Only filter by name or email if provided
      membersData = await prisma.organization.findUnique({
        where: { id: activeOrgId },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            },
            where: filter.name || filter.email ? {
              user: {
                ...(filter.name ? { name: { contains: filter.name, mode: 'insensitive' } } : {}),
                ...(filter.email ? { email: { contains: filter.email, mode: 'insensitive' } } : {})
              }
            } : undefined
          }
        }
      });
    } else {
      membersData = await prisma.organization.findUnique({
        where: { id: activeOrgId },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });
    }

    if (!membersData) {
      return [];
    }

    let members = membersData.members.map(member => ({
      id: member.id,
      name: member.user.name,
      email: member.user.email
    }));

    // If both name and email filters are provided, filter in-memory for AND logic
    if (filter && filter.name && filter.email) {
      members = members.filter(member =>
        member.name.toLowerCase().includes(filter.name!.toLowerCase()) &&
        member.email.toLowerCase().includes(filter.email!.toLowerCase())
      );
    }

    return members;
  } catch (error) {
    console.error('Error fetching organization members:', error);
    return [];
  }
}

export async function getFilterTeamMembers() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const activeOrgId = session?.session.activeOrganizationId;
  if(!activeOrgId) return [];

  try {
    const engineerTeam = await prisma.team.findFirst({
      where: {
        name: "Engineer's Team",
        organizationId: activeOrgId,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!engineerTeam) {
      return [];
    }
    return engineerTeam.members.map(member => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email
    }));
  } catch (error) {
    console.error('Error fetching Engineer\'s Team members:', error);
    return [];
  }
}
