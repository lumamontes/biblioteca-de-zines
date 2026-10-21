import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface BreadcrumbItem {
  name: string
  url: string
  current?: boolean
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[]
  className?: string
  truncateCurrent?: boolean
}

export function BreadcrumbNavigation({ items, className = "", truncateCurrent = false }: BreadcrumbNavigationProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex min-w-0 items-center space-x-2 overflow-hidden text-sm ${className}`}>
      <ol className="flex min-w-0 items-center space-x-2">
        {items.map((item, index) => (
          <li key={item.url} className={`flex items-center ${truncateCurrent && index === items.length - 1 ? "min-w-0" : ""}`}>
            {index > 0 && (
              <ChevronRight 
                className="w-4 h-4 mx-2 text-gray-400 flex-shrink-0" 
                aria-hidden="true"
              />
            )}
            {item.current || index === items.length - 1 ? (
              <span 
                className={`text-gray-900 font-medium ${truncateCurrent && index === items.length - 1 ? "block max-w-[8rem] truncate sm:max-w-56" : ""}`}
                aria-current="page"
                title={truncateCurrent && index === items.length - 1 ? item.name : undefined}
              >
                {item.name}
              </span>
            ) : (
              <Link
                href={item.url}
                className="text-gray-500 hover:text-gray-700 transition-colors underline-offset-4 hover:underline"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Higher-order component that includes both visual breadcrumbs and structured data
interface BreadcrumbWrapperProps {
  items: BreadcrumbItem[]
  children: React.ReactNode
  className?: string
  showNavigation?: boolean
}

export function BreadcrumbWrapper({ items, children, className, showNavigation = true }: BreadcrumbWrapperProps) {
  return (
    <div className={className}>
      {showNavigation && <BreadcrumbNavigation items={items} className="mx-auto mb-6 max-w-8xl px-8 pt-4 sm:px-10 lg:px-16" />}
      {children}
    </div>
  )
}
