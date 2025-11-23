import { Shield, QrCode, Globe, Lock, FileCheck, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "W3C Verifiable Credentials",
    description: "Industry-standard digital certificates that are cryptographically secure and globally recognized.",
    color: "from-primary to-primary/70",
  },
  {
    icon: QrCode,
    title: "Instant QR Verification",
    description: "Generate and scan QR codes for immediate certificate validation at customs and ports.",
    color: "from-secondary to-secondary/70",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description: "Seamless operation in 8+ languages including English, Hindi, French, Arabic, Spanish, and more.",
    color: "from-accent to-accent/70",
  },
  {
    icon: Lock,
    title: "DID-Based Security",
    description: "Decentralized identifiers ensure tamper-proof authentication for all participants.",
    color: "from-primary to-secondary",
  },
  {
    icon: FileCheck,
    title: "Complete Audit Trail",
    description: "Full transparency with immutable records of inspections, certifications, and verifications.",
    color: "from-secondary to-accent",
  },
  {
    icon: Zap,
    title: "Real-Time Processing",
    description: "Lightning-fast batch submissions, inspections, and credential issuance workflows.",
    color: "from-accent to-primary",
  },
];

const Features = () => {

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block bg-gradient-to-r from-primary/20 to-secondary/20 px-6 py-2 rounded-full border-2 border-primary/30 mb-4">
            <span className="text-base font-bold text-primary">✨ Platform Features</span>
          </div>
          <h2 className="text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-[#10b981] via-[#059669] to-[#10b981] bg-clip-text text-transparent">
              Trusted by Exporters & QA Agencies
            </span>{" "}
            <span className="text-foreground">Worldwide</span>
          </h2>
          <p className="text-xl text-foreground max-w-3xl mx-auto font-medium">
            Everything you need to digitize agricultural quality certification and streamline global trade
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="group border-2 bg-card shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden relative"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.color}`}></div>
                <CardContent className="pt-8 pb-6 px-6">
                  <div className={`mb-6 inline-flex rounded-2xl bg-gradient-to-br ${feature.color} p-4 shadow-lg ring-4 ring-background group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed font-medium">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
