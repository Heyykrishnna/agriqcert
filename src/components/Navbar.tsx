import { Button } from "@/components/ui/button";
import { Sparkles, User, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";

const Navbar = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <nav
      className="animate-fade-in fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-b-2 border-primary/20 shadow-xl"
    >
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg">
                <img src="/AGROTRACELOGO.png" className="rounded-xl" />
              </div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              AgroTrace
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-base font-semibold text-foreground hover:text-primary transition-all hover:scale-105">
              {t('nav.features')}
            </a>
            <a href="#how-it-works" className="text-base font-semibold text-foreground hover:text-secondary transition-all hover:scale-105">
              {t('nav.howItWorks')}
            </a>
            <Link to="/public-verify" className="text-base font-semibold text-foreground hover:text-accent transition-all hover:scale-105">
              {t('nav.verifyDirect')}
            </Link>
            <Link to="/batch-verify" className="text-base font-semibold text-foreground hover:text-primary transition-all hover:scale-105">
              {t('nav.batchVerify')}
            </Link>
            {user && (
              <Link to="/auth" className="text-base font-semibold text-foreground hover:text-accent transition-all hover:scale-105 flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('nav.getStarted')}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector />
            {!user ? (
              <>
                <Link to="/auth">
                  <Button variant="outline" size="lg" className="font-bold border-2 hover:border-primary transition-all">
                    {t('nav.signIn')}
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" className="font-bold bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-xl">
                    {t('nav.getStarted')}
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/profile">
                <Button size="lg" className="font-bold bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-xl">
                  <User className="h-5 w-5 mr-2" />
                  {t('nav.myProfile')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;