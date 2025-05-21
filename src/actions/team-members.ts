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

export async function getAllOrganizationMembers() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const activeOrgId = session?.session.activeOrganizationId;
  if(!activeOrgId) return [];

  try {
    const organization = await prisma.organization.findUnique({
      where: {
        id: activeOrgId,
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

    if (!organization) {
      return [];
    }

    return organization.members.map(member => ({
      id: member.id,
      name: member.user.name,
      email: member.user.email
    }));
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
