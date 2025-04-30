
import { PrismaClient } from "@/prisma/generated";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization, openAPI } from "better-auth/plugins"
import { getActiveOrgForSession } from "./auth-helper";
import { sendEmail } from "./email";

export const prisma = new PrismaClient();
const link_url = process.env.NEXT_PUBLIC_URL;
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    organization({
      async sendInvitationEmail(data) {
        const inviteLink = `${link_url}/login/${data.id}`;
        sendEmail({
          from: data.inviter.user.email,
          to: data.email,
          teamOrOrgName: data.organization.name,
          inviteLink,
        });
      },
      enabled: true,
      teams: {
        enabled: true,
      },
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