import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="border-t-2 border-primary/20 bg-card">
      <div className="container mx-auto px-6 py-12">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg">
                <img src="/AGROTRACELOGO.png"/>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AgroTrace
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              {t('footer.description')}
            </p>
          </div>
          
          <div>
            <h3 className="mb-4 text-base font-bold text-foreground">{t('footer.product')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#features" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  {t('footer.features')}
                </a>
              </li>
              <li>
                <Link to="/public-verify" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  {t('footer.verify')}
                </Link>
              </li>
              <li>
                <Link to="/batch-verify" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  {t('footer.batchVerify')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-base font-bold text-foreground">{t('footer.company')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  {t('footer.about')}
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  {t('footer.contact')}
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  {t('footer.careers')}
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-base font-bold text-foreground">{t('footer.legal')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  {t('footer.privacy')}
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  {t('footer.terms')}
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t-2 border-primary/10 pt-8 text-center">
          <p className="text-sm text-muted-foreground font-medium">
            © 2025 AgroTrace. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;