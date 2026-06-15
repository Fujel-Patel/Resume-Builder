import {
  Sparkles,
  Upload,
  BarChart3,
  Layers,
  Eye,
  Download,
} from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "AI Resume Builder",
    description:
      "Generate tailored resumes with AI suggestions for every section. Let AI write your summary, improve your bullets, and suggest relevant skills.",
  },
  {
    icon: Upload,
    title: "Resume Parsing",
    description:
      "Upload existing resumes in PDF or DOCX — we extract and populate everything automatically. No more manual data entry.",
  },
  {
    icon: BarChart3,
    title: "ATS Score Analysis",
    description:
      "Get AI-powered ATS compatibility scores with actionable feedback. Know exactly what to improve before you apply.",
  },
  {
    icon: Layers,
    title: "Multiple AI Providers",
    description:
      "Use your own Anthropic, Google Gemini, or NVIDIA API keys. Choose the provider and model that works best for you.",
  },
  {
    icon: Eye,
    title: "Live Preview",
    description:
      "See real-time A4-formatted previews as you type. Switch between templates instantly — your data is always preserved.",
  },
  {
    icon: Download,
    title: "PDF Export",
    description:
      "Export polished, ATS-friendly PDFs with one click. Professional formatting that looks great and passes automated screening.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-h2 text-foreground">Everything You Need</h2>
          <p className="mt-3 text-body text-muted-foreground">
            A complete toolkit for building resumes that land interviews.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-card border bg-card p-6 ring-1 ring-foreground/5 transition-all duration-200 hover:-translate-y-0.5 hover:ring-brand/30"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10">
                <feature.icon className="size-5 text-brand" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
