"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  // IconFolder,
  // IconFolder,
  // IconInnerShadowTop,
  IconListDetails,
  IconUsers,
  IconList
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { OrgSwitcher } from "./org-switcher/org-switcher"

const sidebarData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Chat",
      url: "/chat",
      icon: IconUsers,
    },
    {
      title: "Teams",
      url: "/team",
      icon: IconChartBar,
    },
    {
      title: "Support",
      url: "/support",
      icon: IconUsers,
    },
    {
      title: "Kanban",
      url: "/kanban",
      icon: IconListDetails,
    },
    {
      title: "Tickets",
      url: "/tickets",
      icon: IconList,
    }
    // {
    //   title: "Lifecycle",
    //   url: "#",
    //   icon: IconListDetails,
    // },
    // {
    //   title: "Analytics",
    //   url: "#",
    //   icon: IconChartBar,
    // },
    // {
    //   title: "Projects",
    //   url: "#",
    //   icon: IconFolder,
    // },
    // {
    //   title: "Team",
    //   url: "#",
    //   icon: IconUsers,
    // },
  ],

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar> ) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <OrgSwitcher />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
        {/* <NavDocuments items={sidebarData.documents} /> */}
        {/* <NavSecondary items={sidebarData.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
