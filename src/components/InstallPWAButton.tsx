import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Download, X } from "lucide-react";
import { Card } from "./ui/card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if user is on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');

    if (isStandalone) {
      return; // Don't show install prompt if already installed
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if user has dismissed the banner before
      const dismissed = localStorage.getItem('pwa-banner-dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  // iOS install instructions
  if (isIOS && !showInstallBanner) {
    return null;
  }

  // Show banner for Android/Desktop
  if (showInstallBanner && deferredPrompt) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 p-4 border-2 border-primary/30 bg-card/95 backdrop-blur-sm shadow-2xl animate-slide-in-bottom">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm sm:text-base mb-1">Install AgroTrace App</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3">
              Install our app for quick access and offline verification
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={handleInstallClick}
                size="sm"
                className="flex-1 min-h-[40px]"
              >
                Install
              </Button>
              <Button 
                onClick={handleDismiss}
                size="sm"
                variant="outline"
                className="min-h-[40px]"
              >
                Not Now
              </Button>
            </div>
          </div>
          <Button
            onClick={handleDismiss}
            size="icon"
            variant="ghost"
            className="h-8 w-8 min-h-[32px] min-w-[32px]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  // Inline button (for iOS or when banner is dismissed)
  if (deferredPrompt && !showInstallBanner) {
    return (
      <Button
        onClick={handleInstallClick}
        variant="outline"
        size="lg"
        className="gap-2 border-2 border-primary/30 hover:border-primary min-h-[48px]"
      >
        <Download className="h-5 w-5" />
        Install App
      </Button>
    );
  }

  return null;
};