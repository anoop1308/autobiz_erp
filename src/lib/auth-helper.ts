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
