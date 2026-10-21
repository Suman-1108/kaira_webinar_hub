// backend/utils/passwordValidator.js

/**
 * Validates password against security rules:
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one digit (0-9)
 * - At least one special character (!@#$%^&*()_+-=[]{};':"|,.<>/?)
 */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      message: 'Password is required and must be a string.'
    };
  }

  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasMinLength) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long.'
    };
  }
  if (!hasUpper) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter (A-Z).'
    };
  }
  if (!hasLower) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter (a-z).'
    };
  }
  if (!hasDigit) {
    return {
      isValid: false,
      message: 'Password must contain at least one digit (0-9).'
    };
  }
  if (!hasSpecial) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character (e.g. !@#$%&*).'
    };
  }

  return {
    isValid: true,
    message: 'Password meets all requirements.'
  };
}

module.exports = {
  validatePassword,
  PASSWORD_REGEX
};
