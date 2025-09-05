import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Monitor, 
  CheckCircle,
  ArrowRight,
  Globe,
  BarChart3,
  Users,
  Truck,
  Package,
  MapPin,
  Clock,
  Shield,
  Zap,
  Database,
  Settings
} from "lucide-react";

const Desktop = () => {
  const features = [
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Comprehensive insights into delivery performance, fleet utilization, and operational metrics.",
      details: [
        "Real-time performance metrics",
        "Delivery success rates",
        "Fleet utilization reports",
        "Cost analysis and ROI tracking"
      ]
    },
    {
      icon: Users,
      title: "User Management",
      description: "Complete control over team access with role-based permissions and user verification.",
      details: [
        "Manager and trucker role management",
        "User verification workflows",
        "Company multi-tenant support",
        "Access control and permissions"
      ]
    },
    {
      icon: Truck,
      title: "Fleet Management",
      description: "Advanced fleet oversight with capacity monitoring and intelligent package assignment.",
      details: [
        "Truck capacity tracking",
        "Automatic package assignment",
        "Fleet status monitoring",
        "Route optimization tools"
      ]
    },
    {
      icon: Package,
      title: "Package Operations",
      description: "End-to-end package lifecycle management with real-time tracking and status updates.",
      details: [
        "Package creation and assignment",
        "Real-time status tracking",
        "Delivery confirmation system",
        "Undelivered package management"
      ]
    },
    {
      icon: MapPin,
      title: "Route Planning",
      description: "AI-powered route optimization with geographic clustering and multi-stop planning.",
      details: [
        "OSRM route calculation",
        "Geographic clustering",
        "Multi-stop optimization",
        "Route deviation monitoring"
      ]
    },
    {
      icon: Database,
      title: "Data Management",
      description: "Centralized data management with comprehensive reporting and historical analytics.",
      details: [
        "Delivery history tracking",
        "Performance analytics",
        "Custom reporting tools",
        "Data export capabilities"
      ]
    }
  ];

  const stats = [
    { number: "99.9%", label: "Uptime" },
    { number: "Real-time", label: "Monitoring" },
    { number: "Multi-tenant", label: "Architecture" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 relative overflow-hidden">
      <Header />

      {/* Floating Background Images - Fewer but Quality */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Strategic placement for desktop dashboard feel */}
        <div className="absolute top-24 right-16 w-20 h-20 bg-primary/8 rounded-lg animate-float" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-1/3 left-8 w-16 h-16 bg-primary/12 rounded-lg animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-2/3 right-12 w-14 h-14 bg-primary/10 rounded-lg animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-16 w-18 h-18 bg-primary/6 rounded-lg animate-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute bottom-20 right-8 w-12 h-12 bg-primary/14 rounded-lg animate-float" style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Hero Section */}
      <section className="pt-24 pb-16 relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                  <Monitor className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                  React TypeScript Interface
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
                WayPoint
                <span className="block text-primary">Web Dashboard</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                The comprehensive administrative interface for logistics managers. Built with React and TypeScript 
                for powerful fleet management, analytics, and operational control.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button variant="cta" size="lg" className="group">
                  <Globe className="h-4 w-4 mr-2" />
                  Access Dashboard
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="professional" size="lg">
                  View Demo
                </Button>
              </div>
            </div>

            {/* Dashboard Preview Placeholder */}
            <div className="relative h-96 lg:h-[500px]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Monitor className="h-32 w-32 text-primary mx-auto mb-4 animate-float" />
                  <p className="text-lg text-muted-foreground mb-2">
                    Web Dashboard Screenshots
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Replace with dashboard interface images
                  </p>
                </div>
              </div>
              
              {/* Dashboard Elements - Replace with actual images */}
              <div className="absolute top-6 right-6 w-16 h-16 bg-primary/15 rounded-lg animate-float" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-8 left-8 w-12 h-12 bg-primary/20 rounded-lg animate-float" style={{animationDelay: '2s'}}></div>
              <div className="absolute top-1/2 right-8 w-10 h-10 bg-primary/12 rounded-lg animate-float" style={{animationDelay: '0.5s'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Manager
              <span className="block text-primary">Dashboard Features</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Complete control over your logistics operations with advanced analytics, user management, 
              and real-time monitoring capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 bg-background/50 backdrop-blur-sm slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-success mr-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-24 bg-secondary/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Enterprise-Grade
              <span className="block text-primary">Technology</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built with enterprise-grade technologies for scalability, security, and performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Monitor, title: "React TypeScript", desc: "Modern web interface" },
              { icon: Shield, title: "Enterprise Security", desc: "JWT & role-based access" },
              { icon: Database, title: "PostgreSQL", desc: "Robust data management" },
              { icon: Settings, title: "Django REST", desc: "Scalable backend API" }
            ].map((tech, index) => (
              <Card key={index} className="border-0 bg-background/50 backdrop-blur-sm text-center slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <tech.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{tech.title}</h4>
                  <p className="text-sm text-muted-foreground">{tech.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Ready to Manage
            <span className="block text-primary">Your Operations?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Access the WayPoint web dashboard and take control of your logistics operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="cta" size="lg" className="group">
              <Globe className="h-4 w-4 mr-2" />
              Access Dashboard
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="professional" size="lg">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Desktop;
