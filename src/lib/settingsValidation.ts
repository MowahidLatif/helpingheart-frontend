/**
 * Client-side validation for Settings page forms.
 * Returns error string or null if valid.
 */

const EMAIL_RE = /^[^@]+@[^@]+\.[^@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export function validateEmail(email: string): string | null {
  const trimmed = (email ?? '').trim();
  if (!trimmed) return 'Email is required';
  if (!EMAIL_RE.test(trimmed)) return 'Please enter a valid email address';
  return null;
}

export function validateName(name: string): string | null {
  if (!(name ?? '').trim()) return 'Name is required';
  return null;
}

export function validatePasswordChange(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): string | null {
  if (!(currentPassword ?? '').trim()) return 'Current password is required';
  if (!(newPassword ?? '').trim()) return 'New password is required';
  if (newPassword.length < MIN_PASSWORD_LENGTH)
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  if (newPassword !== confirmPassword) return 'New passwords do not match';
  return null;
}
