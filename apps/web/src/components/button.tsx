import { cn } from "@/utils/lib";
import { Slot } from "@radix-ui/react-slot";
import React from "react";

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild, className, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        disabled={disabled}
        className={cn(
          "text-base px-6 py-3 border border-black transition duration-300 flex items-center justify-center",
          disabled 
            ? "bg-neutral-200 text-neutral-500 border-neutral-300 cursor-not-allowed" 
            : "hover:bg-neutral-100",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
