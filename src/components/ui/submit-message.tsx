import { cn } from "@/utils/lib";

interface SubmitMessageProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  variant?: "default" | "floating";
  className?: string;
  onDismiss?: () => void;
}

const messageVariants = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
};

const messageIcons = {
  success: "🎉",
  error: "❌",
  info: "ℹ️",
  warning: "⚠️",
};

export default function SubmitMessage({ 
  message, 
  type = "info", 
  variant = "default",
  className,
  onDismiss
}: SubmitMessageProps) {
  if (!message) return null;

  // Auto-detect type based on message content if not specified
  const detectedType = type === "info" 
    ? (message.toLowerCase().includes("sucesso") ? "success" : 
       message.toLowerCase().includes("erro") ? "error" : "info")
    : type;

  const baseClasses = "p-4 border rounded-lg flex items-start gap-2";
  const variantClasses = variant === "floating" 
    ? "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 shadow-lg max-w-md mx-auto"
    : "mb-6";

  return (
    <div className={cn(
      baseClasses,
      variantClasses,
      messageVariants[detectedType],
      className
    )}>
      <span className="text-lg leading-none">
        {messageIcons[detectedType]}
      </span>
      <span className="flex-1">
        {message}
      </span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-current hover:opacity-70 ml-2"
          aria-label="Fechar mensagem"
        >
          ×
        </button>
      )}
    </div>
  );
} 