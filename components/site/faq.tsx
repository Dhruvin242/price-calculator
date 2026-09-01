import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FAQS = [
  {
    q: "How does Bloom Factory calculate my price?",
    a: "It uses the pricing model handmade businesses already trust: material cost per piece, labor, and overhead give your base cost. We then apply your wholesale and retail margins, take the higher of keystone or your custom retail target, and gross it up to absorb platform fees.",
  },
  {
    q: "Do I need to understand the formulas?",
    a: "No. You enter real-world inputs — what a pack costs, how much you use, your hourly rate — and Bloom Factory does the math. The formulas are there if you want them, but you never have to touch a cell.",
  },
  {
    q: "Can I price for wholesale and retail at the same time?",
    a: "Yes. Every product shows wholesale, keystone retail, and your custom retail target together, so you can sell to boutiques and direct-to-customer without recalculating anything.",
  },
  {
    q: "What does the margin-health rating mean?",
    a: "It’s a quick red / yellow / green signal based on your net profit margin: red under 15%, yellow between 15% and 25%, and green at 25% or above. It tells you at a glance whether a price is worth selling at.",
  },
  {
    q: "Does it account for Etsy, Shopify, or payment fees?",
    a: "It does. Set your platform or payment fee percentage and we gross up the selling price so those fees come out of the buyer’s price, not your profit.",
  },
  {
    q: "Is my data private and secure?",
    a: "Yes. Your account and products are protected with row-level security, so only you can see and edit your data. We never share it.",
  },
]

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">FAQ</p>
          <h2 className="mt-2 text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Questions, answered
          </h2>
        </div>

        <Accordion className="mt-10 bg-card" multiple>
          {FAQS.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
