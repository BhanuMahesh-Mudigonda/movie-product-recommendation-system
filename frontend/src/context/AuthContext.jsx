import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi';
import { userAccountService } from '../services/userAccountService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('moviemind_token');
        const rawUser = localStorage.getItem('moviemind_user');

        if (token) {
          if (token.startsWith('local_token_')) {
            if (rawUser) {
              try {
                setUser(JSON.parse(rawUser));
              } catch (e) {
                console.warn("Corrupt local user JSON:", e);
                localStorage.removeItem('moviemind_token');
                localStorage.removeItem('moviemind_user');
              }
            }
          } else {
            try {
              const userData = await authApi.getMe();
              if (userData && typeof userData === 'object') {
                setUser(userData);
              } else {
                localStorage.removeItem('moviemind_token');
                localStorage.removeItem('moviemind_user');
              }
            } catch (error) {
              console.warn("Session restoration warning:", error);
              localStorage.removeItem('moviemind_token');
              localStorage.removeItem('moviemind_user');
            }
          }
        }
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await userAccountService.loginUser({ identifier: email, password });
      if (data?.access_token) {
        localStorage.setItem('moviemind_token', data.access_token);
      }
      if (data?.user) {
        localStorage.setItem('moviemind_user', JSON.stringify(data.user));
        setUser(data.user);
      }
      return data;
    } catch (error) {
      console.error("Login service error:", error);
      throw error;
    }
  };

  const loginPhone = async (phone, password) => {
    try {
      const data = await userAccountService.loginUser({ identifier: phone, password });
      if (data?.access_token) {
        localStorage.setItem('moviemind_token', data.access_token);
      }
      if (data?.user) {
        localStorage.setItem('moviemind_user', JSON.stringify(data.user));
        setUser(data.user);
      }
      return data;
    } catch (error) {
      console.error("Phone login service error:", error);
      throw error;
    }
  };

  const signup = async (name, email, password, phone = '') => {
    try {
      const data = await userAccountService.registerUser({ name, email, password, phone });
      if (data?.access_token) {
        localStorage.setItem('moviemind_token', data.access_token);
      }
      if (data?.user) {
        localStorage.setItem('moviemind_user', JSON.stringify(data.user));
        setUser(data.user);
      }
      return data;
    } catch (error) {
      console.error("Signup service error:", error);
      throw error;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('moviemind_token');
      localStorage.removeItem('moviemind_user');
    } catch (e) {
      console.warn("Logout storage clear warning:", e);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      loginPhone,
      signup,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
