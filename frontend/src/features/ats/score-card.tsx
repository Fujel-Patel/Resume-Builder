type ScoreCardProps = {
  score: number
  size?: "sm" | "lg"
}

export function ScoreCard({ score, size = "lg" }: ScoreCardProps) {
  const radius = size === "lg" ? 60 : 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const getColor = (s: number) => {
    if (s >= 80) return "stroke-emerald-500"
    if (s >= 60) return "stroke-amber-500"
    return "stroke-red-500"
  }

  const getLabel = (s: number) => {
    if (s >= 80) return "Great"
    if (s >= 60) return "Good"
    if (s >= 40) return "Fair"
    return "Needs Work"
  }

  const dimension = size === "lg" ? 160 : 110

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={dimension}
        height={dimension}
        viewBox={`0 0 ${dimension} ${dimension}`}
        className="-rotate-90"
      >
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={size === "lg" ? 8 : 6}
          className="text-muted"
        />
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          strokeWidth={size === "lg" ? 8 : 6}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={getColor(score)}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span className={`font-bold ${size === "lg" ? "text-3xl" : "text-xl"}`}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground">{getLabel(score)}</span>
      </div>
    </div>
  )
}
