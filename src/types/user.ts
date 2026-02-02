export interface User {
  id: number;
  email: string;
  phone_number?: string;
  notification_email?: string;
  notification_enabled: boolean;
  alert_threshold: number;
  created_at: string;
}

export interface UserCreate {
  email: string;
  password: string;
  phone_number?: string;
  notification_email?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
