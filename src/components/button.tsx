import { cn } from "@/utils/lib";
import { Slot } from "@radix-ui/react-slot";
import React from "react";

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(
          "text-base px-6 py-3 border border-black hover:bg-neutral-100 transition duration-300 flex items-center justify-center",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
