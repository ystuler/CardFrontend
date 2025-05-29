const API_BASE = 'http://localhost:8000';

export interface SignInReq {
  username: string;
  password: string;
}

export interface SignInResp {
  id: number;
  token: string;
  username: string;
}

export interface CreateUserReq {
  username: string;
  password: string;
}

export interface CreateUserResp {
  id: number;
  token: string;
  username: string;
}

export async function login(credentials: SignInReq): Promise<SignInResp> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export async function signup(userData: CreateUserReq): Promise<CreateUserResp> {
  const response = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}
