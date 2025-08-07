/**
 * Utility functions for input sanitization and validation
 */

/**
 * Escapes HTML characters to prevent XSS attacks
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Sanitizes user input by removing potentially dangerous characters
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>'"&]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#x27;';
        case '&': return '&amp;';
        default: return char;
      }
    });
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number format
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8;
}

/**
 * Sanitizes numeric input
 */
export function sanitizeNumericInput(input: string | number): number {
  if (typeof input === 'number') return Math.max(0, input);
  const num = parseFloat(input.toString().replace(/[^\d.-]/g, ''));
  return isNaN(num) ? 0 : Math.max(0, num);
}

/**
 * Validates and sanitizes form data
 */
export function validateFormData(data: Record<string, any>): { isValid: boolean; errors: string[]; sanitized: Record<string, any> } {
  const errors: string[] = [];
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
      
      // Specific validations
      if (key.includes('email') && value && !isValidEmail(value)) {
        errors.push(`Format d'email invalide pour ${key}`);
      }
      
      if (key.includes('phone') && value && !isValidPhone(value)) {
        errors.push(`Format de téléphone invalide pour ${key}`);
      }
    } else if (typeof value === 'number') {
      sanitized[key] = sanitizeNumericInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
}