'use client';
import { ChevronDown, Command, Plus } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type OrganizationBasic = {
  id: string;
  name: string;
  // Add other relevant fields if known
};

export function OrgSwitcher() {
  const [isMounted, setIsMounted] = useState(false);
  const { data: organizations } = authClient.useListOrganizations();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const router = useRouter();

  // Set mounted state after initial render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleOrgSwitch = async (org: OrganizationBasic) => {
    await authClient.organization.setActive({
      organizationId: org.id,
    });
    router.push(`/dashboard`);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="w-fit px-1.5 focus-visible:outline-none focus-visible:ring-0">
              <div className="flex aspect-square size-5 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <Command className="size-3" />
              </div>
              <span className="truncate font-semibold">{isMounted ? activeOrg?.name || 'Select Org' : 'Loading...'}</span>
              <ChevronDown className="opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 rounded-lg" align="start" side="bottom" sideOffset={4}>
            <DropdownMenuLabel className="text-xs text-muted-foreground">Organizations</DropdownMenuLabel>
            {organizations?.map((organization) => (
              <DropdownMenuItem
                key={organization.id}
                onClick={() => handleOrgSwitch(organization)}
                className="cursor-pointer gap-2 p-2 focus-visible:outline-none"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <Command className="size-4 shrink-0" />
                </div>
                {organization.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/organization"
                className="flex items-center gap-2"
                onClick={() => {
                  router.push('/organization');
                }}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">Add organization</div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
