// ── Requisição de Login ───────────────────────────────────────────────────────

export interface LoginRequest {
  /** Nome de usuário ou e-mail, conforme o backend esperar */
  nome: string;
  senha: string;
}

// ── Resposta do Backend ───────────────────────────────────────────────────────

export interface LoginResponse {
  /** Access token JWT retornado pelo backend */
  accessToken: string;
  /** Refresh token (opcional — depende do backend) */
  refreshToken?: string;
  /** Tipo do token, geralmente 'Bearer' */
  tokenType?: string;
  /** Tempo de expiração em segundos (opcional) */
  expiresIn?: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ── Payload do JWT ────────────────────────────────────────────────────────────

/**
 * Claims padrão do JWT mais claims customizados comuns.
 * Adapte conforme o payload que seu backend retorna.
 */
export interface TokenPayload {
  /** Subject — geralmente username ou userId */
  sub: string;
  /** Timestamp de expiração (segundos desde epoch) */
  exp: number;
  /** Timestamp de emissão (segundos desde epoch) */
  iat: number;
  /** Nome de exibição do usuário (claim customizada) */
  name?: string;
  /** E-mail do usuário (claim customizada) */
  email?: string;
  /** Lista de roles/permissões (claim customizada) */
  roles?: string[];
  /** Permite quaisquer outras claims presentes no token */
  [key: string]: unknown;
}

// ── Estado do Usuário na UI ───────────────────────────────────────────────────

/** Representa o usuário autenticado em memória (UI state) */
export interface AuthUser {
  /** Username ou identificador único */
  nome: string;
  /** Nome de exibição */
  name?: string;
  /** E-mail */
  email?: string;
  /** Roles/permissões para controle de acesso na UI */
  roles: string[];
}
