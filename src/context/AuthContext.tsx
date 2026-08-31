'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, UserStatus } from '@/types';
import { INITIAL_USERS } from '@/lib/mockData';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (data: { name: string; email: string; phone: string; password?: string; requestedRole: UserRole }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  updateUserStatus: (userId: string, status: UserStatus) => void;
  deleteUser: (userId: string) => void;
  quickLoginAs: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'rbms_users_v2';
const CURRENT_USER_KEY = 'rbms_current_user_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize users from storage or mock data
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const storedCurrentUser = localStorage.getItem(CURRENT_USER_KEY);

      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        setUsers(INITIAL_USERS);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      }

      if (storedCurrentUser) {
        setCurrentUser(JSON.parse(storedCurrentUser));
      } else {
        // Default to Admin for frictionless testing
        setCurrentUser(INITIAL_USERS[0]);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(INITIAL_USERS[0]));
      }
    } catch (e) {
      console.error('Error loading users from localStorage:', e);
      setUsers(INITIAL_USERS);
      setCurrentUser(INITIAL_USERS[0]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  };

  const login = async (email: string, _password?: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, error: 'No account found with this email address.' };
    }

    if (user.status === 'Pending Approval') {
      return { 
        success: false, 
        error: 'Your registration request is currently Pending Approval by an Administrator.' 
      };
    }

    if (user.status === 'Inactive' || user.status === 'Suspended') {
      return { 
        success: false, 
        error: `Your account is ${user.status}. Please contact the system administrator.` 
      };
    }

    const updatedUser = { ...user, lastLogin: new Date().toISOString() };
    const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
    saveUsers(updatedUsers);

    setCurrentUser(updatedUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    return { success: true, user: updatedUser };
  };

  const register = async (data: { 
    name: string; 
    email: string; 
    phone: string; 
    password?: string; 
    requestedRole: UserRole 
  }): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = data.email.trim().toLowerCase();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      role: data.requestedRole,
      requestedRole: data.requestedRole,
      status: 'Pending Approval',
      phone: data.phone.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [...users, newUser];
    saveUsers(updated);

    return { 
      success: true, 
      message: `Registration successful! Your request for "${data.requestedRole}" role is awaiting Admin approval.` 
    };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const quickLoginAs = (role: UserRole) => {
    const targetUser = users.find(u => u.role === role && u.status === 'Active');
    if (targetUser) {
      const updatedUser = { ...targetUser, lastLogin: new Date().toISOString() };
      setCurrentUser(updatedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }
  };

  const switchRole = (role: UserRole) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role };
    setCurrentUser(updated);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
  };

  const approveUser = (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { 
          ...u, 
          status: 'Active' as UserStatus, 
          role: u.requestedRole || u.role 
        };
      }
      return u;
    });
    saveUsers(updated);
  };

  const rejectUser = (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, status: 'Inactive' as UserStatus };
      }
      return u;
    });
    saveUsers(updated);
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole, requestedRole: newRole };
      }
      return u;
    });
    saveUsers(updated);

    if (currentUser && currentUser.id === userId) {
      const updatedCurrent = { ...currentUser, role: newRole };
      setCurrentUser(updatedCurrent);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedCurrent));
    }
  };

  const updateUserStatus = (userId: string, status: UserStatus) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, status };
      }
      return u;
    });
    saveUsers(updated);
  };

  const deleteUser = (userId: string) => {
    const updated = users.filter(u => u.id !== userId);
    saveUsers(updated);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      isLoading,
      login,
      register,
      logout,
      switchRole,
      approveUser,
      rejectUser,
      updateUserRole,
      updateUserStatus,
      deleteUser,
      quickLoginAs,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
