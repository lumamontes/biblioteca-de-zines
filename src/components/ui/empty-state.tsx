import { cn } from "@/utils/lib";
import ActionButton from "./action-button";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon = "📝",
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "text-center py-12 px-4",
      className
    )}>
      <div className="text-6xl mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-neutral-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-neutral-600 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <ActionButton
          variant="primary"
          onClick={onAction}
        >
          {actionLabel}
        </ActionButton>
      )}
    </div>
  );
} 