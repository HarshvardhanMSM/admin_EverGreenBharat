"use client";

import { forwardRef, ComponentProps } from "react";
import { cn } from "@/lib/utils";

export interface RememberMeProps extends Omit<ComponentProps<"input">, "type"> {
  label?: string;
}

export const RememberMe = forwardRef<HTMLInputElement, RememberMeProps>(
  ({ className, disabled, label = "Remember me for 30 days", id = "remember-me", ...props }, ref) => {
    return (
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={id}
          ref={ref}
          disabled={disabled}
          className={cn(
            "h-4 w-4 rounded border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 accent-primary cursor-pointer",
            className
          )}
          {...props}
        />
        <label
          htmlFor={id}
          className="text-xs font-medium text-muted-foreground select-none cursor-pointer hover:text-foreground"
        >
          {label}
        </label>
      </div>
    );
  }
);

RememberMe.displayName = "RememberMe";
