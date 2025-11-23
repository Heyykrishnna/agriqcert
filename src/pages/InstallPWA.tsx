import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Smartphone, 
  Download, 
  CheckCircle, 
  QrCode,
  Zap,
  Shield,
  Wifi,
  Home,
  Share,
  Info
} from "lucide-react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
      setIsInstalled(true);
    }

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      toast.success("App installed successfully!");
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        toast.info("Please use the Share button in Safari to add to home screen");
      } else {
        toast.info("Installation prompt not available. You may have already installed the app.");
      }
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast.success("Installing app...");
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error("Installation error:", error);
      toast.error("Failed to install app");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-6 w-6" />
              <div>
                <h1 className="text-xl font-bold">Install AgroTrace</h1>
                <p className="text-xs opacity-90">Mobile Scanner App</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Home className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        {/* Installation Status */}
        {isStandalone ? (
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <CheckCircle className="h-12 w-12" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">App Installed!</h3>
                  <p className="text-sm opacity-90">
                    You're using the installed version. Ready to scan!
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/scanner")}
                className="w-full mt-4 bg-white text-green-600 hover:bg-white/90"
                size="lg"
              >
                Open Scanner
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-6 w-6 text-primary" />
                Install Mobile App
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Install AgroTrace on your phone for the best scanning experience. 
                Works offline and loads instantly!
              </p>

              {!isIOS && deferredPrompt && (
                <Button 
                  onClick={handleInstallClick}
                  className="w-full"
                  size="lg"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Install Now
                </Button>
              )}

              {isIOS && (
                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800 space-y-3">
                  <p className="font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    iOS Installation Steps
                  </p>
                  <ol className="text-sm text-blue-900 dark:text-blue-100 space-y-2 list-decimal list-inside">
                    <li className="flex items-start gap-2">
                      <span className="flex-1">
                        Tap the <Share className="inline h-4 w-4" /> <strong>Share</strong> button in Safari
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-1">
                        Scroll and tap <strong>"Add to Home Screen"</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-1">
                        Tap <strong>"Add"</strong> to install
                      </span>
                    </li>
                  </ol>
                </div>
              )}

              {!isIOS && !deferredPrompt && !isInstalled && (
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    Installation will be available after you browse the app. 
                    Try visiting the <a href="/scanner" className="text-primary underline">scanner page</a> first.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Lightning Fast</h4>
                <p className="text-xs text-muted-foreground">
                  Instant loading, no browser overhead
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Wifi className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Works Offline</h4>
                <p className="text-xs text-muted-foreground">
                  Scan and verify without internet
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <QrCode className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Quick Access</h4>
                <p className="text-xs text-muted-foreground">
                  Launch scanner from home screen
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Secure & Private</h4>
                <p className="text-xs text-muted-foreground">
                  No tracking, data stays on device
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Try Now */}
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
          <CardContent className="p-6 text-center">
            <QrCode className="h-12 w-12 mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">Try the Scanner</h3>
            <p className="text-sm opacity-90 mb-4">
              Test the QR scanner in your browser first
            </p>
            <Button
              onClick={() => navigate("/scanner")}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              Open Scanner
            </Button>
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2 text-sm">What is a PWA?</h4>
            <p className="text-xs text-muted-foreground mb-2">
              A Progressive Web App (PWA) is a modern web application that can be installed on your phone. 
              It works like a native app but doesn't require app store downloads.
            </p>
            <p className="text-xs text-muted-foreground">
              Perfect for customs officers, retail staff, and anyone who needs quick product verification on the go.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstallPWA;
