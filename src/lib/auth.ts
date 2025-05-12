
import { PrismaClient } from "@/prisma/generated";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization, openAPI } from "better-auth/plugins"
import { getActiveOrgForSession } from "./auth-helper";
// import { sendOrganizationInvitation } from "./email";

export const prisma = new PrismaClient();
// const link_url = process.env.BETTER_AUTH_URL;
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    organization({
      // async sendInvitationEmail(data) {
      //   const inviteLink = `${link_url}/login?signup=${data.id}`;
      //   console.log("🚀 ~ sendInvitationEmail ~ inviteLink:", inviteLink)
      //   sendOrganizationInvitation({
      //     from: data.inviter.user.email,
      //     to: data.email,
      //     teamOrOrgName: data.organization.name,
      //     inviteLink,
      //   });
      // },
      enabled: true,
      teams: {
        enabled: true,
      },
      // hooks: {
      //   organization: {
      //     create: {
      //       after: async ({ organization }: { organization: { id: string } }) => {
      //         const defaultTeams = ['Support Team', 'Sales Team', 'Engineers Team'];
      //         for (const teamName of defaultTeams) {
      //           await prisma.team.create({
      //             data: {
      //               name: teamName,
      //               organizationId: organization.id
      //             }
      //           });
      //         }
      //       }
      //     }
      //   }  
      // },
    }),
    openAPI(),
  ],
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const organization = await getActiveOrgForSession({ userId: session.userId })
          if (!organization) {
            return {
              data: session
            }
          }
          return {
            data: {
              ...session,
              activeOrganizationId: organization?.id
            }
          }
        }
      }
    }
  }
});