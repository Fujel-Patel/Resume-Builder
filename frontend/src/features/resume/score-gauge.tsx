import { cn } from "@/lib/utils"

type ScoreGaugeProps = {
  score: number
  size?: "sm" | "lg"
  variant?: "score" | "brand"
  className?: string
}

const sizeConfig = {
  sm: { dimension: 36, radius: 15.5, strokeWidth: 3 },
  lg: { dimension: 180, radius: 78, strokeWidth: 10 },
}

export function ScoreGauge({ score, size = "sm", variant = "score", className }: ScoreGaugeProps) {
  const config = sizeConfig[size]
  const circumference = 2 * Math.PI * config.radius
  const offset = circumference - (score / 100) * circumference

  const colorClass = variant === "brand"
    ? "stroke-brand"
    : score >= 80 ? "stroke-emerald-500"
    : score >= 60 ? "stroke-amber-500"
    : "stroke-red-500"

  return (
    <svg
      className={cn("-rotate-90 shrink-0", className)}
      viewBox={`0 0 ${config.dimension} ${config.dimension}`}
    >
      <circle
        cx={config.dimension / 2}
        cy={config.dimension / 2}
        r={config.radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={config.strokeWidth}
        className="text-muted"
      />
      <circle
        cx={config.dimension / 2}
        cy={config.dimension / 2}
        r={config.radius}
        fill="none"
        strokeWidth={config.strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={colorClass}
      />
    </svg>
  )
}
