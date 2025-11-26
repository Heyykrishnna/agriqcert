import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, Shield, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import FloatingParticles from "@/components/FloatingParticles";
import { Separator } from "@/components/ui/separator";

type UserRole = "exporter" | "qa_agency" | "importer" | "admin";

const Auth = () => {
  const { signIn, signUp, signInWithGoogle, user, userRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Sign In State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up State
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("exporter");

  useEffect(() => {
    // GSAP entrance animations
    const ctx = gsap.context(() => {
      gsap.from(logoRef.current, {
        y: -50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });

      gsap.from(cardRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && userRole) {
      if (userRole === "exporter") navigate("/exporter");
      else if (userRole === "qa_agency") navigate("/qa");
      else if (userRole === "importer") navigate("/importer");
      else if (userRole === "admin") navigate("/admin");
      else navigate("/");
    }
  }, [user, userRole, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(signInEmail, signInPassword);
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (signUpPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await signUp(signUpEmail, signUpPassword, fullName, role);
      setSignUpEmail("");
      setSignUpPassword("");
      setFullName("");
      setRole("exporter");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };


  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
      setLoading(false);
    }
  };



  return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#0f1419] to-[#0a0a0a] p-6 relative overflow-hidden">
      <FloatingParticles />

      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#10b981]/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Minimal Logo Section */}
        <div ref={logoRef} className="text-center mb-12">
          <Link to="/" className="inline-flex items-center justify-center mb-6 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] shadow-lg shadow-[#10b981]/30 group-hover:shadow-[#10b981]/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
              <img src="/AGROTRACELOGO.png" className="rounded-xl" />
            </div>
          </Link>
          <h1 className="text-2xl font-semibold text-white mb-2">Welcome back</h1>
          <p className="text-gray-500 text-sm">Sign in to continue to AgroTrace</p>
        </div>

        {/* Auth Card */}
        <div ref={cardRef}>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "signin" | "signup")} className="w-full">
            {/* Minimal Tab Selector */}
            <TabsList className="grid w-full grid-cols-2 bg-transparent border-b border-gray-800 rounded-none mb-8 p-0">
              <TabsTrigger
                value="signin"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#10b981] data-[state=active]:bg-transparent data-[state=active]:text-white text-gray-500 pb-3 transition-all duration-300"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#10b981] data-[state=active]:bg-transparent data-[state=active]:text-white text-gray-500 pb-3 transition-all duration-300"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Sign In Form */}
            <TabsContent value="signin" className="mt-0">
              <Card className="bg-[#0f1419]/60 backdrop-blur-2xl border border-gray-800/50 shadow-2xl rounded-2xl overflow-hidden">
                <CardContent className="pt-8 pb-8 px-8">
                  <form onSubmit={handleSignIn} className="space-y-5">
                    {error && (
                      <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-gray-400 text-sm font-normal">E-mail</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="name@example.com"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        required
                        className="bg-[#0a0a0a]/80 border-gray-800 text-white placeholder:text-gray-600 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/50 h-12 rounded-xl transition-all duration-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password" className="text-gray-400 text-sm font-normal">Password</Label>
                      </div>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        required
                        className="bg-[#0a0a0a]/80 border-gray-800 text-white placeholder:text-gray-600 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/50 h-12 rounded-xl transition-all duration-300"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-white hover:bg-gray-100 text-black font-medium h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mt-6"
                      disabled={loading}
                    >
                      {loading ? "Signing in..." : "Sign in"}
                    </Button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full bg-gray-800" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#0f1419] px-3 text-gray-500">Or continue with</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full bg-[#0a0a0a]/80 hover:bg-[#0a0a0a] hover:text-white text-white border border-gray-800 font-medium h-12 rounded-xl transition-all duration-300 hover:border-gray-700"
                    >
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Sign in with Google
                    </Button>

                    <div className="text-center text-sm text-gray-500 mt-4">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setActiveTab("signup")}
                        className="text-[#10b981] hover:text-[#059669] font-medium transition-colors duration-300"
                      >
                        Sign up
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sign Up Form */}
            <TabsContent value="signup" className="mt-0">
              <Card className="bg-[#0f1419]/60 backdrop-blur-2xl border border-gray-800/50 shadow-2xl rounded-2xl overflow-hidden">
                <CardContent className="pt-8 pb-8 px-8">
                  <form onSubmit={handleSignUp} className="space-y-5">
                    {error && (
                      <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="fullname" className="text-gray-400 text-sm font-normal">Full Name</Label>
                      <Input
                        id="fullname"
                        type="text"
                        placeholder="Your Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="bg-[#0a0a0a]/80 border-gray-800 text-white placeholder:text-gray-600 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/50 h-12 rounded-xl transition-all duration-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-gray-400 text-sm font-normal">E-mail</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="name@example.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        required
                        className="bg-[#0a0a0a]/80 border-gray-800 text-white placeholder:text-gray-600 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/50 h-12 rounded-xl transition-all duration-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-gray-400 text-sm font-normal">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="At least 6 characters"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        required
                        minLength={6}
                        className="bg-[#0a0a0a]/80 border-gray-800 text-white placeholder:text-gray-600 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/50 h-12 rounded-xl transition-all duration-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-gray-400 text-sm font-normal">Account Type</Label>
                      <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                        <SelectTrigger id="role" className="bg-[#0a0a0a]/80 border-gray-800 text-white h-12 rounded-xl focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/50 transition-all duration-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f1419] border-gray-800 rounded-xl">
                          <SelectItem value="exporter" className="text-white hover:bg-[#10b981]/20 focus:bg-[#10b981]/20 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-[#10b981]" />
                              <span>Exporter</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="qa_agency" className="text-white hover:bg-[#10b981]/20 focus:bg-[#10b981]/20 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-[#10b981]" />
                              <span>QA Agency</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="importer" className="text-white hover:bg-[#10b981]/20 focus:bg-[#10b981]/20 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-[#10b981]" />
                              <span>Importer/Customs</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-white hover:bg-gray-100 text-black font-medium h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mt-6"
                      disabled={loading}
                    >
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>

                    <div className="text-center text-sm text-gray-500 mt-4">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setActiveTab("signin")}
                        className="text-[#10b981] hover:text-[#059669] font-medium transition-colors duration-300"
                      >
                        Sign in
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Footer Text */}
          <p className="text-center text-xs text-gray-600 mt-8">
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-gray-500 hover:text-[#10b981] transition-colors duration-300">Terms of Service</a>
            {" "}and{" "}
            <a href="/privacy" className="text-gray-500 hover:text-[#10b981] transition-colors duration-300">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
