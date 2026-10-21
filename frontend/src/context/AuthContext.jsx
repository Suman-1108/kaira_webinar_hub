import React, { createContext, useContext, useState, useEffect } from 'react';

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
        const res = await fetch('/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Auth check error, using cached session if available');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const err = new Error(data.message || 'Invalid email or password.');
        err.requiresVerification = data.requiresVerification;
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
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const err = new Error(data.message || 'Registration failed.');
        err.status = res.status;
        throw err;
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const res = await fetch('/api/v1/auth/verify-otp', {
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
      const res = await fetch('/api/v1/auth/resend-otp', {
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
