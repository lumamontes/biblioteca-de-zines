import { cn } from "@/utils/lib";

interface InfoBoxProps {
  children: React.ReactNode;
  variant?: "blue" | "green" | "yellow" | "gray";
  className?: string;
}

const variants = {
  blue: "bg-blue-50 border-blue-200 text-blue-800",
  green: "bg-green-50 border-green-200 text-green-800", 
  yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
  gray: "bg-gray-50 border-gray-200 text-gray-800",
};

export default function InfoBox({ 
  children, 
  variant = "blue", 
  className 
}: InfoBoxProps) {
  return (
    <div className={cn(
      "border p-4 rounded-lg text-left",
      variants[variant],
      className
    )}>
      {children}
    </div>
  );
} 