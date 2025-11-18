export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function validatePasswordStrength(password: string): string[] {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Senha é obrigatória');
    return errors;
  }
  
  if (password.length < 8) {
    errors.push('Senha deve ter no mínimo 8 caracteres');
  }
  
  if (password.length > 128) {
    errors.push('Senha muito longa (máximo 128 caracteres)');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial');
  }
  
  const commonPasswords = ['password', '12345678', 'qwerty123', 'abc123456'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Senha muito comum, escolha uma senha mais segura');
  }
  
  return errors;
}

export function validateEmail(email: string): boolean {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) return false;
  
  if (email.length > 254) return false;
  
  const [localPart, domain] = email.split('@');
  if (localPart.length > 64) return false;
  
  return true;
}

export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '') 
    .trim();
}

export function validateName(name: string): string[] {
  const errors: string[] = [];
  
  if (!name || !name.trim()) {
    errors.push('Nome é obrigatório');
    return errors;
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < 3) {
    errors.push('Nome deve ter no mínimo 3 caracteres');
  }
  
  if (trimmedName.length > 100) {
    errors.push('Nome muito longo (máximo 100 caracteres)');
  }
  
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmedName)) {
    errors.push('Nome contém caracteres inválidos');
  }
  
  return errors;
}

export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function isValidToken(token: string): boolean {
  if (!token) return false;
  return /^[a-f0-9]{64}$/.test(token);
}

export function createExpirationTime(hours: number = 24): number {
  return Date.now() + (hours * 60 * 60 * 1000);
}

export function isExpired(timestamp: number): boolean {
  return Date.now() > timestamp;
}
