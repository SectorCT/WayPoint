import { Mail, Phone, MapPin } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleFooterNavigation = (href: string) => {
    if (href.startsWith('#')) {
      if (location.pathname !== '/') {
        // If we're not on the main page, navigate to main page first
        navigate('/', { state: { scrollTo: href } });
      } else {
        // If we're already on the main page, just scroll to the section
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      // For regular links like /api-documentation
      navigate(href);
    }
  };

  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "Technology", href: "#technology" },
        { name: "Pricing", href: "#pricing" },
        { name: "API Documentation", href: "/api-documentation" }
      ]
    },
    {
      title: "Solutions",
      links: [
        { name: "Mobile App", href: "/app" },
        { name: "Web Dashboard", href: "/desktop" },
        { name: "API Integration", href: "/api-documentation" },
        { name: "Enterprise", href: "#enterprise" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "Get Started", href: "#contact" },
        { name: "Contact", href: "#contact" }
      ]
    }
  ];

  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center justify-center">
                  <img 
                    src="/waypoint.png" 
                    alt="WayPoint Logo" 
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <div>
                  <span className="text-xl font-bold cursor-pointer" onClick={() => navigate('/')}>WayPoint</span>
                  <div className="text-sm text-background/70">Smart Logistics</div>
                </div>
              </div>
              
              <p className="text-background/80 mb-6 max-w-md">
                Revolutionizing delivery operations with AI-powered logistics management. 
                Save time, cut costs, and deliver smart with WayPoint.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center text-background/80">
                  <Mail className="h-4 w-4 mr-3" />
                  <span className="text-sm">sales@waypoint.com</span>
                </div>
                <div className="flex items-center text-background/80">
                  <Phone className="h-4 w-4 mr-3" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center text-background/80">
                  <MapPin className="h-4 w-4 mr-3" />
                  <span className="text-sm">San Francisco, CA</span>
                </div>
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-4 text-background">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <button 
                        onClick={() => handleFooterNavigation(link.href)}
                        className="text-background/70 hover:text-primary transition-colors text-sm text-left"
                      >
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-background/20 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-background/60 text-sm mb-4 sm:mb-0">
              © 2024 WayPoint. All rights reserved.
            </div>
            
            <div className="flex space-x-6 text-sm">
              <button onClick={() => handleFooterNavigation("/privacy-policy")} className="text-background/60 hover:text-primary transition-colors">
                Privacy Policy
              </button>
              <button onClick={() => handleFooterNavigation("/terms-of-service")} className="text-background/60 hover:text-primary transition-colors">
                Terms of Service
              </button>
              <button onClick={() => handleFooterNavigation("/security")} className="text-background/60 hover:text-primary transition-colors">
                Security
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;