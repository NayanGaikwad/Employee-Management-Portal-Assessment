import { Command, Building2, UsersRound } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type * as React from 'react'

import { NavUser } from '@/components/layout/sidebar/nav-user'
import { NavMain, type NavItem } from '@/components/layout/sidebar/nav-main'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useAuth } from '@/lib/auth'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isAdmin, logout } = useAuth()

  const navMain: NavItem[] = [
    {
      title: 'Employees',
      to: '/employees',
      icon: UsersRound,
      isActive: true,
      items: isAdmin
        ? [
            { title: 'Directory', to: '/employees' },
            { title: 'Add employee', to: '/employees/new' },
          ]
        : undefined,
    },
    {
      title: 'Departments',
      to: '/departments',
      icon: Building2,
    },
  ]

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/employees">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Employee Portal</span>
                  <span className="truncate text-xs">
                    {isAdmin ? 'Administration' : 'Staff'}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.roleName ?? 'User',
            email: user?.email ?? '',
          }}
          onLogout={logout}
        />
      </SidebarFooter>
    </Sidebar>
  )
}