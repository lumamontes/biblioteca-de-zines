import { cn } from "@/utils/lib";

interface TitleProps {
  children: React.ReactNode;
  variant?: "h1" | "h2" | "h3" | "h4";
  className?: string;
}

const titleVariants = {
  h1: "text-3xl md:text-4xl font-bold",
  h2: "text-2xl font-bold",
  h3: "text-xl font-semibold",
  h4: "text-lg font-medium",
};

export default function Title({ 
  children, 
  variant = "h1", 
  className 
}: TitleProps) {
  const Component = variant;
  
  return (
    <Component className={cn(titleVariants[variant], className)}>
      {children}
    </Component>
  );
} 