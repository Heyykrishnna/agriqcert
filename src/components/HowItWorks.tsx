import { Upload, ClipboardCheck, Award, ScanLine } from "lucide-react";
import { useTranslation } from "react-i18next";

const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    {
      icon: Upload,
      title: t('howItWorks.step1'),
      description: t('howItWorks.step1Desc'),
      gradient: "from-primary to-primary",
    },
    {
      icon: ClipboardCheck,
      title: t('howItWorks.step2'),
      description: t('howItWorks.step2Desc'),
      gradient: "from-secondary to-secondary",
    },
    {
      icon: Award,
      title: t('howItWorks.step3'),
      description: t('howItWorks.step3Desc'),
      gradient: "from-accent to-accent",
    },
    {
      icon: ScanLine,
      title: t('howItWorks.step4'),
      description: t('howItWorks.step4Desc'),
      gradient: "from-primary via-secondary to-accent",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20 space-y-4">
          <div className="inline-block bg-gradient-to-r from-accent/20 to-primary/20 px-6 py-2 rounded-full border-2 border-accent/30 mb-4">
            <span className="text-base font-bold text-accent">{t('howItWorks.title')}</span>
          </div>
          <h2 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[#10b981] via-[#059669] to-[#10b981] bg-clip-text text-transparent">
            {t('howItWorks.title')}
          </h2>
          <p className="text-xl text-foreground max-w-2xl mx-auto font-medium">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-10 top-16 bottom-24 w-1 bg-gradient-to-b from-primary via-secondary to-accent rounded-full hidden lg:block shadow-lg"></div>

          <div className="space-y-16">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
                  <div className="flex-shrink-0">
                    <div className={`relative inline-flex rounded-3xl p-5 bg-gradient-to-br ${step.gradient} ring-8 ring-background shadow-2xl z-10 group hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-10 w-10 text-white" />
                      <div className="absolute -top-2 -right-2 bg-background border-2 border-primary rounded-full w-8 h-8 flex items-center justify-center font-bold text-primary shadow-lg">
                        {index + 1}
                      </div>
                    </div>
                  </div>

                  <div className="flex-grow space-y-3 bg-card/50 backdrop-blur-sm p-8 rounded-2xl border-2 border-primary/10 shadow-lg hover:shadow-xl transition-all hover:border-primary/30">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">Step {index + 1}</span>
                      <div className="h-px flex-grow bg-gradient-to-r from-primary/50 to-transparent"></div>
                    </div>
                    <h3 className="text-3xl font-extrabold text-foreground">{step.title}</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl font-medium">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;