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
}

export function BreadcrumbNavigation({ items, className = "" }: BreadcrumbNavigationProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-2 text-sm ${className}`}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={item.url} className="flex items-center">
            {index > 0 && (
              <ChevronRight 
                className="w-4 h-4 mx-2 text-gray-400 flex-shrink-0" 
                aria-hidden="true"
              />
            )}
            {item.current || index === items.length - 1 ? (
              <span 
                className="text-gray-900 font-medium" 
                aria-current="page"
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
}

export function BreadcrumbWrapper({ items, children, className }: BreadcrumbWrapperProps) {
  return (
    <div className={className}>
      <BreadcrumbNavigation items={items} className="mb-6 px-4 md:px-12 max-w-6xl mx-auto pt-4" />
      {children}
    </div>
  )
}