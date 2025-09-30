import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, Package, TrendingUp, Building2, Sparkles } from "lucide-react";

const Pricing = () => {
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const plans = [
    {
      name: "Starter",
      price: "$125",
      period: "month",
      description: "Perfect for small delivery operations",
      popular: false,
      icon: Package,
      features: [
        "1,000 tasks/month included",
        "Unlimited drivers/managers",
        "Additional tasks at $0.12/task",
        "Route optimization",
        "Real-time tracking",
        "Driver app access",
        "Web dashboard"
      ],
      buttonText: "Try for Free"
    },
    {
      name: "Growth",
      price: "$275",
      period: "month",
      description: "Ideal for expanding businesses",
      popular: true,
      icon: TrendingUp,
      features: [
        "3,000 tasks/month included",
        "Unlimited drivers/managers",
        "Additional tasks at $0.09/task",
        "1 customer booking form",
        "Advanced analytics & reporting",
        "All Starter features"
      ],
      buttonText: "Try for Free"
    },
    {
      name: "Standard",
      price: "$425",
      period: "month",
      description: "Complete solution for established businesses",
      popular: false,
      icon: Building2,
      features: [
        "6,000 tasks/month included",
        "Unlimited drivers/managers",
        "Additional tasks at $0.07/task",
        "2 customer booking forms",
        "White-label branding option",
        "All Growth features"
      ],
      buttonText: "Try for Free"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "/month ",
      description: "Tailored for high-volume operations",
      popular: false,
      icon: Sparkles,
      features: [
        "10,000+ tasks/month",
        "Custom driver/manager pricing",
        "Dedicated account manager & SLA",
        "API integrations with ERP/CRM",
        "Tailored analytics",
        "Feature customization"
      ],
      buttonText: "Get in Touch"
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Simple, Transparent
            <span className="block text-primary">Pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the perfect plan for your logistics operations. Scale up or down as your business grows.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <Card 
                key={index} 
                className={`relative h-full transition-all duration-300 hover:shadow-xl ${
                  plan.popular 
                    ? 'border-primary shadow-lg ring-2 ring-primary/20 lg:scale-105' 
                    : plan.name === 'Enterprise'
                    ? 'border-primary border-2 bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-primary/20'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center shadow-md">
                      <Star className="h-4 w-4 mr-1 fill-current" />
                      Popular
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  {/* Icon */}
                  <div className={`mx-auto mb-3 w-12 h-12 rounded-xl flex items-center justify-center ${
                    plan.name === 'Enterprise' ? 'bg-primary/20' : 'bg-primary/10'
                  }`}>
                    <IconComponent className={`h-6 w-6 ${
                      plan.name === 'Enterprise' ? 'text-primary' : 'text-primary'
                    }`} />
                  </div>
                  
                  <CardTitle className={`text-xl font-bold ${
                    plan.name === 'Enterprise' ? 'text-primary' : 'text-foreground'
                  }`}>
                    {plan.name}
                  </CardTitle>
                  {plan.name !== "Enterprise" && (
                    <div className="mt-3">
                      <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period ? `/${plan.period}` : ''}</span>
                    </div>
                  )}
                  <CardDescription className={`${plan.name === 'Enterprise' ? 'mt-3' : 'mt-2'} text-sm text-muted-foreground`}>
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-3.5 w-3.5 text-success mr-2.5 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-muted-foreground leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    variant={plan.name === "Enterprise" ? "cta" : plan.popular ? "cta" : "professional"} 
                    className="w-full mt-6"
                    size="default"
                    onClick={scrollToContact}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Information */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            All plans include 14-day free trial • No setup fees • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;