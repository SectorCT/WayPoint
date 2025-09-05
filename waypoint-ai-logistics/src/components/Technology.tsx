import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Smartphone, 
  Globe, 
  Database, 
  Route, 
  Shield, 
  Zap,
  MapPin,
  Clock,
  Server,
  Code,
  Layers,
  Cpu
} from "lucide-react";

const Technology = () => {
  const techStack = [
    {
      category: "Frontend Applications",
      icon: Smartphone,
      technologies: [
        {
          name: "React Native",
          description: "Cross-platform mobile app for truckers and managers",
          features: ["Expo SDK 53", "TypeScript", "Real-time tracking"]
        },
        {
          name: "React Web Dashboard",
          description: "Administrative interface for logistics managers",
          features: ["TypeScript", "Tailwind CSS", "Responsive design"]
        }
      ]
    },
    {
      category: "Backend Infrastructure",
      icon: Server,
      technologies: [
        {
          name: "Django REST API",
          description: "Python-based backend with PostgreSQL database",
          features: ["JWT Authentication", "RESTful APIs", "Multi-tenant support"]
        },
        {
          name: "PostgreSQL",
          description: "Robust database for logistics data management",
          features: ["ACID compliance", "Scalable", "Real-time queries"]
        }
      ]
    },
    {
      category: "AI & Optimization",
      icon: Cpu,
      technologies: [
        {
          name: "OSRM Integration",
          description: "Open-source routing machine for optimal route calculation",
          features: ["Geographic clustering", "Multi-stop optimization", "Route deviation detection"]
        },
        {
          name: "Intelligent Automation",
          description: "AI-powered package assignment and workflow optimization",
          features: ["Capacity management", "Smart notifications", "Performance analytics"]
        }
      ]
    },
    {
      category: "Real-time Systems",
      icon: Zap,
      technologies: [
        {
          name: "WebSocket Connections",
          description: "Live tracking and real-time status updates",
          features: ["Live journey tracking", "Instant notifications", "Status synchronization"]
        },
        {
          name: "Location Services",
          description: "Precise geolocation and mapping capabilities",
          features: ["GPS tracking", "Map-based tools", "Geographic clustering"]
        }
      ]
    }
  ];

  const keyFeatures = [
    {
      icon: Shield,
      title: "Secure Authentication",
      description: "JWT-based auth with role-based access control (Manager/Trucker)"
    },
    {
      icon: Database,
      title: "Data Management",
      description: "Complete package lifecycle with digital signatures and delivery confirmation"
    },
    {
      icon: Route,
      title: "Route Optimization",
      description: "AI-powered route planning minimizing fuel costs and delivery time"
    },
    {
      icon: Clock,
      title: "Real-time Operations",
      description: "Live journey tracking with comprehensive analytics and performance insights"
    }
  ];

  return (
    <section id="technology" className="py-24 bg-gradient-to-br from-secondary/20 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Built with
            <span className="block text-primary">Cutting-Edge Technology</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive tech stack powers intelligent logistics operations with real-time tracking, 
            AI optimization, and seamless user experiences across all platforms.
          </p>
        </div>

        {/* Technology Stack Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {techStack.map((category, index) => (
            <Card key={index} className="border-0 bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-foreground">{category.category}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {category.technologies.map((tech, techIndex) => (
                  <div key={techIndex} className="border-l-2 border-primary/20 pl-4">
                    <h4 className="font-semibold text-foreground mb-2">{tech.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{tech.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {tech.features.map((feature, featureIndex) => (
                        <span 
                          key={featureIndex}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Features */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-foreground mb-8">Core System Capabilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyFeatures.map((feature, index) => (
              <Card key={index} className="border-0 bg-background/30 backdrop-blur-sm text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technology Highlights */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-6">Why Our Technology Matters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Layers className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Scalable Architecture</h4>
              <p className="text-sm text-muted-foreground">
                Multi-tenant system supporting unlimited companies and packages
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Code className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Modern Development</h4>
              <p className="text-sm text-muted-foreground">
                Built with latest technologies for performance and maintainability
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Global Ready</h4>
              <p className="text-sm text-muted-foreground">
                Docker containerization for easy deployment anywhere in the world
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Technology;
