const SIMPLYFORM_URL = 'https://www.simplyform.dev/api/form/submit/f4a8fb6a-a158-4534-bbeb-eb9963985a8c';

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
}

export const submitContactForm = async (formData: ContactFormData): Promise<EmailResponse> => {
  try {
    const response = await fetch(SIMPLYFORM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(formData),
      mode: 'cors',
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      return {
        success: false,
        message: errorData.message || 'Failed to send message. Please try again.'
      };
    }

    // SimplyForm might return different response structure, handle both
    const result = await response.json();
    
    // If SimplyForm returns a different structure, adapt it
    if (result.success !== undefined) {
      return result;
    } else {
      // Assume success if response is ok
      return {
        success: true,
        message: 'Message sent successfully! We\'ll get back to you soon.'
      };
    }

  } catch (error) {
    // Check if it's a network/CORS error
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return {
        success: false,
        message: 'Cannot connect to form service. Please try again later.'
      };
    }
    
    return {
      success: false,
      message: 'Network error. Please check your connection and try again.'
    };
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateForm = (formData: ContactFormData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!formData.firstName?.trim()) {
    errors.push('First name is required');
  }

  if (!formData.lastName?.trim()) {
    errors.push('Last name is required');
  }

  if (!formData.email?.trim()) {
    errors.push('Email is required');
  } else if (!validateEmail(formData.email)) {
    errors.push('Please enter a valid email address');
  }

  if (!formData.message?.trim()) {
    errors.push('Message is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
