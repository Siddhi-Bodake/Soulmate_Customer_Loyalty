import { cn } from "@/lib/utils";

export function PointsDisplay({
  points,
  size = "lg",
  className,
}: {
  points: number;
  size?: "lg" | "xl";
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline gap-1.5", className)}>
      <span
        className={cn(
          "font-heading font-extrabold tabular-nums text-primary",
          size === "xl" ? "text-6xl md:text-7xl" : "text-4xl md:text-5xl"
        )}
      >
        {points.toLocaleString()}
      </span>
      <span className="text-sm font-medium text-muted-foreground md:text-base">
        pts
      </span>
    </div>
  );
}
