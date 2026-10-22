import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiUrl } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('kaira_token'));
  const [loading, setLoading] = useState(true);

  // Check current session on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(getApiUrl('/api/v1/auth/me'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          logout();
          setLoading(false);
          return;
        }
        const data = await res.json().catch(() => ({}));
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Auth check error, clearing invalid session');
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch(getApiUrl('/api/v1/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        let msg = data.message;
        if (!msg) {
          if (res.status === 401) msg = 'Invalid email or password. Please check your credentials.';
          else if (res.status === 403) msg = 'Your email address is not verified. Please verify your email with OTP.';
          else if (res.status === 400) msg = 'Please enter both your email address and password.';
          else msg = 'Server encountered an error during login. Please try again later.';
        }
        const err = new Error(msg);
        err.requiresVerification = data.requiresVerification || res.status === 403;
        err.email = data.email || email;
        err.status = res.status;
        throw err;
      }
      localStorage.setItem('kaira_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    }
  };

  const register = async (name, email, password, phone = '') => {
    try {
      const res = await fetch(getApiUrl('/api/v1/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        const err = new Error(data.message || 'Registration failed.');
        err.status = res.status;
        err.conflict = res.status === 409 || data.conflict;
        err.requiresVerification = data.requiresVerification;
        err.email = data.email || email;
        throw err;
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const res = await fetch(getApiUrl('/api/v1/auth/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const err = new Error(data.message || 'Verification failed. Please try again.');
        err.status = res.status;
        throw err;
      }
      localStorage.setItem('kaira_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const resendOtp = async (email) => {
    try {
      const res = await fetch(getApiUrl('/api/v1/auth/resend-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const err = new Error(data.message || 'Failed to resend code.');
        err.status = res.status;
        throw err;
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await fetch(getApiUrl('/api/v1/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const err = new Error(data.message || 'Failed to send reset code.');
        err.status = res.status;
        throw err;
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  const verifyResetOtp = async (email, otp) => {
    try {
      const res = await fetch(getApiUrl('/api/v1/auth/verify-reset-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const err = new Error(data.message || 'Invalid or expired code.');
        err.status = res.status;
        throw err;
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  const resendResetOtp = async (email) => {
    try {
      const res = await fetch(getApiUrl('/api/v1/auth/resend-reset-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const err = new Error(data.message || 'Failed to resend reset code.');
        err.status = res.status;
        throw err;
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  const resetPassword = async (resetToken, newPassword) => {
    try {
      const res = await fetch(getApiUrl('/api/v1/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const err = new Error(data.message || 'Failed to reset password.');
        err.status = res.status;
        throw err;
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('kaira_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser(prev => (prev ? { ...prev, ...updatedFields } : null));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      verifyOtp,
      resendOtp,
      forgotPassword,
      verifyResetOtp,
      resendResetOtp,
      resetPassword,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
