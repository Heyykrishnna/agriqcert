import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CTA = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-6">
        <div className="rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
          
          <div className="relative space-y-8 max-w-4xl mx-auto">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full border-2 border-white/30 mb-4">
              <span className="text-base font-bold text-white">{t('cta.title')}</span>
            </div>
            
            <h2 className="text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              {t('cta.title')}
            </h2>
            <p className="text-2xl text-white/90 font-medium max-w-3xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-6">
              <Link to="/auth">
                <Button size="lg" className="gap-2 shadow-2xl text-lg px-10 py-7 font-bold bg-white text-primary hover:bg-white/90 transition-all group">
                  {t('cta.startTrial')}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/public-verify">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white/50 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm text-lg px-10 py-7 font-bold transition-all"
                >
                  {t('cta.scheduleDemo')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;