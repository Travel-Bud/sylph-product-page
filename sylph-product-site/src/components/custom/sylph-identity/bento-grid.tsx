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
    <div
      className={cn(
        "rounded-xl border border-white/5 bg-[#111318] p-6 transition-all duration-300 hover:border-teal-500/10 hover:scale-[1.01]",
        colSpan === 2 && "md:col-span-2",
        colSpan === 3 && "md:col-span-3",
        rowSpan === 2 && "md:row-span-2",
        className
      )}
    >
      {children}
    </div>
  );
}
