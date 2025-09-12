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
import { Link, useNavigate } from "react-router-dom";

// Import selected mobile app screenshots
import loginImage from "@/assets/mobileview/login.png";
import trucksImage from "@/assets/mobileview/trucks.png";
import journeyImage from "@/assets/mobileview/journey.png";
import signatureImage from "@/assets/mobileview/signature.png";

// Import desktop dashboard screenshots
import desktopJourneyImage from "@/assets/desktopview/desktopjourney.png";
import packagesImage from "@/assets/desktopview/packages.png";
import statisticsImage from "@/assets/desktopview/statistics.png";
import trucksAssignImage from "@/assets/desktopview/trucksassign.png";

const Solutions = () => {
  const navigate = useNavigate();

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

  // Selected mobile screenshots for showcase
  const mobileScreenshots = [
    { src: loginImage, title: "Secure Login", alt: "Mobile app login screen" },
    { src: trucksImage, title: "Fleet Management", alt: "Truck management interface" },
    { src: journeyImage, title: "Journey Tracking", alt: "Live delivery tracking" },
    { src: signatureImage, title: "Digital Signatures", alt: "Digital signature capture" }
  ];

  // Desktop dashboard screenshots for showcase
  const desktopScreenshots = [
    { src: desktopJourneyImage, title: "Journey Management", alt: "Desktop journey tracking interface" },
    { src: packagesImage, title: "Package Operations", alt: "Package management dashboard" },
    { src: statisticsImage, title: "Analytics Dashboard", alt: "Performance statistics and analytics" },
    { src: trucksAssignImage, title: "Fleet Assignment", alt: "Truck assignment and fleet management" }
  ];

  const handleMobileImageClick = () => {
    navigate('/app');
  };

  const handleDesktopImageClick = () => {
    navigate('/desktop');
  };

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

              {/* Image Side - Mobile App Showcase */}
              <div className="h-96 lg:h-auto bg-gradient-to-br from-primary/10 to-primary/5 p-6 flex items-center justify-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-10 left-10 w-20 h-20 bg-primary rounded-full"></div>
                  <div className="absolute bottom-10 right-10 w-16 h-16 bg-primary rounded-full"></div>
                  <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-primary rounded-full"></div>
                  <div className="absolute bottom-1/3 right-1/4 w-12 h-12 bg-primary rounded-full"></div>
                </div>

                {/* Mobile Screenshots Grid */}
                <div className="relative z-10 grid grid-cols-2 gap-6 max-w-md">
                  {mobileScreenshots.map((screenshot, index) => (
                    <div 
                      key={index}
                      className="cursor-pointer"
                      onClick={handleMobileImageClick}
                      title={`Click to explore ${screenshot.title}`}
                    >
                      {/* Phone Mockup Container */}
                      <div className="relative w-28 h-44 mx-auto bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-lg border-2 border-gray-700 overflow-hidden">
                        <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-gray-600 rounded-full z-10"></div>
                        <img 
                          src={screenshot.src} 
                          alt={screenshot.alt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Label */}
                      <div className="mt-3 text-center">
                        <p className="text-sm text-muted-foreground">
                          {screenshot.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All Overlay */}
                <div 
                  className="absolute bottom-4 right-4 bg-primary/90 backdrop-blur-sm rounded-lg px-3 py-2 cursor-pointer"
                  onClick={handleMobileImageClick}
                >
                  <p className="text-white text-xs font-semibold flex items-center">
                    View All Features
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Web Dashboard Section */}
        <div>
          <Card className="border-0 bg-background/50 backdrop-blur-sm overflow-hidden transform transition-all duration-1000 ease-out hover:scale-[1.02] hover:shadow-xl slide-up slide-up-delay-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Image Side */}
              <div className="h-96 lg:h-auto bg-gradient-to-br from-primary/10 to-primary/5 p-6 flex items-center justify-center order-2 lg:order-1 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-10 left-10 w-20 h-20 bg-primary rounded-full"></div>
                  <div className="absolute bottom-10 right-10 w-16 h-16 bg-primary rounded-full"></div>
                  <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-primary rounded-full"></div>
                  <div className="absolute bottom-1/3 right-1/4 w-12 h-12 bg-primary rounded-full"></div>
                </div>

                {/* Desktop Screenshots Grid - Horizontal Layout */}
                <div className="relative z-10 grid grid-cols-2 gap-4 max-w-2xl">
                  {desktopScreenshots.map((screenshot, index) => (
                    <div 
                      key={index}
                      className="cursor-pointer group"
                      onClick={handleDesktopImageClick}
                      title={`Click to explore ${screenshot.title}`}
                    >
                      {/* Desktop Mockup Container */}
                      <div className="relative w-full h-32 mx-auto bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg shadow-lg border-2 border-gray-700 overflow-hidden">
                        <div className="absolute top-2 left-2 w-3 h-3 bg-red-500 rounded-full z-10"></div>
                        <div className="absolute top-2 left-6 w-3 h-3 bg-yellow-500 rounded-full z-10"></div>
                        <div className="absolute top-2 left-10 w-3 h-3 bg-green-500 rounded-full z-10"></div>
                        <img 
                          src={screenshot.src} 
                          alt={screenshot.alt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      
                      {/* Label */}
                      <div className="mt-2 text-center">
                        <p className="text-xs text-muted-foreground">
                          {screenshot.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All Overlay */}
                <div 
                  className="absolute bottom-4 right-4 bg-primary/90 backdrop-blur-sm rounded-lg px-3 py-2 cursor-pointer"
                  onClick={handleDesktopImageClick}
                >
                  <p className="text-white text-xs font-semibold flex items-center">
                    View All Features
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </p>
                </div>
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
