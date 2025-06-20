import { cn } from "@/utils/lib";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const buttonVariants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 border border-blue-600",
  secondary: "bg-white text-neutral-900 hover:bg-neutral-50 border border-neutral-300",
  danger: "bg-white text-red-600 hover:bg-red-50 border border-red-300",
  ghost: "bg-transparent text-blue-600 hover:text-blue-800 border-2 border-dashed border-neutral-300 hover:border-neutral-400",
};

const buttonSizes = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-base",
};

export default function ActionButton({
  variant = "secondary",
  size = "md",
  className,
  children,
  ...props
}: ActionButtonProps) {
  return (
    <button
      className={cn(
        "rounded transition duration-300 font-medium focus:ring-2 focus:ring-neutral-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
} 