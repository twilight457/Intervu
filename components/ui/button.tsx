import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold leading-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        default:
          "bg-indigo-600 text-white hover:bg-indigo-500 shadow-2xs",
        destructive:
          "bg-rose-950/80 text-rose-300 border border-rose-800/80 hover:bg-rose-900/90 shadow-2xs",
        outline:
          "border border-slate-800 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white shadow-2xs",
        secondary:
          "bg-slate-800/80 text-slate-100 hover:bg-slate-700/90 shadow-2xs",
        ghost:
          "text-slate-300 hover:bg-slate-800/60 hover:text-white",
        link:
          "text-indigo-400 underline-offset-4 hover:underline",
        gradient:
          "bg-indigo-600 text-white hover:bg-indigo-500 shadow-2xs",
        success:
          "bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900/90 shadow-2xs",
      },
      size: {
        default: "h-11 px-5 py-2.5 text-sm",
        sm: "h-9 px-4 py-2 text-xs",
        lg: "h-12 px-6 py-3 text-sm font-semibold",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
