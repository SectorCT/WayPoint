import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Smartphone, 
  Monitor, 
  CheckCircle,
  ArrowRight,
  Download,
  Globe
} from "lucide-react";
import { Link } from "react-router-dom";

const Solutions = () => {
  const mobileFeatures = [
    "Real-time package tracking",
    "Digital signature capture", 
    "GPS navigation & routing",
    "Delivery status updates",
    "Offline capability",
    "Push notifications"
  ];

  const webFeatures = [
    "Fleet management overview",
    "Route optimization tools", 
    "Performance analytics",
    "User management system",
    "Real-time monitoring",
    "Custom reporting"
  ];

  return (
    <section id="solutions" className="py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Complete
            <span className="block text-primary">Digital Solutions</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the full power of WayPoint with our integrated mobile app and web dashboard, 
            designed to streamline every aspect of your logistics operations.
          </p>
        </div>

        {/* Mobile App Section */}
        <div className="mb-20">
          <Card className="border-0 bg-background/50 backdrop-blur-sm overflow-hidden transform transition-all duration-1000 ease-out hover:scale-[1.02] hover:shadow-xl slide-up">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Content Side */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                    React Native Cross-Platform
                  </span>
                </div>
                
                <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  Mobile App for Truckers
                </h3>
                
                                 <p className="text-lg text-muted-foreground mb-8">
                   Empower your delivery team with our intuitive mobile application designed for both 
                   truckers and managers. Built with React Native for seamless cross-platform performance 
                   with role-based interfaces for different user types.
                 </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {mobileFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-3 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="cta" size="lg" className="group">
                    <Download className="h-4 w-4 mr-2" />
                    Download App
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="professional" size="lg" asChild>
                    <Link to="/app">
                      Learn More
                    </Link>
                  </Button>
                </div>
              </div>

                             {/* Image Side */}
               <div className="h-96 lg:h-auto bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                 {/* Replace this div with your mobile app images */}
                 <div className="text-center">
                   <Smartphone className="h-24 w-24 text-primary mx-auto mb-4" />
                   <p className="text-sm text-muted-foreground mb-2">
                     WayPoint Mobile App Screenshots
                   </p>
                   <p className="text-xs text-muted-foreground">
                     Replace with your actual mobile app screenshots
                   </p>
                 </div>
                 
                 {/* 
                   To add your mobile app images, replace the div above with:
                   <img 
                     src="/images/mobile-app-vertical.jpg" 
                     alt="WayPoint Mobile App" 
                     className="h-full w-auto object-contain"
                   />
                 */}
               </div>
            </div>
          </Card>
        </div>

        {/* Web Dashboard Section */}
        <div>
          <Card className="border-0 bg-background/50 backdrop-blur-sm overflow-hidden transform transition-all duration-1000 ease-out hover:scale-[1.02] hover:shadow-xl slide-up slide-up-delay-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                             {/* Image Side */}
               <div className="h-96 lg:h-auto bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center order-2 lg:order-1">
                 {/* Replace this div with your web dashboard images */}
                 <div className="text-center">
                   <Monitor className="h-24 w-24 text-primary mx-auto mb-4" />
                   <p className="text-sm text-muted-foreground mb-2">
                     WayPoint Web Dashboard Screenshots
                   </p>
                   <p className="text-xs text-muted-foreground">
                     Replace with your actual web dashboard screenshots
                   </p>
                 </div>
                 
                 {/* 
                   To add your web dashboard images, replace the div above with:
                   <img 
                     src="/images/web-dashboard-screenshot.jpg" 
                     alt="WayPoint Web Dashboard" 
                     className="h-full w-full object-cover rounded-lg"
                   />
                 */}
               </div>

              {/* Content Side */}
              <div className="p-8 lg:p-12 flex flex-col justify-center order-1 lg:order-2">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                    <Monitor className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                    React TypeScript Interface
                  </span>
                </div>
                
                <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  Web Dashboard for Managers
                </h3>
                
                <p className="text-lg text-muted-foreground mb-8">
                  Comprehensive administrative dashboard for logistics managers to oversee operations, 
                  analyze performance, and optimize routes with advanced analytics and reporting tools.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {webFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-3 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="cta" size="lg" className="group">
                    <Globe className="h-4 w-4 mr-2" />
                    Access Dashboard
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="professional" size="lg" asChild>
                    <Link to="/desktop">
                      Learn More
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Solutions;
