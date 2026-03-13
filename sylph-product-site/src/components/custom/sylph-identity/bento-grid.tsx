import { CardSpotlight } from "@/components/ui/card-spotlight";
import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoCellProps {
  children: React.ReactNode;
  colSpan?: number;
  rowSpan?: number;
  className?: string;
}

export function BentoCell({
  children,
  colSpan,
  rowSpan,
  className,
}: BentoCellProps) {
  return (
    <CardSpotlight
      spotlightColor="rgba(13, 148, 136, 0.06)"
      radius={350}
      className={cn(
        "rounded-xl border border-white/5 bg-[#111318] p-6 transition-all duration-300 hover:border-teal-500/15 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(45,212,191,0.08)]",
        colSpan === 2 && "md:col-span-2",
        colSpan === 3 && "md:col-span-3",
        rowSpan === 2 && "md:row-span-2",
        className
      )}
    >
      {children}
    </CardSpotlight>
  );
}
