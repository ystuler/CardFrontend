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

export interface LogOutResp {
  message: string;
}

export interface ErrorResponse {
  error: string;
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
  name: string;
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

// Cards interfaces
export interface CreateCardReq {
  question: string;
  answer?: string;
}

export interface CreateCardResp {
  id: number;
  question: string;
  answer?: string;
  collectionID: number;
}

export interface UpdateCardReq {
  question?: string;
  answer?: string;
}

export interface UpdateCardResp {
  id: number;
  question: string;
  answer?: string;
  collection_id: number;
}

export interface CardsByCollectionID {
  id: number;
  question: string;
  answer?: string;
}

export interface GetCardByCollectionIDResp {
  collectionID: number;
  cards: CardsByCollectionID[];
}

// Helper function to get auth headers
function getAuthHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

async function getErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      const data = (await response.json()) as Partial<ErrorResponse & LogOutResp>;
      if (typeof data.error === 'string' && data.error.trim()) {
        return data.error;
      }
      if (typeof data.message === 'string' && data.message.trim()) {
        return data.message;
      }
    } catch {
      // Fallback to status text when body parsing fails.
    }
  }

  const text = await response.text();
  return text || response.statusText || 'Request failed';
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
    throw new Error(await getErrorMessage(response));
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
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

// Collections API functions
export async function getAllCollections(token: string): Promise<AllCollectionsResp> {
  const response = await fetch(`${API_BASE}/collections/`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function createCollection(token: string, collectionData: CreateCollectionReq): Promise<CreateCollectionResp> {
  const response = await fetch(`${API_BASE}/collections/`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(collectionData),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function updateCollection(token: string, collectionId: number, collectionData: UpdateCollectionReq): Promise<UpdateCollectionResp> {
  const response = await fetch(`${API_BASE}/collections/${collectionId}/`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(collectionData),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function deleteCollection(token: string, collectionId: number): Promise<void> {
  const response = await fetch(`${API_BASE}/collections/${collectionId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
}

// Cards API functions
export async function getCardsByCollection(token: string, collectionId: number): Promise<GetCardByCollectionIDResp> {
  const response = await fetch(`${API_BASE}/collections/${collectionId}/cards/`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function createCard(token: string, collectionId: number, cardData: CreateCardReq): Promise<CreateCardResp> {
  const response = await fetch(`${API_BASE}/collections/${collectionId}/cards/`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(cardData),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function updateCard(token: string, cardId: number, cardData: UpdateCardReq): Promise<UpdateCardResp> {
  const response = await fetch(`${API_BASE}/cards/${cardId}/`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(cardData),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function deleteCard(token: string, cardId: number): Promise<void> {
  const response = await fetch(`${API_BASE}/cards/${cardId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
}

export async function getTrainingCards(token: string, collectionId: number): Promise<GetCardByCollectionIDResp> {
  const response = await fetch(`${API_BASE}/collections/${collectionId}/train`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function logout(token: string): Promise<LogOutResp> {
  const response = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}
