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

type UserRole = "exporter" | "qa_agency" | "importer" | "admin";

const Auth = () => {
  const { signIn, signUp, user, userRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0F1C] via-[#1a1f35] to-[#0A0F1C] p-6 relative overflow-hidden">
      <FloatingParticles />

      <div className="w-full max-w-md relative z-10">
        <div ref={logoRef} className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#10b981] to-[#059669] shadow-lg shadow-[#10b981]/20 group-hover:shadow-[#10b981]/40 transition-all duration-300 group-hover:scale-110">
              <img src="/AGROTRACELOGO.png" className="rounded-2xl" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              AgroTrace
            </span>
          </Link>
          <p className="text-gray-400 text-lg">Digital certification for agricultural excellence</p>
        </div>

        <div ref={cardRef}>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#1a1f35] border border-gray-700">
              <TabsTrigger value="signin" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#10b981] data-[state=active]:to-[#059669]">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#10b981] data-[state=active]:to-[#059669]">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <Card className="bg-[#1a1f35]/80 backdrop-blur-xl border-gray-700 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
                  <CardDescription className="text-gray-400">Sign in to your account to continue</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    {error && (
                      <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-gray-300">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="name@example.com"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        required
                        className="bg-[#0A0F1C] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#10b981]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-gray-300">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        required
                        className="bg-[#0A0F1C] border-gray-700 text-white focus:border-[#10b981]"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white shadow-lg shadow-[#10b981]/20 transition-all duration-300"
                      disabled={loading}
                    >
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card className="bg-[#1a1f35]/80 backdrop-blur-xl border-gray-700 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Create Account</CardTitle>
                  <CardDescription className="text-gray-400">Get started with AgroTrace</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    {error && (
                      <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="fullname" className="text-gray-300">Full Name</Label>
                      <Input
                        id="fullname"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="bg-[#0A0F1C] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#10b981]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-gray-300">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="name@example.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        required
                        className="bg-[#0A0F1C] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#10b981]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-gray-300">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="At least 6 characters"
                        className="bg-[#0A0F1C] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#10b981]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-gray-300">Account Type</Label>
                      <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                        <SelectTrigger id="role" className="bg-[#0A0F1C] border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1f35] border-gray-700">
                          <SelectItem value="exporter" className="text-white hover:bg-[#10b981]/20">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              <span>Exporter</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="qa_agency" className="text-white hover:bg-[#10b981]/20">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              <span>QA Agency</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="importer" className="text-white hover:bg-[#10b981]/20">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              <span>Importer/Customs</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white shadow-lg shadow-[#10b981]/20 transition-all duration-300"
                      disabled={loading}
                    >
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <p className="text-center text-sm text-gray-500 mt-6">
            By continuing, you agree to our <a href="/terms" className="text-[#10b981] font-semibold"> Terms of Service</a> and <a href="/privacy" className="text-[#10b981] font-semibold">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
