import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Code, 
  Shield, 
  Zap, 
  Globe, 
  Database, 
  Truck, 
  MapPin, 
  BarChart3, 
  Clock, 
  Users,
  Lock,
  CheckCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Copy,
  Download,
  Upload as UploadIcon
} from "lucide-react";

const ApiDocumentation = () => {
  const apiModules = [
    {
      title: "Authentication API",
      description: "User management and authentication services",
      icon: Shield,
      features: [
        "User registration and login",
        "Password reset and recovery",
        "Role-based access control",
        "Company management and verification",
        "User profile management"
      ],
      security: "JWT tokens with configurable expiration, secure password hashing"
    },
    {
      title: "Package Management API",
      description: "Complete package lifecycle management",
      icon: Truck,
      features: [
        "Package creation and assignment",
        "Status tracking (pending → in_transit → delivered)",
        "Weight-based capacity management",
        "Delivery scheduling and rescheduling",
        "Digital signature capture integration",
        "Recipient information management"
      ],
      security: "Automatic status updates, delivery confirmation workflows"
    },
    {
      title: "Fleet Management API",
      description: "Truck fleet operations and capacity management",
      icon: Truck,
      features: [
        "Truck registration and management",
        "Capacity tracking (kilogram-based)",
        "Availability status monitoring",
        "License plate identification",
        "Automatic package-to-truck assignment",
        "Real-time fleet status updates"
      ],
      security: "Intelligent capacity utilization and load balancing"
    },
    {
      title: "Routing & Optimization API",
      description: "Advanced route planning and optimization",
      icon: MapPin,
      features: [
        "OSRM integration for optimal routing",
        "Geographic clustering algorithms",
        "Multi-stop route optimization",
        "Real-time route deviation detection",
        "Fuel cost minimization",
        "Delivery time optimization"
      ],
      security: "AI-powered route sequencing, geographic clustering, distance matrix calculations"
    },
    {
      title: "Office Management API",
      description: "Office network and location management",
      icon: MapPin,
      features: [
        "Office registration with geolocation",
        "Map-based location selection",
        "Undelivered package storage",
        "Office-based delivery fallback",
        "Geographic zone management",
        "Delivery area optimization"
      ],
      security: "Seamless map integration with coordinate precision"
    },
    {
      title: "Real-time Tracking API",
      description: "Live delivery tracking and status updates",
      icon: Clock,
      features: [
        "Real-time location tracking",
        "Journey status monitoring",
        "Delivery progress updates",
        "Performance analytics",
        "Historical data access",
        "Live notifications"
      ],
      security: "WebSocket support for real-time updates, efficient data streaming"
    },
    {
      title: "Analytics & Reporting API",
      description: "Performance metrics and business intelligence",
      icon: BarChart3,
      features: [
        "Delivery performance metrics",
        "Route efficiency analysis",
        "Fleet utilization statistics",
        "Cost analysis and reporting",
        "Historical trend analysis",
        "Custom report generation"
      ],
      security: "Data-driven optimization recommendations, performance benchmarking"
    }
  ];

  const performanceFeatures = [
    { title: "High Availability", description: "99.9% uptime guarantee", icon: CheckCircle },
    { title: "Scalability", description: "Horizontal scaling support", icon: Zap },
    { title: "Caching", description: "Intelligent response caching", icon: Database },
    { title: "Pagination", description: "Efficient large dataset handling", icon: BarChart3 },
    { title: "Compression", description: "Response compression for faster transfers", icon: Download }
  ];

  const integrationFeatures = [
    { title: "Webhook Support", description: "Real-time event notifications", icon: Zap },
    { title: "Batch Operations", description: "Bulk data processing", icon: Database },
    { title: "File Upload", description: "Secure file handling for signatures and documents", icon: UploadIcon },
    { title: "Export Functions", description: "Data export in multiple formats", icon: Download },
    { title: "Third-party Integration", description: "Easy integration with external systems", icon: ExternalLink }
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
                <Code className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              WayPoint API Documentation
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Comprehensive RESTful service that powers our intelligent logistics management system. 
              Built with Django REST Framework, providing secure, scalable endpoints for managing packages, 
              fleet operations, routing optimization, and real-time tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="group">
                <ExternalLink className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                Get API Access
              </Button>
              <Button variant="outline" size="lg">
                <Download className="h-4 w-4 mr-2" />
                Download SDK
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">🏗️ Architecture</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Built with modern technologies and best practices for scalability, security, and performance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-lg">Framework</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Django 4.x with Django REST Framework</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-lg">Database</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">PostgreSQL with optimized queries</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-lg">Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">JWT-based token authentication</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-lg">Deployment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Docker containerization with production-ready configuration</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* API Modules */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">📦 Core API Modules</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Comprehensive API modules designed to handle every aspect of modern logistics operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {apiModules.map((module, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 rounded-lg p-3">
                      <module.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{module.title}</CardTitle>
                      <CardDescription className="text-base">{module.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Key Features:</h4>
                      <ul className="space-y-1">
                        {module.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start space-x-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Business Logic:</h4>
                      <p className="text-sm text-muted-foreground">{module.security}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Performance & Integration Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Performance Features */}
            <div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">🚀 Performance Features</h3>
                <p className="text-muted-foreground">Optimized for speed, reliability, and scalability.</p>
              </div>
              <div className="space-y-4">
                {performanceFeatures.map((feature, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardContent className="flex items-center space-x-4 p-4">
                      <div className="bg-primary/10 rounded-lg p-2">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Integration Features */}
            <div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">🔗 Integration Features</h3>
                <p className="text-muted-foreground">Seamless integration with your existing systems.</p>
              </div>
              <div className="space-y-4">
                {integrationFeatures.map((feature, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardContent className="flex items-center space-x-4 p-4">
                      <div className="bg-primary/10 rounded-lg p-2">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Response Format */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">📊 Response Formats</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Consistent and predictable response formats for easy integration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Standard Response Structure</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm overflow-x-auto">
{`{
  "status": "success|error",
  "data": {},
  "message": "Human-readable message",
  "timestamp": "ISO 8601 timestamp",
  "request_id": "Unique request identifier"
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <span>Error Handling</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">HTTP Status Codes</Badge>
                    <span className="text-sm text-muted-foreground">Standard REST status codes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Error Details</Badge>
                    <span className="text-sm text-muted-foreground">Detailed error messages and codes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Validation Errors</Badge>
                    <span className="text-sm text-muted-foreground">Field-specific validation feedback</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Rate Limit Info</Badge>
                    <span className="text-sm text-muted-foreground">Clear rate limiting notifications</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">🛡️ Security & Compliance</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Enterprise-grade security with comprehensive compliance standards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Data Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <span className="text-sm">End-to-end data encryption</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm">Data anonymization for privacy-preserving analytics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm">Granular permission management</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span className="text-sm">Complete activity logging</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Compliance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-success/10 text-success">GDPR</Badge>
                    <span className="text-sm text-muted-foreground">European data protection standards</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Data Retention</Badge>
                    <span className="text-sm text-muted-foreground">Configurable data retention policies</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Right to Deletion</Badge>
                    <span className="text-sm text-muted-foreground">User data deletion capabilities</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Data Portability</Badge>
                    <span className="text-sm text-muted-foreground">Export user data functionality</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Contact our API team to request access and begin building with the WayPoint API today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg">
              <ExternalLink className="h-4 w-4 mr-2" />
              Request API Access
            </Button>
            <Button variant="outline" size="lg">
              <Users className="h-4 w-4 mr-2" />
              Contact Sales Team
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ApiDocumentation;
