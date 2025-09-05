import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { submitContactForm, validateForm, type ContactFormData } from "@/lib/emailService";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm(formData);
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.errors.join(', '),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitContactForm(formData);
      
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          company: '',
          phone: '',
          message: ''
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Ready to Get
            <span className="block text-primary">Started?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Contact our logistics experts to see how WayPoint can transform your delivery operations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="border-0 bg-background shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Request a Demo</CardTitle>
              <CardDescription>
                Fill out the form below and our team will contact you within 24 hours.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input 
                      id="firstName" 
                      placeholder="John" 
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Doe" 
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@company.com" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input 
                    id="company" 
                    placeholder="Your Company" 
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+1 (555) 123-4567" 
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us about your logistics needs..."
                    className="min-h-[120px]"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  variant="cta" 
                  size="lg" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Request Demo
                    </>
                  )}
                </Button>
              </CardContent>
            </form>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">Get in Touch</h3>
              <p className="text-muted-foreground mb-8">
                Our team is here to help you optimize your logistics operations. 
                Reach out to us through any of the channels below.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="border-0 bg-background/50">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Email</h4>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">sales@waypoint.com</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-background/50">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Phone</h4>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">+1 (555) 123-4567</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-background/50">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Office</h4>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    123 Tech Street<br />
                    San Francisco, CA 94102
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-background/50">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Hours</h4>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Mon-Fri: 9AM-6PM PST<br />
                    24/7 Support Available
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Email Contact Section */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary-glow/5">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground">
                    Need Immediate Assistance?
                  </h4>
                </div>
                <p className="text-muted-foreground mb-6">
                  Send us a direct email for quick responses and urgent inquiries.
                </p>
                                 <div className="flex items-center justify-between bg-background/50 rounded-lg p-4">
                   <div>
                     <p className="text-sm text-muted-foreground mb-1">
                       <strong>General Inquiries:</strong>
                     </p>
                     <a 
                       href="mailto:contact@waypoint.delivery" 
                       className="text-primary hover:text-primary/80 transition-colors font-medium"
                     >
                       contact@waypoint.delivery
                     </a>
                   </div>
                   <Button variant="professional" size="lg" asChild>
                     <a href="mailto:contact@waypoint.delivery">
                       <Mail className="h-4 w-4 mr-2" />
                       Send Email
                     </a>
                   </Button>
                 </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;