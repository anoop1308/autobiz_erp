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

export const { useSession } = createAuthClient();

const teams = ['Support Team', 'Sales Team', 'Engineers Team']

export const signUp = async (email: string, password: string, name: string, invitationId?: string) => {
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
    if (invitationId) {
        const { error } = await authClient.organization.acceptInvitation({
            invitationId,
        });
        if (error) {
            toast({
                title: "Error",
                description: error.message,
            })
            return { error };
        }
    } else {
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

        teams.forEach(async (team) => {
             await createTeam(team);
        })

    }
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

export const createOrganization = async (name: string) => {
    const data = await authClient.organization.create({
        name,
        slug: generateSlug(name),
    });
    return data;
}

// Inviting a new member to the team
export const inviteTeamMember = async (email: string, role: "member" | "admin" | "owner", teamId: string) => {
    const data = await authClient.organization.inviteMember({
        email,
        role,
        teamId,
    });
    return data;
}

export const updateOrganization = async (organizationId: string, name: string) => {
    const data = await authClient.organization.update({
        organizationId,
        data: {
            name,
        }
    });
    return data;
}

export const deleteOrganization = async (organizationId: string) => {
    const data = await authClient.organization.delete({
        organizationId,
    });
    return data;
}

export const getFullOrganization = async () => {
    const data = await authClient.organization.getFullOrganization();
    return data;
}

export const inviteOrgMember = async (email: string, role: "member" | "admin" | "owner") => {
    const data = await authClient.organization.inviteMember({
        email,
        role,
    });
    return data;
}