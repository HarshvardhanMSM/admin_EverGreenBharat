"use client";

import React from "react";
import { Check, ChevronDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterOption } from "@/constants/filter-options";

export type { FilterOption };


export interface FilterDropdownProps {
  value: string;
  options: FilterOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  width?: string;
  icon?: React.ReactNode;
  align?: "start" | "center" | "end";
  variant?: "outline" | "default" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  ariaLabel?: string;
}

export function FilterDropdown({
  value,
  options,
  onValueChange,
  placeholder = "Select option",
  label,
  disabled = false,
  className,
  width,
  icon,
  align = "start",
  variant = "outline",
  size = "default",
  ariaLabel,
}: FilterDropdownProps) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        render={
          <Button
            variant={variant}
            size={size}
            disabled={disabled}
            aria-label={ariaLabel || label || placeholder}
            className={cn(
              "flex items-center justify-between gap-2 font-normal bg-background hover:bg-accent hover:text-accent-foreground text-sm rounded-md transition-colors shrink-0 whitespace-nowrap shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              width,
              className
            )}
          >
            <div className="flex items-center gap-2 truncate">
              {icon || selectedOption?.icon || (
                <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              )}
              <span className="truncate">
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform duration-200" />
          </Button>
        }
      />
      <DropdownMenuContent align={align} className={cn("min-w-[160px] p-1", width)}>
        {label && (
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
            {label}
          </DropdownMenuLabel>
        )}
        <DropdownMenuGroup>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <DropdownMenuItem
                key={option.value}
                disabled={option.disabled}
                onClick={() => onValueChange(option.value)}
                className={cn(
                  "flex items-center justify-between gap-2 px-2.5 py-1.5 text-sm cursor-pointer rounded-md transition-colors",
                  isSelected && "bg-accent text-accent-foreground font-medium"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  {option.icon && (
                    <span className="shrink-0 text-muted-foreground">{option.icon}</span>
                  )}
                  <div className="flex flex-col">
                    <span className="truncate">{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {option.badge !== undefined && (
                    <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                      {option.badge}
                    </span>
                  )}
                  {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
