import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, CheckCircle2, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-agriculture.jpg";

const Hero = () => {

  return (
    <section 
      className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 pt-32 pb-24"
    >
      <div className="container relative mx-auto px-6 z-10">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="animate-fade-in inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 px-6 py-3 backdrop-blur-sm border-2 border-primary/30 shadow-lg" style={{ animationDelay: '0.2s' }}>
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-base font-bold text-foreground">Trusted Digital Certification</span>
            </div>
            
            <h1 className="animate-fade-in text-6xl font-extrabold tracking-tight text-foreground lg:text-7xl leading-tight">
              Verifiable Quality Certificates for
              <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Agricultural Exports
              </span>
            </h1>
            
            <p className="animate-fade-in text-2xl leading-relaxed text-muted-foreground font-medium" style={{ animationDelay: '0.4s' }}>
              AgroTrace transforms agricultural quality assurance with W3C-compliant Digital Product Passports. 
              Secure, verifiable, and instantly accessible certification for global trade.
            </p>
            
            <div className="animate-fade-in flex flex-wrap gap-4" style={{ animationDelay: '0.6s' }}>
              <Link to="/auth">
                <Button size="lg" className="gap-2 shadow-2xl text-lg px-8 py-6 font-bold bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all group">
                  Get Started
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/public-verify">
                <Button size="lg" variant="outline" className="border-2 border-primary/30 hover:border-primary text-lg px-8 py-6 font-bold backdrop-blur-sm hover:bg-primary/10 transition-all">
                  Verify Certificate
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="animate-fade-in flex items-center gap-2 bg-card/50 px-4 py-2 rounded-full border border-primary/20" style={{ animationDelay: '0.8s' }}>
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">W3C Compliant</span>
              </div>
              <div className="animate-fade-in flex items-center gap-2 bg-card/50 px-4 py-2 rounded-full border border-secondary/20" style={{ animationDelay: '0.9s' }}>
                <Zap className="h-5 w-5 text-secondary" />
                <span className="text-sm font-semibold text-foreground">Blockchain Verified</span>
              </div>
              <div className="animate-fade-in flex items-center gap-2 bg-card/50 px-4 py-2 rounded-full border border-accent/20" style={{ animationDelay: '1s' }}>
                <Shield className="h-5 w-5 text-accent" />
                <span className="text-sm font-semibold text-foreground">Instant QR Access</span>
              </div>
            </div>
          </div>
          
          <div className="animate-scale-in relative" style={{ animationDelay: '0.3s' }}>
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 blur-3xl animate-pulse"></div>
            <img 
              src="https://res.cloudinary.com/dqh5g2nmn/image/upload/v1763895895/AGROTRACE_nbkape.png"
              alt="Modern agricultural quality certification" 
              className="relative rounded-3xl shadow-2xl ring-4 ring-primary/20 hover:ring-primary/40 transition-all"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
