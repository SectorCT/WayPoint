import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Lock, 
  Eye, 
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
  Calendar,
  Zap,
  Settings,
  BarChart3,
  Monitor
} from "lucide-react";

const Security = () => {
  const securityStandards = [
    {
      title: "ISO 27001",
      description: "Information security management system",
      icon: Shield
    },
    {
      title: "SOC 2 Type II",
      description: "Security, availability, and confidentiality controls",
      icon: Lock
    },
    {
      title: "GDPR Compliance",
      description: "European data protection standards",
      icon: Users
    },
    {
      title: "Industry Best Practices",
      description: "Following industry security guidelines",
      icon: CheckCircle
    }
  ];

  const securityPrinciples = [
    {
      title: "Defense in Depth",
      description: "Multiple layers of security controls",
      icon: Shield
    },
    {
      title: "Zero Trust",
      description: "Verify every access request",
      icon: Lock
    },
    {
      title: "Least Privilege",
      description: "Minimal access necessary for operations",
      icon: Users
    },
    {
      title: "Continuous Monitoring",
      description: "Ongoing security monitoring and assessment",
      icon: Monitor
    }
  ];

  const dataProtection = [
    {
      title: "Transit Encryption",
      description: "TLS 1.3 for data in transit",
      icon: Globe
    },
    {
      title: "Storage Encryption",
      description: "AES-256 encryption for data at rest",
      icon: Database
    },
    {
      title: "Database Encryption",
      description: "Encrypted database storage",
      icon: Database
    },
    {
      title: "Backup Encryption",
      description: "Encrypted backup storage",
      icon: Shield
    }
  ];

  const accessControls = [
    {
      title: "Multi-Factor Authentication",
      description: "Enhanced login security with MFA",
      icon: Lock
    },
    {
      title: "Role-Based Access",
      description: "RBAC for granular permissions",
      icon: Users
    },
    {
      title: "Session Management",
      description: "Secure session handling",
      icon: Shield
    },
    {
      title: "Privilege Management",
      description: "Regular privilege reviews",
      icon: Settings
    }
  ];

  const infrastructureSecurity = [
    {
      title: "Network Security",
      description: "Multi-layer firewall protection",
      icon: Globe
    },
    {
      title: "DDoS Protection",
      description: "Distributed denial-of-service protection",
      icon: Shield
    },
    {
      title: "Intrusion Detection",
      description: "Real-time threat detection",
      icon: AlertTriangle
    },
    {
      title: "Network Segmentation",
      description: "Isolated network segments",
      icon: Database
    }
  ];

  const complianceCertifications = [
    {
      title: "GDPR",
      description: "European data protection compliance",
      icon: Users
    },
    {
      title: "CCPA",
      description: "California privacy compliance",
      icon: Shield
    },
    {
      title: "SOC 2",
      description: "Security and availability controls",
      icon: CheckCircle
    },
    {
      title: "ISO 27001",
      description: "Information security management",
      icon: Lock
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
              Security Policy
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              WayPoint is committed to maintaining the highest standards of security for our logistics 
              management platform. We implement comprehensive security measures to protect your data.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Last Updated: September 2025</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-success" />
                <span>Enterprise-Grade Security</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Commitment */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-primary" />
                <span>Security Commitment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                We implement comprehensive security measures to protect user data, system integrity, and service availability. 
                Our security framework follows industry best practices and maintains multiple layers of protection.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Security Standards */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Security Standards</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              We adhere to industry-leading security standards and certifications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {securityStandards.map((standard, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <standard.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{standard.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{standard.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Principles */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Security Principles</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Our security approach is built on proven principles that ensure comprehensive protection.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {securityPrinciples.map((principle, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <principle.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{principle.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{principle.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Protection */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Data Protection</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Comprehensive encryption and protection measures for your data at every stage.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {dataProtection.map((protection, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="flex items-center space-x-4 p-6">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <protection.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{protection.title}</h4>
                    <p className="text-sm text-muted-foreground">{protection.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Access Controls */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Access Controls</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Robust authentication and authorization systems to protect your account and data.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {accessControls.map((control, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <control.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{control.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{control.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure Security */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Infrastructure Security</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Enterprise-grade infrastructure with multiple layers of security protection.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {infrastructureSecurity.map((security, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="flex items-center space-x-4 p-6">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <security.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{security.title}</h4>
                    <p className="text-sm text-muted-foreground">{security.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance & Certifications */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Compliance & Certifications</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              We maintain compliance with major security and privacy regulations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {complianceCertifications.map((cert, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <cert.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{cert.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{cert.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Best Practices */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Security Best Practices for Users</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Account Security</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Use strong, unique passwords</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Enable multi-factor authentication</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Keep devices and software updated</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Use secure networks for access</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Data Protection</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Properly classify sensitive data</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Limit access to sensitive information</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Regular data backup procedures</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Secure data disposal methods</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Security Questions or Issues?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Contact our security team for any security-related questions or to report security issues.
          </p>
                     <div className="grid md:grid-cols-2 gap-6">
             <div className="flex flex-col items-center space-y-2">
               <Mail className="h-4 w-4 text-primary" />
               <span className="text-sm">security@waypoint.com</span>
             </div>
             <div className="flex flex-col items-center space-y-2">
               <Phone className="h-4 w-4 text-primary" />
               <span className="text-sm">Security Hotline</span>
             </div>
           </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Security;
