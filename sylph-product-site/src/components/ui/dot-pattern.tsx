import { useId } from "react";
import { cn } from "@/lib/utils";

interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  cr?: number;
  cx?: number;
  cy?: number;
  x?: number;
  y?: number;
  className?: string;
}

export function DotPattern({
  width = 16,
  height = 16,
  cr = 1,
  cx = 1,
  cy = 1,
  x = 0,
  y = 0,
  className,
  ...props
}: DotPatternProps) {
  const id = useId();
  const patternId = `dot-pattern-${id}`;
  const maskGradientId = `dot-mask-gradient-${id}`;
  const maskId = `dot-mask-${id}`;

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={patternId}
          x={x}
          y={y}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={cx} cy={cy} r={cr} fill="currentColor" />
        </pattern>
        <radialGradient id={maskGradientId}>
          <stop offset="40%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id={maskId}>
          <rect
            width="100%"
            height="100%"
            fill={`url(#${maskGradientId})`}
          />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill={`url(#${patternId})`}
        mask={`url(#${maskId})`}
      />
    </svg>
  );
}
