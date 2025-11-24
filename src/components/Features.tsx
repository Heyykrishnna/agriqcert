import { Shield, QrCode, Globe, Lock, FileCheck, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block bg-gradient-to-r from-primary/20 to-secondary/20 px-6 py-2 rounded-full border-2 border-primary/30 mb-4">
            <span className="text-base font-bold text-primary">{t('features.title')}</span>
          </div>
          <h2 className="text-5xl font-extrabold tracking-tight text-foreground">
            {t('features.subtitle')}
          </h2>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="group border-2 bg-card shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/70"></div>
            <CardContent className="pt-8 pb-6 px-6">
              <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-4 shadow-lg ring-4 ring-background group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-foreground">{t('features.w3cCredentials')}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">{t('features.w3cDesc')}</p>
            </CardContent>
          </Card>
          
          <Card className="group border-2 bg-card shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-secondary/70"></div>
            <CardContent className="pt-8 pb-6 px-6">
              <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-secondary to-secondary/70 p-4 shadow-lg ring-4 ring-background group-hover:scale-110 transition-transform duration-300">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-foreground">{t('features.blockchainAnchor')}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">{t('features.blockchainDesc')}</p>
            </CardContent>
          </Card>
          
          <Card className="group border-2 bg-card shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-accent/70"></div>
            <CardContent className="pt-8 pb-6 px-6">
              <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-accent to-accent/70 p-4 shadow-lg ring-4 ring-background group-hover:scale-110 transition-transform duration-300">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-foreground">{t('features.qrVerification')}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">{t('features.qrDesc')}</p>
            </CardContent>
          </Card>
          
          <Card className="group border-2 bg-card shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
            <CardContent className="pt-8 pb-6 px-6">
              <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-primary to-secondary p-4 shadow-lg ring-4 ring-background group-hover:scale-110 transition-transform duration-300">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-foreground">{t('features.multiStakeholder')}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">{t('features.multiStakeholderDesc')}</p>
            </CardContent>
          </Card>
          
          <Card className="group border-2 bg-card shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-accent"></div>
            <CardContent className="pt-8 pb-6 px-6">
              <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-secondary to-accent p-4 shadow-lg ring-4 ring-background group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-foreground">{t('features.digitalWallet')}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">{t('features.digitalWalletDesc')}</p>
            </CardContent>
          </Card>
          
          <Card className="group border-2 bg-card shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-primary"></div>
            <CardContent className="pt-8 pb-6 px-6">
              <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-accent to-primary p-4 shadow-lg ring-4 ring-background group-hover:scale-110 transition-transform duration-300">
                <FileCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-foreground">{t('features.auditTrail')}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">{t('features.auditTrailDesc')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Features;