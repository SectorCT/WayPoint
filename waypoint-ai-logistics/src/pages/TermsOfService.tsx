import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Shield, 
  Globe,
  Mail,
  Phone,
  MapPin,
  Info,
  ExternalLink,
  Calendar,
  Lock,
  Zap,
  Database
} from "lucide-react";

const TermsOfService = () => {
  const serviceFeatures = [
    {
      title: "Mobile Application",
      description: "Cross-platform mobile app for truckers and managers",
      icon: Globe
    },
    {
      title: "Web Dashboard",
      description: "Administrative web interface for logistics management",
      icon: Database
    },
    {
      title: "API Services",
      description: "RESTful API for system integration",
      icon: Zap
    },
    {
      title: "Real-time Tracking",
      description: "Live delivery tracking and status updates",
      icon: Shield
    }
  ];

  const accountResponsibilities = [
    {
      title: "Accurate Information",
      description: "Provide and maintain accurate account information",
      icon: CheckCircle
    },
    {
      title: "Security",
      description: "Protect account credentials and prevent unauthorized access",
      icon: Lock
    },
    {
      title: "Compliance",
      description: "Comply with all applicable laws and regulations",
      icon: Shield
    },
    {
      title: "Acceptable Use",
      description: "Use services in accordance with these Terms",
      icon: Users
    }
  ];

  const prohibitedUses = [
    "Use for any illegal or unauthorized purpose",
    "Attempt to disrupt or compromise system security",
    "Misuse or unauthorized access to data",
    "Interfere with service operation or other users"
  ];

  const serviceAvailability = [
    {
      title: "Uptime",
      description: "Target 99.9% service availability",
      icon: CheckCircle
    },
    {
      title: "Maintenance",
      description: "Scheduled maintenance with advance notice",
      icon: Calendar
    },
    {
      title: "Updates",
      description: "Regular system updates and improvements",
      icon: Zap
    },
    {
      title: "Support",
      description: "Technical assistance for service issues",
      icon: Users
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
                <FileText className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              These terms govern your use of WayPoint's intelligent logistics management system. 
              By using our services, you agree to these terms and conditions.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Last Updated: September 2025</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-success" />
                <span>Legally Binding</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Acceptance */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-primary" />
                <span>Acceptance of Terms</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using WayPoint's logistics management system, you agree to be bound by these 
                Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Service Description */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Service Description</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              WayPoint provides an intelligent logistics management system designed to optimize your delivery operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {serviceFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Accounts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">User Accounts and Responsibilities</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Your responsibilities when using WayPoint services and maintaining your account.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {accountResponsibilities.map((responsibility, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <responsibility.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{responsibility.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{responsibility.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Acceptable Use */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">✅ Permitted Uses</h3>
                <p className="text-muted-foreground">Legitimate business operations and authorized activities.</p>
              </div>
              <div className="space-y-4">
                <Card className="border-l-4 border-l-success">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span className="text-sm">Use for legitimate logistics and delivery operations</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-success">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span className="text-sm">Use by authorized employees and contractors</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-success">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span className="text-sm">Comply with all applicable laws and regulations</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">❌ Prohibited Uses</h3>
                <p className="text-muted-foreground">Activities that are not allowed under these terms.</p>
              </div>
              <div className="space-y-4">
                {prohibitedUses.map((use, index) => (
                  <Card key={index} className="border-l-4 border-l-destructive">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <span className="text-sm">{use}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Availability */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Service Availability and Support</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Our commitment to service reliability and customer support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {serviceAvailability.map((item, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="flex items-center space-x-4 p-6">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Payment and Billing */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Payment and Billing</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Service fees, billing cycles, and payment terms for WayPoint services.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Service Fees</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Pricing</Badge>
                    <span className="text-sm text-muted-foreground">Service fees as specified in current pricing plans</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Billing Cycle</Badge>
                    <span className="text-sm text-muted-foreground">Monthly or annual billing as selected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Payment Methods</Badge>
                    <span className="text-sm text-muted-foreground">Accepted payment methods and terms</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Taxes</Badge>
                    <span className="text-sm text-muted-foreground">Applicable taxes and fees</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <span>Payment Terms</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Payment due upon receipt of invoice</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Late payment fees and consequences apply</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Refund policy and terms available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Service suspension for non-payment</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Limitation of Liability */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-l-4 border-l-warning">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <span>Limitation of Liability</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Services are provided "as is" without warranties. WayPoint's liability is limited to the 
                  amount paid for services in the 12 months preceding the claim.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">User Responsibilities:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Users are responsible for data backup</li>
                    <li>• Users must comply with applicable laws</li>
                    <li>• Users indemnify WayPoint against claims</li>
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
            Questions About These Terms?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Contact our legal team for any questions about these terms of service.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center justify-center space-x-2">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-sm">legal@waypoint.com</span>
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

export default TermsOfService;
