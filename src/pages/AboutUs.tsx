import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingParticles from "@/components/FloatingParticles";
import { useTranslation } from "react-i18next";
import {
    Target,
    Eye,
    Heart,
    Zap,
    Shield,
    Globe,
    Users,
    TrendingUp,
    Award,
    Leaf,
    Lock,
    BarChart
} from "lucide-react";

const AboutUs = () => {
    const { t } = useTranslation();

    const values = [
        {
            icon: Shield,
            title: "Trust & Transparency",
            description: "We leverage blockchain technology to create immutable, transparent records that build trust across the agricultural supply chain."
        },
        {
            icon: Zap,
            title: "Innovation",
            description: "We continuously innovate to bring cutting-edge technology solutions to the agricultural certification industry."
        },
        {
            icon: Heart,
            title: "Integrity",
            description: "We maintain the highest standards of integrity in all our operations, ensuring accurate and reliable certification processes."
        },
        {
            icon: Globe,
            title: "Global Impact",
            description: "We're committed to making a positive impact on global food security and sustainable agriculture practices."
        }
    ];

    const stats = [
        { number: "10,000+", label: "Certificates Issued" },
        { number: "500+", label: "Active Users" },
        { number: "50+", label: "Countries Served" },
        { number: "99.9%", label: "Platform Uptime" }
    ];

    const features = [
        {
            icon: Lock,
            title: "Blockchain Security",
            description: "Immutable records secured by blockchain technology ensure data integrity and prevent fraud."
        },
        {
            icon: BarChart,
            title: "Real-time Tracking",
            description: "Track agricultural products from farm to table with complete transparency and traceability."
        },
        {
            icon: Award,
            title: "Quality Assurance",
            description: "Comprehensive quality verification processes ensure only certified products receive our seal of approval."
        },
        {
            icon: Leaf,
            title: "Sustainability Focus",
            description: "Promoting sustainable agricultural practices and environmental responsibility across the supply chain."
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
                                <img src="/AGROTRACELOGO.png" className="rounded-2xl" />
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent pb-2">
                                About AgroTrace
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                                Revolutionizing agricultural certification through blockchain technology,
                                ensuring transparency, trust, and traceability in the global food supply chain.
                            </p>
                        </div>

                        {/* Stats Section */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105"
                                >
                                    <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                                        {stat.number}
                                    </div>
                                    <div className="text-sm text-muted-foreground font-medium">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Mission Section */}
                        <div className="mb-16 bg-card border-2 border-primary/20 rounded-2xl p-10 shadow-lg">
                            <div className="flex items-start gap-6 mb-6">
                                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                                    <Target className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold mb-4 text-foreground">Our Mission</h2>
                                    <p className="text-lg text-muted-foreground leading-relaxed">
                                        At AgroTrace, our mission is to transform the agricultural certification landscape by providing
                                        a secure, transparent, and efficient blockchain-based platform. We empower exporters, importers,
                                        and quality assurance agencies to create, verify, and track agricultural certifications with
                                        unprecedented accuracy and trust. By leveraging cutting-edge blockchain technology, we're building
                                        a future where every agricultural product can be traced back to its origin, ensuring food safety,
                                        quality, and sustainability for consumers worldwide.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Vision Section */}
                        <div className="mb-16 bg-card border-2 border-primary/20 rounded-2xl p-10 shadow-lg">
                            <div className="flex items-start gap-6 mb-6">
                                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-lg">
                                    <Eye className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold mb-4 text-foreground">Our Vision</h2>
                                    <p className="text-lg text-muted-foreground leading-relaxed">
                                        We envision a world where agricultural supply chains are completely transparent, where consumers
                                        can trust the origin and quality of their food, and where farmers and exporters are fairly
                                        recognized for their sustainable practices. Through blockchain technology, we're creating an
                                        ecosystem that eliminates fraud, reduces inefficiencies, and promotes accountability at every
                                        step of the agricultural value chain. Our vision extends beyond certification – we're building
                                        the foundation for a more sustainable, equitable, and trustworthy global food system.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Values Section */}
                        <div className="mb-16">
                            <h2 className="text-3xl font-bold mb-10 text-center text-foreground">Our Core Values</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                {values.map((value, index) => {
                                    const Icon = value.icon;
                                    return (
                                        <div
                                            key={index}
                                            className="bg-card border-2 border-primary/20 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/40 hover:scale-105"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                                    <Icon className="w-6 h-6 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold mb-3 text-foreground">{value.title}</h3>
                                                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Technology Section */}
                        <div className="mb-16">
                            <h2 className="text-3xl font-bold mb-10 text-center text-foreground">Our Technology</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                {features.map((feature, index) => {
                                    const Icon = feature.icon;
                                    return (
                                        <div
                                            key={index}
                                            className="bg-gradient-to-br from-card to-card/50 border-2 border-primary/20 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/40"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                                                    <Icon className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                                                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Impact Section */}
                        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-2xl p-10 shadow-lg">
                            <div className="flex items-start gap-6">
                                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                                    <TrendingUp className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold mb-4 text-foreground">Our Impact</h2>
                                    <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                                        Since our inception, AgroTrace has been making a significant impact on the agricultural
                                        certification industry. We've helped thousands of exporters streamline their certification
                                        processes, enabled importers to verify product authenticity with confidence, and provided
                                        quality assurance agencies with powerful tools to maintain certification standards.
                                    </p>
                                    <p className="text-lg text-muted-foreground leading-relaxed">
                                        Our blockchain-based platform has reduced certification fraud, increased supply chain
                                        transparency, and promoted sustainable agricultural practices across multiple continents.
                                        By connecting stakeholders in the agricultural value chain, we're building trust, reducing
                                        costs, and contributing to a more sustainable future for global agriculture.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="mt-16 text-center">
                            <h3 className="text-2xl font-bold mb-6 text-foreground">Join Us in Transforming Agriculture</h3>
                            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                                Whether you're an exporter, importer, or quality assurance agency, AgroTrace provides the
                                tools you need to succeed in today's transparent, trust-driven marketplace.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <a
                                    href="/auth"
                                    className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                                >
                                    Get Started Today
                                </a>
                                <a
                                    href="mailto:contact@agrotrace.com"
                                    className="px-8 py-4 bg-card border-2 border-primary/20 text-foreground rounded-xl font-semibold hover:border-primary/40 transition-all duration-300"
                                >
                                    Contact Us
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

export default AboutUs;
