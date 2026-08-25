import { authApi } from './authApi.js';

const USERS_STORAGE_KEY = 'moviemind_registered_users';

const DEFAULT_DEMO_USER = {
  id: 'demo_user_1',
  name: 'Demo User',
  email: 'demo@moviemind.ai',
  phone: '+919876543210',
  password: 'MovieMind@123'
};

function getLocalUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [DEFAULT_DEMO_USER];
    const hasDemo = parsed.some(u => u && (u.email === DEFAULT_DEMO_USER.email || u.id === DEFAULT_DEMO_USER.id));
    if (!hasDemo) {
      parsed.unshift(DEFAULT_DEMO_USER);
    }
    return parsed;
  } catch (e) {
    console.warn("Error parsing local users from localStorage:", e);
    return [DEFAULT_DEMO_USER];
  }
}

function saveLocalUsers(users) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error("Error saving users to localStorage:", e);
  }
}

export const userAccountService = {
  async registerUser({ name, email, password, phone = '' }) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPhone = String(phone || '').trim();
    const users = getLocalUsers();

    // Check duplicates
    if (cleanEmail) {
      const emailExists = users.some(u => u && String(u.email || '').toLowerCase() === cleanEmail);
      if (emailExists) {
        throw new Error('Email address is already registered');
      }
    }

    if (cleanPhone) {
      const phoneExists = users.some(u => u && String(u.phone || '').trim() === cleanPhone);
      if (phoneExists) {
        throw new Error('Phone number is already registered');
      }
    }

    let backendUser = null;
    let backendToken = null;

    try {
      const backendRes = await authApi.signup(name, cleanEmail, password);
      if (backendRes?.user) {
        backendUser = {
          ...backendRes.user,
          phone: cleanPhone || backendRes.user.phone || ''
        };
        backendToken = backendRes.access_token;
      }
    } catch (err) {
      console.warn("Backend signup failed, falling back to local registration:", err);
    }

    const newUser = backendUser || {
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: password
    };

    users.push(newUser);
    saveLocalUsers(users);

    const token = backendToken || `local_token_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    return { user: newUser, access_token: token };
  },

  async loginUser({ identifier, password }) {
    const cleanId = String(identifier || '').trim().toLowerCase();
    const cleanRaw = String(identifier || '').trim();
    const users = getLocalUsers();

    let backendData = null;
    try {
      backendData = await authApi.login(cleanRaw, password);
      if (backendData?.access_token && backendData?.user) {
        return backendData;
      }
    } catch (err) {
      console.warn("Backend login failed, checking local users:", err);
    }

    // Match against local users
    const matchedUser = users.find(u => {
      if (!u || u.password !== password) return false;
      const uEmail = String(u.email || '').toLowerCase();
      const uPhone = String(u.phone || '').trim();
      return (cleanId && uEmail === cleanId) || (cleanRaw && uPhone === cleanRaw);
    });

    if (matchedUser) {
      const token = `local_token_${Date.now()}_${matchedUser.id}`;
      return { user: matchedUser, access_token: token };
    }

    throw new Error('Incorrect email/phone number or password.');
  }
};
