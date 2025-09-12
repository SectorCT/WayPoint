import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Eye, 
  Lock, 
  Users, 
  Database, 
  Globe,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Download,
  Calendar
} from "lucide-react";

const PrivacyPolicy = () => {
  const dataCategories = [
    {
      title: "Personal Information",
      icon: Users,
      items: [
        "Account Information: Name, email address, phone number, company affiliation",
        "User Profile: Role (Manager/Trucker), verification status, company details",
        "Authentication Data: Login credentials, session tokens, device information"
      ]
    },
    {
      title: "Operational Data",
      icon: Database,
      items: [
        "Package Information: Delivery addresses, recipient details, package weights, delivery status",
        "Fleet Data: Truck information, license plates, capacity details, availability status",
        "Location Data: GPS coordinates, delivery routes, office locations, tracking information",
        "Performance Metrics: Delivery times, route efficiency, cost analysis"
      ]
    },
    {
      title: "Technical Information",
      icon: Globe,
      items: [
        "Device Information: Device type, operating system, browser information",
        "Usage Analytics: App usage patterns, feature utilization, performance metrics",
        "Log Data: Server logs, error reports, system performance data"
      ]
    }
  ];

  const dataUses = [
    {
      title: "Service Provision",
      description: "Account management, logistics operations, real-time services, and analytics",
      icon: CheckCircle
    },
    {
      title: "Communication",
      description: "Service updates, delivery notifications, support, and marketing communications",
      icon: Mail
    },
    {
      title: "System Improvement",
      description: "Performance optimization, feature development, and security enhancement",
      icon: Shield
    }
  ];

  const userRights = [
    {
      title: "Data Access",
      description: "Request access to your personal information",
      icon: Eye
    },
    {
      title: "Data Correction",
      description: "Update or correct inaccurate information",
      icon: CheckCircle
    },
    {
      title: "Data Deletion",
      description: "Request deletion of your personal information",
      icon: AlertTriangle
    },
    {
      title: "Data Portability",
      description: "Export your data in a portable format",
      icon: Download
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-primary rounded-lg p-3">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Your privacy is our priority. This policy explains how we collect, use, and protect your information 
              when you use WayPoint's intelligent logistics management system.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Last Updated: September 2025</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-success" />
                <span>GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-primary" />
                <span>Introduction</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                WayPoint ("we," "our," or "us") is committed to protecting your privacy and ensuring the security 
                of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard 
                your information when you use our intelligent logistics management system, including our mobile application, 
                web dashboard, and API services.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Information We Collect */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Information We Collect</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              We collect information necessary to provide our logistics management services and improve your experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {dataCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <category.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-muted-foreground flex items-start">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How We Use Your Information */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How We Use Your Information</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              We use your information to provide, improve, and secure our logistics management services.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {dataUses.map((use, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <use.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{use.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{use.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Security */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Data Security</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              We implement comprehensive security measures to protect your information.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <span>Security Measures</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Encryption</Badge>
                    <span className="text-sm text-muted-foreground">End-to-end encryption for data transmission and storage</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Access Controls</Badge>
                    <span className="text-sm text-muted-foreground">Role-based access control and authentication</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Network Security</Badge>
                    <span className="text-sm text-muted-foreground">Secure network infrastructure and firewalls</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Regular Audits</Badge>
                    <span className="text-sm text-muted-foreground">Security assessments and vulnerability testing</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>Data Retention</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Active Accounts: Data retained while account is active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Inactive Accounts: Data retained for 2 years after deactivation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Legal Requirements: Data retained as required by applicable laws</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Your Rights */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Your Rights and Choices</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              You have control over your personal information and how it's used.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {userRights.map((right, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="flex items-center space-x-4 p-6">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <right.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{right.title}</h4>
                    <p className="text-sm text-muted-foreground">{right.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Questions About Privacy?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Contact our privacy team for any questions or concerns about your data.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center justify-center space-x-2">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-sm">privacy@waypoint.com</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Phone className="h-4 w-4 text-primary" />
              <span className="text-sm">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm">San Francisco, CA</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
