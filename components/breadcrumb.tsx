"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn("mb-6 flex items-center gap-2 text-sm", className)}>
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <Link
            href={item.href}
            className={cn(
              "rounded-md px-3 py-1 transition-colors",
              index === items.length - 1
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label.toUpperCase()}
          </Link>
        </div>
      ))}
    </nav>
  )
}
