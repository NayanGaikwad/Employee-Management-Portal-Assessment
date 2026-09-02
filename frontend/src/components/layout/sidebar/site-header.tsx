import { useLocation } from '@tanstack/react-router'
import { SidebarIcon } from 'lucide-react'
import { Fragment } from 'react'

import { SearchForm } from '@/components/layout/sidebar/search-form'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useSidebar } from '@/components/ui/sidebar'

function getCrumbs(pathname: string): string[] {
  const path = pathname.replace(/\/$/, '').split('/').filter(Boolean)
  if (path.length === 0) return ['Home']

  const labelOf = (segment: string): string => {
    if (/^\d+$/.test(segment)) return 'Details'
    const humanized = segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    return humanized
  }
  return path.map(labelOf)
}

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  const location = useLocation()
  const crumbs = getCrumbs(location.pathname)

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1
              return (
                <Fragment key={`${index}-${crumb}`}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{crumb}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href="#">{crumb}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <SearchForm className="w-full sm:ml-auto sm:w-auto" />
      </div>
    </header>
  )
}