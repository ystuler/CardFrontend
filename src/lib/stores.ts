import { writable } from 'svelte/store';

export interface User {
  id: number;
  username: string;
  token: string;
}

export const user = writable<User | null>(null);
export const isAuthenticated = writable<boolean>(false);

// Проверяем токен в localStorage при инициализации
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  if (token && userData) {
    try {
      const parsedUser = JSON.parse(userData);
      user.set(parsedUser);
      isAuthenticated.set(true);
    } catch (e) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
}
