"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { siteConfig } from "@/constants/site";
import { useLanguage } from "@/contexts/LanguageContext";

const FAQ = () => {
  const { t } = useLanguage();

  const faqs = [
    { questionKey: "faq.q1", answerKey: "faq.a1" },
    { questionKey: "faq.q2", answerKey: "faq.a2" },
    { questionKey: "faq.q3", answerKey: "faq.a3" },
    { questionKey: "faq.q4", answerKey: "faq.a4" },
    { questionKey: "faq.q5", answerKey: "faq.a5" },
    { questionKey: "faq.q6", answerKey: "faq.a6" },
  ];

  return (
    <section id="faq" className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block bg-brand-navy text-white px-4 py-2 text-sm font-bold uppercase tracking-wider mb-4">
              {t("faq.badge")}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-brand-navy">
              {t("faq.title")}
            </h2>
            <p className="text-brand-navy/70">
              {t("faq.subtitle")}
            </p>
          </div>

          {/* Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white border-2 border-brand-navy px-6 data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="text-left font-bold text-brand-navy hover:no-underline hover:text-brand-red py-5">
                  {t(faq.questionKey)}
                </AccordionTrigger>
                <AccordionContent className="text-brand-navy/70 pb-5">
                  {t(faq.answerKey)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-brand-navy/70 mb-4">
              {t("faq.moreQuestions")}
            </p>
            <a
              href={`tel:${siteConfig.phone}`}
              className="inline-flex items-center gap-2 bg-brand-red text-white px-6 py-3 font-bold uppercase tracking-wide hover:bg-brand-red-dark transition-colors border-2 border-brand-navy"
            >
              {t("faq.callUs")} {siteConfig.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
