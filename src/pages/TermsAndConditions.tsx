import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingParticles from "@/components/FloatingParticles";
import { useTranslation } from "react-i18next";
import { Shield, FileText, Users, Lock, AlertCircle, Scale } from "lucide-react";

const TermsAndConditions = () => {
  const { t } = useTranslation();

  const sections = [
    {
      icon: FileText,
      title: "1. Introduction",
      content: [
        "Welcome to AgroTrace, a blockchain-based agricultural certification and traceability platform. By accessing or using our services, you agree to be bound by these Terms and Conditions.",
        "These terms govern your use of the AgroTrace platform, including all features, services, and functionalities provided through our website and mobile applications.",
        "If you do not agree with any part of these terms, you must not use our platform."
      ]
    },
    {
      icon: Users,
      title: "2. User Accounts and Registration",
      content: [
        "To access certain features of AgroTrace, you must create an account. You agree to provide accurate, current, and complete information during registration.",
        "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
        "User roles include Exporters, Quality Assurance Agencies, Importers, and Administrators. Each role has specific permissions and responsibilities within the platform.",
        "You must notify us immediately of any unauthorized use of your account or any other breach of security."
      ]
    },
    {
      icon: Shield,
      title: "3. Platform Usage",
      content: [
        "AgroTrace provides blockchain-based certification services for agricultural products. You may use the platform to create, verify, and track agricultural certifications.",
        "You agree not to use the platform for any unlawful purpose or in any way that could damage, disable, or impair the platform.",
        "You must not attempt to gain unauthorized access to any part of the platform, other user accounts, or computer systems connected to the platform.",
        "All data submitted to the platform must be accurate and truthful. False or misleading information may result in account suspension or termination."
      ]
    },
    {
      icon: Lock,
      title: "4. Blockchain Certificates and Data",
      content: [
        "Certificates issued through AgroTrace are recorded on the blockchain and are immutable once created. You acknowledge that blockchain records cannot be altered or deleted.",
        "You retain ownership of the data you submit to the platform, but grant AgroTrace a license to use, store, and display this data as necessary to provide our services.",
        "AgroTrace uses blockchain technology to ensure transparency and traceability. All certificate data is cryptographically secured and publicly verifiable.",
        "You are responsible for ensuring that you have the right to submit any data or information to the platform."
      ]
    },
    {
      icon: AlertCircle,
      title: "5. Liability and Warranties",
      content: [
        "AgroTrace is provided 'as is' without warranties of any kind, either express or implied. We do not guarantee that the platform will be error-free or uninterrupted.",
        "We are not liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.",
        "While we strive to maintain the accuracy and integrity of blockchain records, we are not responsible for errors in data submitted by users.",
        "Our total liability to you for any claims arising from your use of the platform shall not exceed the amount you have paid to us in the past 12 months."
      ]
    },
    {
      icon: Scale,
      title: "6. Intellectual Property",
      content: [
        "All content, features, and functionality of the AgroTrace platform are owned by AgroTrace and are protected by international copyright, trademark, and other intellectual property laws.",
        "You may not reproduce, distribute, modify, or create derivative works of any part of the platform without our express written permission.",
        "The AgroTrace name, logo, and all related marks are trademarks of AgroTrace. You may not use these marks without our prior written consent.",
        "User-generated content remains the property of the respective users, subject to the license granted to AgroTrace as described in these terms."
      ]
    },
    {
      icon: FileText,
      title: "7. Termination",
      content: [
        "We reserve the right to suspend or terminate your account at any time, with or without notice, for any violation of these terms or for any other reason we deem appropriate.",
        "You may terminate your account at any time by contacting our support team. Upon termination, your right to use the platform will immediately cease.",
        "Blockchain records created during your use of the platform will remain on the blockchain and cannot be deleted, even after account termination.",
        "Provisions of these terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability."
      ]
    },
    {
      icon: AlertCircle,
      title: "8. Changes to Terms",
      content: [
        "We reserve the right to modify these Terms and Conditions at any time. We will notify users of any material changes via email or through the platform.",
        "Your continued use of the platform after changes are posted constitutes your acceptance of the modified terms.",
        "We encourage you to review these terms periodically to stay informed of any updates.",
        "If you do not agree with the modified terms, you must stop using the platform and may terminate your account."
      ]
    },
    {
      icon: Scale,
      title: "9. Governing Law",
      content: [
        "These Terms and Conditions are governed by and construed in accordance with the laws of the jurisdiction in which AgroTrace operates.",
        "Any disputes arising from these terms or your use of the platform shall be resolved through binding arbitration in accordance with applicable arbitration rules.",
        "You agree to waive any right to a jury trial or to participate in a class action lawsuit.",
        "If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full force and effect."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles />
      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg mb-6">
                <Scale className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Terms and Conditions
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Please read these terms carefully before using the AgroTrace platform
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Last Updated: November, 2025
              </p>
            </div>

            {/* Terms Sections */}
            <div className="space-y-8">
              {sections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <div
                    key={index}
                    className="bg-card border-2 border-primary/20 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/40"
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground flex-1">
                        {section.title}
                      </h2>
                    </div>
                    <div className="space-y-4 ml-16">
                      {section.content.map((paragraph, pIndex) => (
                        <p key={pIndex} className="text-muted-foreground leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Contact Section */}
            <div className="mt-16 p-8 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border-2 border-primary/20">
              <h3 className="text-2xl font-bold mb-4 text-foreground">Questions About Our Terms?</h3>
              <p className="text-muted-foreground mb-6">
                If you have any questions about these Terms and Conditions, please contact our support team. We're here to help clarify any concerns you may have.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="mailto:legal@agrotrace.com"
                  className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Contact Legal Team
                </a>
                <a
                  href="mailto:support@agrotrace.com"
                  className="px-6 py-3 bg-card border-2 border-primary/20 text-foreground rounded-xl font-semibold hover:border-primary/40 transition-all duration-300"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default TermsAndConditions;
