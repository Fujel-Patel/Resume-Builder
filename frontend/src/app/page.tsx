import { PublicNavbar } from "@/components/landing/public-navbar"
import { Hero } from "@/components/landing/hero"
import { TrustBar } from "@/components/landing/trust-bar"
import { Features } from "@/components/landing/features"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Pricing } from "@/components/landing/pricing"
import { Cta } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicNavbar />
      <main>
        <Hero />
        <TrustBar />
        <Features />
        <HowItWorks />
        <Pricing />
        <Cta />
      </main>
      <Footer />
    </div>
  )
}
