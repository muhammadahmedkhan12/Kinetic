import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Membership, Payment } from '../types';
import { apiClient } from '../api/client';

interface AuthContextType {
  token: string | null;
  user: User | null;
  membership: Membership | null;
  payments: Payment[];
  bookedClassIds: number[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: any) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('kinetic_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kinetic_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [membership, setMembership] = useState<Membership | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookedClassIds, setBookedClassIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = useCallback((newToken: string, userData: any) => {
    localStorage.setItem('kinetic_token', newToken);
    localStorage.setItem('kinetic_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('kinetic_token');
    localStorage.removeItem('kinetic_user');
    setToken(null);
    setUser(null);
    setMembership(null);
    setPayments([]);
    setBookedClassIds([]);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await apiClient.get('/members/me');
      const data = res.data;
      setUser({
        id: data.id,
        user_id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        age: data.age,
        gender: data.gender,
        role: data.role,
        is_approved: data.is_approved,
        must_change_password: data.must_change_password,
        height: data.height,
        goals: data.goals,
        activity_level: data.activity_level,
        injuries: data.injuries,
        experience_level: data.experience_level,
        preferred_days: data.preferred_days,
      });
      setMembership(data.membership);
      setPayments(data.payments || []);
      setBookedClassIds(data.bookings || []);
      localStorage.setItem('kinetic_user', JSON.stringify(data));
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        membership,
        payments,
        bookedClassIds,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
