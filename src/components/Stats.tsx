import { useTranslation } from "react-i18next";

const Stats = () => {
  const { t } = useTranslation();
  
  const stats = [
    { value: "99.9%", label: t('stats.uptime') },
    { value: "<2s", label: t('stats.verificationTime') },
    { value: "8+", label: t('stats.languages') },
    { value: "100%", label: t('stats.w3cCompliant')},
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-primary via-secondary to-accent relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
      
      <div className="container mx-auto px-6 relative">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center space-y-3 bg-white/10 backdrop-blur-md p-8 rounded-3xl border-2 border-white/20 shadow-2xl hover:bg-white/20 transition-all hover:scale-105"
            >
              <div className="text-6xl font-extrabold text-white drop-shadow-lg">{stat.value}</div>
              <div className="text-xl text-white/90 font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;