import { cn } from "@/utils/lib";
import Title from "./title";

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  className?: string;
}

export default function FormSection({
  title,
  children,
  headerAction,
  className,
}: FormSectionProps) {
  return (
    <div className={cn(
      "bg-white border border-neutral-200 p-6 rounded-lg",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <Title variant="h2" className="mb-0">
          {title}
        </Title>
        {headerAction}
      </div>
      {children}
    </div>
  );
} 