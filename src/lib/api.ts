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

// Collections interfaces
export interface CreateCollectionReq {
  name: string;
  description?: string;
}

export interface CreateCollectionResp {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export interface UpdateCollectionReq {
  id: number;
  name?: string;
  description?: string;
}

export interface UpdateCollectionResp {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export interface AllCollections {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface AllCollectionsResp {
  collections: AllCollections[];
}

// Helper function to get auth headers
function getAuthHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
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

// Collections API functions
export async function getAllCollections(token: string): Promise<AllCollectionsResp> {
  const response = await fetch(`${API_BASE}/collections`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export async function createCollection(token: string, collectionData: CreateCollectionReq): Promise<CreateCollectionResp> {
  const response = await fetch(`${API_BASE}/collections`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(collectionData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export async function updateCollection(token: string, collectionData: UpdateCollectionReq): Promise<UpdateCollectionResp> {
  const response = await fetch(`${API_BASE}/collections/${collectionData.id}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(collectionData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export async function deleteCollection(token: string, collectionId: number): Promise<void> {
  const response = await fetch(`${API_BASE}/collections/${collectionId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
}
