import { Upload, Sparkles, Download } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Resume",
    description:
      "Upload your existing resume or start from a professionally designed template.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Optimize With AI",
    description:
      "Let AI tailor your resume to any job description. Improve summary, skills, and experience with one click.",
  },
  {
    number: "03",
    icon: Download,
    title: "Export Resume",
    description:
      "Download your polished, ATS-ready PDF. Ready to submit in minutes.",
  },
]

export function HowItWorks() {
  return (
    <section className="border-y py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-h2 text-foreground">How It Works</h2>
          <p className="mt-3 text-body text-muted-foreground">
            Three simple steps to a better resume.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.number} className="relative text-center">
              {index < steps.length - 1 && (
                <div className="absolute top-8 left-[60%] hidden h-px w-[80%] bg-border md:block" />
              )}
              <div className="mx-auto flex size-16 items-center justify-center rounded-full border-2 border-brand/20 bg-brand/5">
                <step.icon className="size-7 text-brand" />
              </div>
              <span className="mt-4 block text-sm font-bold text-brand">
                {step.number}
              </span>
              <h3 className="mt-2 text-sm font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
