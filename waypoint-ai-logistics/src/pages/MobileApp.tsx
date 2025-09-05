import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Smartphone, 
  CheckCircle,
  ArrowRight,
  Download,
  MapPin,
  Package,
  Truck,
  Clock,
  Shield,
  Zap,
  Users,
  BarChart3,
  Navigation
} from "lucide-react";

const MobileApp = () => {
  const features = [
    {
      icon: Package,
      title: "Package Management",
      description: "Create, track, and manage packages with real-time status updates and delivery confirmations.",
      details: [
        "Package creation and assignment",
        "Real-time status tracking",
        "Digital signature capture",
        "Delivery confirmation system"
      ]
    },
    {
      icon: Truck,
      title: "Fleet Management",
      description: "Monitor truck capacity, assign packages, and track vehicle status with intelligent automation.",
      details: [
        "Truck capacity monitoring",
        "Automatic package assignment",
        "License plate identification",
        "Real-time availability tracking"
      ]
    },
    {
      icon: Navigation,
      title: "Route Optimization",
      description: "AI-powered routing with OSRM integration for optimal delivery paths and fuel efficiency.",
      details: [
        "OSRM route calculation",
        "Geographic clustering",
        "Multi-stop optimization",
        "Route deviation detection"
      ]
    },
    {
      icon: MapPin,
      title: "Location Services",
      description: "Precise geolocation tracking with map-based tools and office network management.",
      details: [
        "GPS tracking integration",
        "Map-based location picker",
        "Office network management",
        "Geographic clustering zones"
      ]
    },
    {
      icon: Clock,
      title: "Real-time Operations",
      description: "Live journey tracking with comprehensive analytics and performance insights.",
      details: [
        "Live journey tracking",
        "Status synchronization",
        "Performance analytics",
        "Delivery history"
      ]
    },
    {
      icon: Users,
      title: "Role-based Access",
      description: "Dual interface for both truckers and managers with role-specific functionality.",
      details: [
        "Manager dashboard access",
        "Trucker delivery interface",
        "User verification system",
        "Company management"
      ]
    }
  ];

  const stats = [
    { number: "40%", label: "Faster Delivery" },
    { number: "25%", label: "Cost Reduction" },
    { number: "99%", label: "Success Rate" },
    { number: "24/7", label: "Real-time Tracking" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 relative overflow-hidden">
      <Header />

      {/* Floating Background Images */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Top Left */}
        <div className="absolute top-20 left-8 w-16 h-16 bg-primary/10 rounded-lg animate-float" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-40 left-20 w-12 h-12 bg-primary/15 rounded-lg animate-float" style={{animationDelay: '1s'}}></div>
        
        {/* Top Right */}
        <div className="absolute top-32 right-12 w-20 h-20 bg-primary/8 rounded-lg animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-60 right-8 w-14 h-14 bg-primary/12 rounded-lg animate-float" style={{animationDelay: '0.5s'}}></div>
        
        {/* Middle Left */}
        <div className="absolute top-1/2 left-4 w-18 h-18 bg-primary/6 rounded-lg animate-float" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 left-24 w-10 h-10 bg-primary/20 rounded-lg animate-float" style={{animationDelay: '3s'}}></div>
        
        {/* Middle Right */}
        <div className="absolute top-1/2 right-16 w-16 h-16 bg-primary/10 rounded-lg animate-float" style={{animationDelay: '2.5s'}}></div>
        <div className="absolute top-1/2 right-4 w-12 h-12 bg-primary/14 rounded-lg animate-float" style={{animationDelay: '0.8s'}}></div>
        
        {/* Bottom Left */}
        <div className="absolute bottom-32 left-12 w-14 h-14 bg-primary/12 rounded-lg animate-float" style={{animationDelay: '1.8s'}}></div>
        <div className="absolute bottom-20 left-28 w-8 h-8 bg-primary/18 rounded-lg animate-float" style={{animationDelay: '2.8s'}}></div>
        
        {/* Bottom Right */}
        <div className="absolute bottom-40 right-20 w-16 h-16 bg-primary/8 rounded-lg animate-float" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute bottom-16 right-8 w-12 h-12 bg-primary/16 rounded-lg animate-float" style={{animationDelay: '1.2s'}}></div>
      </div>

      {/* Hero Section */}
      <section className="pt-24 pb-16 relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                  React Native Cross-Platform
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
                WayPoint
                <span className="block text-primary">Mobile App</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                The ultimate mobile solution for logistics management. Built with React Native for seamless 
                cross-platform performance, serving both truckers and managers with role-based interfaces.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button variant="cta" size="lg" className="group">
                  <Download className="h-4 w-4 mr-2" />
                  Download App
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="professional" size="lg">
                  View Demo
                </Button>
              </div>
            </div>

            {/* Floating Images Placeholder */}
            <div className="relative h-96 lg:h-[500px]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Smartphone className="h-32 w-32 text-primary mx-auto mb-4 animate-float" />
                  <p className="text-lg text-muted-foreground mb-2">
                    Mobile App Screenshots
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Replace with floating mobile app images
                  </p>
                </div>
              </div>
              
              {/* Floating Elements - Replace with actual images */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-primary/20 rounded-lg animate-float" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-8 left-8 w-16 h-16 bg-primary/15 rounded-lg animate-float" style={{animationDelay: '2s'}}></div>
              <div className="absolute top-1/2 right-8 w-12 h-12 bg-primary/25 rounded-lg animate-float" style={{animationDelay: '0.5s'}}></div>
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
              Powerful Mobile
              <span className="block text-primary">Features</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to manage logistics operations on the go, with intelligent automation 
              and real-time insights at your fingertips.
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
              Built with
              <span className="block text-primary">Modern Technology</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Leveraging the latest mobile technologies for optimal performance, security, and user experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Smartphone, title: "React Native", desc: "Cross-platform development" },
              { icon: Shield, title: "JWT Security", desc: "Secure authentication" },
              { icon: Zap, title: "Real-time Sync", desc: "Instant updates" },
              { icon: BarChart3, title: "Analytics", desc: "Performance insights" }
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
            Ready to Transform
            <span className="block text-primary">Your Logistics?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Download the WayPoint mobile app and experience the future of logistics management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="cta" size="lg" className="group">
              <Download className="h-4 w-4 mr-2" />
              Download Now
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

export default MobileApp;
