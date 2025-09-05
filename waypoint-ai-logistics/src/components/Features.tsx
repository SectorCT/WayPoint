import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Truck, 
  Package, 
  Route, 
  BarChart3, 
  MapPin, 
  Clock,
  Shield,
  Smartphone,
  Zap
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Truck,
      title: "Smart Fleet Management",
      description: "Automatic truck assignment based on capacity and location with real-time status monitoring.",
      highlights: ["License plate identification", "Weight-based capacity", "Color-coded modules"]
    },
    {
      icon: Package,
      title: "Intelligent Package Management",
      description: "Complete package lifecycle management with digital signatures and delivery confirmation.",
      highlights: ["Digital signatures", "Email notifications", "Delivery scheduling"]
    },
    {
      icon: Route,
      title: "Advanced Routing & Optimization",
      description: "OSRM integration for optimal route calculation with AI-powered planning.",
      highlights: ["Geographic clustering", "Multi-stop optimization", "Route deviation detection"]
    },
    {
      icon: BarChart3,
      title: "Real-time Operations",
      description: "Live journey tracking with comprehensive analytics and performance insights.",
      highlights: ["Live tracking", "Performance analytics", "Delivery history"]
    },
    {
      icon: MapPin,
      title: "Office & Location Management",
      description: "Office network management with precise geolocation and map-based tools.",
      highlights: ["Location picker", "Geographic clustering", "Undelivered storage"]
    },
    {
      icon: Zap,
      title: "Automated Workflows",
      description: "Streamline operations with intelligent automation and workflow optimization.",
      highlights: ["Session management", "Auto-timeout", "Smart notifications"]
    }
  ];

  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Powerful Features for
            <span className="block text-primary">Modern Logistics</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to revolutionize your delivery operations with intelligent automation
            and real-time insights.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="feature-card border-0 bg-background h-full">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Technology Showcase */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-8">Built with Modern Technology</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-3">
                <Smartphone className="h-8 w-8 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">React Native</span>
              <span className="text-xs text-muted-foreground">Cross-platform</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-3">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">Django</span>
              <span className="text-xs text-muted-foreground">Secure Backend</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-3">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">OSRM</span>
              <span className="text-xs text-muted-foreground">Route Engine</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-3">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">Real-time</span>
              <span className="text-xs text-muted-foreground">WebSocket</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;