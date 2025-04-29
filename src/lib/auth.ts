
import { PrismaClient } from "@/prisma/generated";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization, openAPI } from "better-auth/plugins"
import { getActiveOrgForSession } from "./auth-helper";

export const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    organization({
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