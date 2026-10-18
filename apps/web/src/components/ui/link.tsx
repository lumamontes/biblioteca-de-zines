import { cn } from "@/utils/lib";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: "default" | "subtle";
  children: React.ReactNode;
}

export default function Link({ 
  variant = "default", 
  className, 
  children, 
  ...props 
}: LinkProps) {
  const variants = {
    default: "text-blue-600 hover:text-blue-800 underline",
    subtle: "text-blue-600 hover:underline",
  };

  return (
    <a 
      className={cn(variants[variant], className)} 
      {...props}
    >
      {children}
    </a>
  );
} 