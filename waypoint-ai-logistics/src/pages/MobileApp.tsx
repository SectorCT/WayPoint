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

// Import mobile app screenshots
import loginImage from "@/assets/mobileview/login.png";
import trucksImage from "@/assets/mobileview/trucks.png";
import journeyImage from "@/assets/mobileview/journey.png";
import signatureImage from "@/assets/mobileview/signature.png";
import routesummaryImage from "@/assets/mobileview/routesummary.png";
import driverdeliveryImage from "@/assets/mobileview/driverdelivery.png";

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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
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
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              The ultimate mobile solution for logistics management. Built with React Native for seamless 
              cross-platform performance, serving both truckers and managers with role-based interfaces.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary/20">
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

      {/* Mobile App Gallery Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              See WayPoint in
              <span className="block text-primary">Action</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore the key screens of our mobile application designed for modern logistics operations.
            </p>
          </div>

          {/* Interactive Gallery */}
          <div className="relative">
            {/* Main Featured Phone */}
            <div className="flex justify-center mb-12">
              <div className="relative w-56 h-[450px] md:w-64 md:h-[500px] bg-gradient-to-b from-gray-900 to-gray-800 rounded-[2.5rem] shadow-2xl border-4 border-gray-700 overflow-hidden transition-all duration-700 transform hover:scale-105 hover:shadow-3xl group">
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gray-600 rounded-full z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <img 
                  src={loginImage} 
                  alt="Mobile App Login" 
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  id="main-screenshot"
                />
                <div className="absolute bottom-4 left-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                  <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3">
                    <h3 className="text-white font-semibold text-sm mb-1" id="main-title">Secure Login</h3>
                    <p className="text-gray-300 text-xs" id="main-description">Role-based authentication with JWT security</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 max-w-5xl mx-auto">
              {[
                { src: loginImage, title: "Secure Login", description: "Role-based authentication with JWT security" },
                { src: trucksImage, title: "Fleet Management", description: "Monitor truck capacity and availability in real-time" },
                { src: journeyImage, title: "Journey Tracking", description: "Live tracking of delivery progress and routes" },
                { src: signatureImage, title: "Digital Signatures", description: "Capture delivery confirmations with digital signatures" },
                { src: routesummaryImage, title: "Route Summary", description: "Optimized delivery paths with detailed route information" },
                { src: driverdeliveryImage, title: "Delivery Management", description: "Complete package delivery workflow and status updates" }
              ].map((screenshot, index) => (
                <div 
                  key={index} 
                  className="group cursor-pointer transition-all duration-500 hover:scale-110 hover:-translate-y-2"
                  onClick={() => {
                    const mainImg = document.getElementById('main-screenshot') as HTMLImageElement;
                    const mainTitle = document.getElementById('main-title');
                    const mainDescription = document.getElementById('main-description');
                    
                    if (mainImg && mainTitle && mainDescription) {
                      // Add fade effect
                      mainImg.style.opacity = '0.5';
                      setTimeout(() => {
                        mainImg.src = screenshot.src;
                        mainImg.alt = screenshot.title;
                        mainTitle.textContent = screenshot.title;
                        mainDescription.textContent = screenshot.description;
                        mainImg.style.opacity = '1';
                      }, 250);
                    }
                  }}
                >
                  <div className="relative w-16 h-28 md:w-20 md:h-36 mx-auto bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl shadow-lg overflow-hidden border-2 border-transparent group-hover:border-primary group-hover:shadow-xl transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                    <img 
                      src={screenshot.src} 
                      alt={screenshot.title} 
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-300 mb-1">
                      {screenshot.title}
                    </h3>
                    <p className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 line-clamp-2">
                      {screenshot.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Gallery Navigation Dots */}
            <div className="flex justify-center mt-8 space-x-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === 0 
                      ? 'bg-primary w-6' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  onClick={() => {
                    const screenshots = [
                      { src: loginImage, title: "Secure Login", description: "Role-based authentication with JWT security" },
                      { src: trucksImage, title: "Fleet Management", description: "Monitor truck capacity and availability in real-time" },
                      { src: journeyImage, title: "Journey Tracking", description: "Live tracking of delivery progress and routes" },
                      { src: signatureImage, title: "Digital Signatures", description: "Capture delivery confirmations with digital signatures" },
                      { src: routesummaryImage, title: "Route Summary", description: "Optimized delivery paths with detailed route information" },
                      { src: driverdeliveryImage, title: "Delivery Management", description: "Complete package delivery workflow and status updates" }
                    ];
                    
                    const screenshot = screenshots[index];
                    const mainImg = document.getElementById('main-screenshot') as HTMLImageElement;
                    const mainTitle = document.getElementById('main-title');
                    const mainDescription = document.getElementById('main-description');
                    
                    if (mainImg && mainTitle && mainDescription) {
                      mainImg.style.opacity = '0.5';
                      setTimeout(() => {
                        mainImg.src = screenshot.src;
                        mainImg.alt = screenshot.title;
                        mainTitle.textContent = screenshot.title;
                        mainDescription.textContent = screenshot.description;
                        mainImg.style.opacity = '1';
                      }, 250);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        
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
      <section className="py-24 bg-secondary/20">
        
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
      <section className="py-24">
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
