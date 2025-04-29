import { createAuthClient } from "better-auth/react"
import { generateSlug } from "./utils";
import { organizationClient } from "better-auth/client/plugins"
import { toast } from "@/hooks/use-toast";

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: "http://localhost:3000",
    plugins: [
        organizationClient({
            teams: {
                enabled: true
            }
        })
    ]
})


export const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
    });
    if (error) {
        toast({
            title: "Error",
            description: error.message,
        })
        return { error };
    }

    const orgResponse = await authClient.organization.create({
        name: name,
        slug: generateSlug(name),
    });

    if (orgResponse.error) {
        toast({
            title: "Error",
            description: orgResponse.error.message,
        })
        return { error: orgResponse.error };
    }
    authClient.organization.setActive({
        organizationId: orgResponse.data?.id,
    });
    return { data, error };
}

export const signIn = async (email: string, password: string) => {
    const { data, error } = await authClient.signIn.email({
        email,
        password,
    });
    if (error) {
        toast({
            title: "Error",
            description: error.message,
        })
        return { error };
    }
    return { data, error };
}

export const signOut = async () => {
    const { error } = await authClient.signOut();
    if (error) {
        toast({
            title: "Error",
            description: error.message,
        })
        return { error };
    }
    localStorage.clear();
    return { error };
}

export const createTeam = async (name: string) => {
    const { data, error } = await authClient.organization.createTeam({
        name,
    });
    return { data, error };
}

export const getAllTeams = async () => {
    const { data, error } = await authClient.organization.listTeams();
    return { data, error };
}

export const deleteTeam = async (teamId: string) => {
    await authClient.organization.removeTeam({
        teamId,
    })
}

export const updateTeam = async (name: string, teamId: string) => {
    const updatedTeam = await authClient.organization.updateTeam({
        teamId,
        data: {
            name
        }
    })
    return updatedTeam;
}

// Inviting a new member to the team
export const inviteTeamMember = async (email: string, role: "member" | "admin" | "owner", teamId: string, organizationId: string) => {
    const { data, error } = await authClient.organization.inviteMember({
        email,
        role,
        teamId,
        organizationId,
    });
    return { data, error };
}
