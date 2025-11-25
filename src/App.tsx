import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ExporterDashboard from "./pages/ExporterDashboard";
import QADashboard from "./pages/QADashboard";
import ImporterDashboard from "./pages/ImporterDashboard";
import VerifyPortal from "./pages/VerifyPortal";
import PublicVerify from "./pages/PublicVerify";
import BatchVerify from "./pages/BatchVerify";
import AdminDashboard from "./pages/AdminDashboard";
import BatchDetail from "./pages/BatchDetail";
import Profile from "./pages/Profile";
import PublicBatchTracker from "./pages/PublicBatchTracker";
import MobileScanner from "./pages/MobileScanner";
import InstallPWA from "./pages/InstallPWA";
import NotFound from "./pages/NotFound";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AboutUs from "./pages/AboutUs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/track/:token" element={<PublicBatchTracker />} />
            <Route path="/public-verify" element={<PublicVerify />} />
            <Route path="/batch-verify" element={<BatchVerify />} />
            <Route path="/scanner" element={<MobileScanner />} />
            <Route path="/install" element={<InstallPWA />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/about" element={<AboutUs />} />
            <Route
              path="/exporter"
              element={
                <ProtectedRoute allowedRoles={["exporter"]}>
                  <ExporterDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/qa"
              element={
                <ProtectedRoute allowedRoles={["qa_agency"]}>
                  <QADashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/importer"
              element={
                <ProtectedRoute allowedRoles={["importer"]}>
                  <ImporterDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/verify"
              element={
                <ProtectedRoute allowedRoles={["importer"]}>
                  <VerifyPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/batch/:id"
              element={
                <ProtectedRoute allowedRoles={["exporter", "qa_agency", "admin"]}>
                  <BatchDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["exporter", "qa_agency", "importer", "admin"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
