import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t-2 border-primary/20 bg-card">
      <div className="container mx-auto px-6 py-12">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AgroTrace
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Transforming agricultural quality certification with verifiable digital passports
            </p>
          </div>
          
          <div>
            <h3 className="mb-4 text-base font-bold text-foreground">Product</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#features" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  Features
                </a>
              </li>
              <li>
                <Link to="/public-verify" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  Verify Certificate
                </Link>
              </li>
              <li>
                <Link to="/batch-verify" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  Batch Verify
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-base font-bold text-foreground">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-base font-bold text-foreground">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t-2 border-primary/10 pt-8 text-center">
          <p className="text-sm text-muted-foreground font-medium">
            © 2024 AgroTrace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
