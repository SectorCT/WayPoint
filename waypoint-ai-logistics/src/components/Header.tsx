import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: "Features", href: "#features" },
    { name: "Technology", href: "#technology" },
    { name: "Solutions", href: "#solutions" },
    { name: "Pricing", href: "#pricing" },
    { name: "Get Started", href: "#contact" }
  ];

  const handleNavigation = (href: string) => {
    if (href.startsWith('#')) {
      if (location.pathname !== '/') {
        // If we're not on the main page, navigate to main page first
        navigate('/', { state: { scrollTo: href } });
      } else {
        // If we're already on the main page, just scroll to the section
        window.scrollTo(0, 0);
        setTimeout(() => {
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center">
              <img 
                src="/waypoint.png" 
                alt="WayPoint Logo" 
                className="h-10 w-10 object-contain"
              />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground cursor-pointer" onClick={() => navigate('/')}>WayPoint</span>
              {/* <div className="text-xs text-muted-foreground hidden sm:block">Smart Logistics</div> */}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground hover:bg-secondary/20"
              onClick={() => window.open('http://localhost:3000/dashboard', '_blank')}
            >
              Go to Dashboard
            </Button>
            <Button variant="hero" size="sm">
              Start Free Demo
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleNavigation(item.href);
                  }}
                  className="block text-muted-foreground hover:text-foreground transition-colors font-medium py-2 text-left w-full"
                >
                  {item.name}
                </button>
              ))}
              <div className="pt-4 space-y-2">
                <Button variant="ghost" className="w-full">
                  Sign In
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full text-muted-foreground hover:text-foreground hover:bg-secondary/20"
                  onClick={() => window.open('http://localhost:3000/dashboard', '_blank')}
                >
                  Go to Dashboard
                </Button>
                <Button variant="hero" className="w-full">
                  Start Free Demo
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;