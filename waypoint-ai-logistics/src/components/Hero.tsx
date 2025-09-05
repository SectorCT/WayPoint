import { Button } from "@/components/ui/button";
import { ArrowRight, Play, TrendingUp, Clock, DollarSign } from "lucide-react";
import heroImage from "@/assets/hero-logistics.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Smart logistics and delivery operations" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient opacity-90"></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-10">
        <div className="absolute top-20 left-10 w-4 h-4 bg-primary rounded-full float-animation opacity-60"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-primary-glow rounded-full float-animation opacity-40" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 left-20 w-5 h-5 bg-primary rounded-full float-animation opacity-50" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="slide-up">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6">
            Save Time, Cut Costs,
            <span className="block text-primary-glow">Deliver Smart</span>
          </h1>
        </div>
        
        <div className="slide-up slide-up-delay-1">
          <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Revolutionize your delivery operations with AI-powered logistics management.
            Intelligent routing, real-time tracking, and automated fleet optimization.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="slide-up slide-up-delay-2 flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button variant="cta" size="lg" className="text-lg px-8 py-4">
            Start Your Free Demo
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="professional" size="lg" className="text-lg px-8 py-4 bg-white/10 text-white border-white/20 hover:bg-white/20">
            <Play className="mr-2 h-5 w-5" />
            Watch Demo Video
          </Button>
        </div>

        {/* Stats */}
        <div className="slide-up slide-up-delay-3 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-primary-glow mr-2" />
              <span className="text-3xl font-bold text-white">40%</span>
            </div>
            <p className="text-white/80">Faster Delivery Times</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-6 w-6 text-primary-glow mr-2" />
              <span className="text-3xl font-bold text-white">25%</span>
            </div>
            <p className="text-white/80">Cost Reduction</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-6 w-6 text-primary-glow mr-2" />
              <span className="text-3xl font-bold text-white">99%</span>
            </div>
            <p className="text-white/80">Delivery Success Rate</p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;