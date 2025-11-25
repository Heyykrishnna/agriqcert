import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingParticles from "@/components/FloatingParticles";
import { useTranslation } from "react-i18next";
import { Shield, Database, Lock, Eye, Cookie, UserCheck, Globe, AlertTriangle } from "lucide-react";

const PrivacyPolicy = () => {
    const { t } = useTranslation();

    const sections = [
        {
            icon: Eye,
            title: "1. Information We Collect",
            content: [
                "We collect information that you provide directly to us when you create an account, use our services, or communicate with us. This includes your name, email address, company information, and role within your organization.",
                "We automatically collect certain information about your device and how you interact with our platform, including IP address, browser type, operating system, and usage patterns.",
                "When you use our blockchain certification services, we collect information about the agricultural products being certified, including product details, origin, quality assessments, and certification documents.",
                "We may collect information from third parties, such as quality assurance agencies and importers, when they interact with certificates you've created on the platform."
            ]
        },
        {
            icon: Database,
            title: "2. How We Use Your Information",
            content: [
                "We use your information to provide, maintain, and improve our blockchain-based certification services, including creating and verifying agricultural product certificates.",
                "Your data helps us personalize your experience, communicate with you about your account and our services, and provide customer support.",
                "We use aggregated and anonymized data for analytics purposes to understand how users interact with our platform and to improve our services.",
                "We may use your information to comply with legal obligations, enforce our terms of service, and protect the rights and safety of AgroTrace, our users, and the public."
            ]
        },
        {
            icon: Lock,
            title: "3. Data Storage and Security",
            content: [
                "We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction.",
                "Certification data is stored on the blockchain, which provides immutable, transparent, and secure record-keeping. Once recorded, blockchain data cannot be altered or deleted.",
                "Your personal information is stored on secure servers with encryption both in transit and at rest. We regularly update our security practices to address emerging threats.",
                "While we strive to protect your information, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security but will notify you of any data breaches as required by law."
            ]
        },
        {
            icon: Globe,
            title: "4. Information Sharing and Disclosure",
            content: [
                "We do not sell, rent, or trade your personal information to third parties for their marketing purposes.",
                "We may share your information with service providers who assist us in operating our platform, such as cloud hosting providers and analytics services. These providers are contractually obligated to protect your information.",
                "Blockchain certification data is publicly accessible by design to ensure transparency and traceability. This includes product information, certification details, and verification records.",
                "We may disclose your information if required by law, legal process, or government request, or if we believe disclosure is necessary to protect our rights, your safety, or the safety of others."
            ]
        },
        {
            icon: UserCheck,
            title: "5. Your Rights and Choices",
            content: [
                "You have the right to access, update, and correct your personal information at any time through your account settings.",
                "You may request deletion of your account and personal information, subject to our legal obligations and legitimate business interests. Note that blockchain records cannot be deleted.",
                "You can opt out of receiving promotional communications from us by following the unsubscribe instructions in those messages or updating your account preferences.",
                "Depending on your location, you may have additional rights under data protection laws, such as the right to data portability, the right to object to processing, and the right to lodge a complaint with a supervisory authority."
            ]
        },
        {
            icon: Cookie,
            title: "6. Cookies and Tracking Technologies",
            content: [
                "We use cookies and similar tracking technologies to collect information about your browsing activities and to remember your preferences.",
                "Essential cookies are necessary for the platform to function properly. These cannot be disabled without affecting the functionality of our services.",
                "Analytics cookies help us understand how users interact with our platform, allowing us to improve user experience and service quality.",
                "You can control cookie preferences through your browser settings. However, disabling certain cookies may limit your ability to use some features of our platform."
            ]
        },
        {
            icon: Shield,
            title: "7. Blockchain and Data Immutability",
            content: [
                "AgroTrace uses blockchain technology to create permanent, tamper-proof records of agricultural certifications. This ensures transparency and trust in the certification process.",
                "Once data is recorded on the blockchain, it becomes part of a permanent public ledger and cannot be modified or deleted. This is a fundamental feature of blockchain technology.",
                "While blockchain records are public, they are pseudonymous and do not directly reveal personal information unless you choose to include it in the certification data.",
                "You should carefully consider what information you include in blockchain certificates, as this information will be permanently accessible to anyone who can view the blockchain."
            ]
        },
        {
            icon: AlertTriangle,
            title: "8. Children's Privacy",
            content: [
                "AgroTrace is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children.",
                "If we become aware that we have collected personal information from a child without parental consent, we will take steps to delete that information as quickly as possible.",
                "If you believe that a child has provided us with personal information, please contact us immediately so we can take appropriate action.",
                "Parents and guardians should monitor their children's internet usage and help enforce this privacy policy by instructing children never to provide personal information through our platform without permission."
            ]
        },
        {
            icon: Database,
            title: "9. International Data Transfers",
            content: [
                "AgroTrace operates globally, and your information may be transferred to and processed in countries other than your country of residence.",
                "We ensure that international data transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.",
                "By using our services, you consent to the transfer of your information to countries that may have different data protection laws than your country of residence.",
                "We take steps to ensure that your information receives an adequate level of protection regardless of where it is processed."
            ]
        },
        {
            icon: Eye,
            title: "10. Changes to This Privacy Policy",
            content: [
                "We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.",
                "We will notify you of any material changes by posting the updated policy on our platform and updating the 'Last Updated' date at the top of this page.",
                "We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.",
                "Your continued use of the platform after changes are posted constitutes your acceptance of the updated Privacy Policy."
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
                                <Shield className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent pb-2">
                                Privacy Policy
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                                Your privacy is important to us. Learn how we collect, use, and protect your information.
                            </p>
                            <p className="text-sm text-muted-foreground mt-4">
                                Last Updated: November 25, 2025
                            </p>
                        </div>

                        {/* Privacy Sections */}
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
                            <h3 className="text-2xl font-bold mb-4 text-foreground">Questions About Your Privacy?</h3>
                            <p className="text-muted-foreground mb-6">
                                If you have any questions about this Privacy Policy or how we handle your data, please don't hesitate to contact our privacy team. We're committed to protecting your information and addressing your concerns.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <a
                                    href="mailto:privacy@agrotrace.com"
                                    className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                                >
                                    Contact Privacy Team
                                </a>
                                <a
                                    href="mailto:dpo@agrotrace.com"
                                    className="px-6 py-3 bg-card border-2 border-primary/20 text-foreground rounded-xl font-semibold hover:border-primary/40 transition-all duration-300"
                                >
                                    Data Protection Officer
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

export default PrivacyPolicy;
