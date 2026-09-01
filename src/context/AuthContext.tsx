'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, UserStatus } from '@/types';

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
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'rbms_users_v2';
const CURRENT_USER_KEY = 'rbms_current_user_v3';

const mapUserFromApi = (user: any): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  requestedRole: user.requestedRole ?? user.requested_role,
  status: user.status,
  phone: user.phone ?? undefined,
  createdAt: user.createdAt ?? user.created_at ?? new Date().toISOString(),
  lastLogin: user.lastLogin ?? user.last_login ?? undefined,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize users from storage first, then hydrate from the backend API.
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const storedCurrentUser = localStorage.getItem(CURRENT_USER_KEY);

      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        setUsers([]);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([]));
      }

      if (storedCurrentUser) {
        setCurrentUser(JSON.parse(storedCurrentUser));
      }
    } catch (e) {
      console.error('Error loading users from localStorage:', e);
      setUsers([]);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }

    const loadBackendUsers = async () => {
      try {
        const response = await fetch('/api/users', { cache: 'no-store' });
        if (!response.ok) return;

        const result = await response.json();
        const apiUsers: User[] = (result.users ?? []).map(mapUserFromApi);
        setUsers(apiUsers);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(apiUsers));

        const storedCurrentUser = localStorage.getItem(CURRENT_USER_KEY);
        if (storedCurrentUser) {
          const current = JSON.parse(storedCurrentUser) as User;
          const refreshedCurrent = apiUsers.find(user => user.id === current.id);
          if (refreshedCurrent) {
            setCurrentUser(refreshedCurrent);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(refreshedCurrent));
          }
        }
      } catch (error) {
        console.error('Error loading users from backend API:', error);
      }
    };

    loadBackendUsers();
  }, []);

  const updateUserInBackend = (payload: { id: string; role?: UserRole; status?: UserStatus }) => {
    fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(error => console.error('Error updating user in backend API:', error));
  };

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  };

  const login = async (email: string, _password?: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: _password }),
      });
      const result = await response.json();

      if (response.ok && result.success && result.user) {
        const apiUser = {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          requestedRole: result.user.requested_role,
          status: result.user.status,
          phone: result.user.phone,
          createdAt: result.user.created_at || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        } as User;
        setCurrentUser(apiUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(apiUser));
        return { success: true, user: apiUser };
      }

      if (!response.ok && result.error) {
        return { success: false, error: result.error };
      }
    } catch {
      // Fall back to local users when the API is unavailable in development.
    }

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
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, email: cleanEmail }),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        return { success: true, message: result.message };
      }

      if (!response.ok && result.error) {
        return { success: false, message: result.error };
      }
    } catch {
      // Fall back to local registration when the API is unavailable in development.
    }

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
        const role = u.requestedRole || u.role;
        return { 
          ...u, 
          status: 'Active' as UserStatus, 
          role,
          requestedRole: role,
        };
      }
      return u;
    });
    saveUsers(updated);
    const approvedUser = users.find(user => user.id === userId);
    updateUserInBackend({ id: userId, role: approvedUser?.requestedRole || approvedUser?.role, status: 'Active' });
  };

  const rejectUser = (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, status: 'Inactive' as UserStatus };
      }
      return u;
    });
    saveUsers(updated);
    updateUserInBackend({ id: userId, status: 'Inactive' });
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole, requestedRole: newRole };
      }
      return u;
    });
    saveUsers(updated);
    updateUserInBackend({ id: userId, role: newRole });

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
    updateUserInBackend({ id: userId, status });
  };

  const deleteUser = (userId: string) => {
    const updated = users.filter(u => u.id !== userId);
    saveUsers(updated);
    fetch(`/api/users?id=${encodeURIComponent(userId)}`, { method: 'DELETE' })
      .catch(error => console.error('Error deleting user from backend API:', error));
  };

  const resetPassword = async (email: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, newPassword }),
      });
    } catch (e) {
      console.error('API password reset fallback:', e);
    }

    const updatedUsers = users.map(u => u.email.toLowerCase() === cleanEmail ? { ...u, password: newPassword } : u);
    saveUsers(updatedUsers);

    return { success: true };
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
      resetPassword,
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
