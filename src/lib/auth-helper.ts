import { prisma } from "./auth";


export const getActiveOrgForSession = async ({ userId }: { userId: string }) => {
  const org = await prisma.organization.findFirst({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return org;
};

export const getInvitations = async ( userId: string) => {
  const invitations = await prisma.invitation.findMany({
    where: {
      user: {
        id: userId,
      }
    },
  });
  return invitations;
};

export const getMember = async (userId: string) => {
  const member = await prisma.member.findFirst({
    where: {
      organization: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
    }
  });
  return member;
}

export const getTeamById = async (teamId: string) => {
  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },
  });
  return team;
}