import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
        secondary:
          "border-transparent bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
        success:
          "border-transparent bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
        destructive:
          "border-transparent bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
        warning:
          "border-transparent bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
        outline: "text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
