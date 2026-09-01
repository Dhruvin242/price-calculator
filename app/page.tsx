import { Navbar } from "@/components/site/navbar"
import { Footer } from "@/components/site/footer"
import { Hero } from "@/components/site/hero"
import { SocialProof } from "@/components/site/social-proof"
import { Features } from "@/components/site/features"
import { Showcase } from "@/components/site/showcase"
import { HowItWorks } from "@/components/site/how-it-works"
import { Testimonials } from "@/components/site/testimonials"
import { Pricing } from "@/components/site/pricing"
import { Faq } from "@/components/site/faq"
import { Cta } from "@/components/site/cta"
import { MobileCta } from "@/components/site/mobile-cta"

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <SocialProof />
        <Features />
        <Showcase />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <Faq />
        <Cta />
      </main>
      <Footer />
      <MobileCta />
    </div>
  )
}
