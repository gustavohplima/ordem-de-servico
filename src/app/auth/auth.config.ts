/**
 * Configurações centralizadas de autenticação.
 * Adapte os valores conforme o contrato da sua API backend.
 */
export const AUTH_CONFIG = {
  // ── Endpoints ─────────────────────────────────────────────────────────────

  /** URL base da API (sem barra final). Ex: 'http://localhost:8080' */
  API_URL: 'http://192.168.15.66:8080',

  /** Endpoint de login (POST). Ex: '/auth/login' | '/api/auth/signin' */
  LOGIN_ENDPOINT: '/api/auth/login',

  /**
   * Endpoint de logout (POST).
   * Obrigatório em cookie HttpOnly para que o servidor invalide a sessão.
   */
  LOGOUT_ENDPOINT: '/api/auth/logout',

  /**
   * Endpoint para renovar o access token (POST).
   * Deixe vazio ('') para desabilitar o fluxo de refresh token.
   */
  REFRESH_TOKEN_ENDPOINT: '/api/auth/refresh',

  /**
   * Endpoint que retorna os dados do usuário autenticado (GET).
   * Chamado via APP_INITIALIZER para hidratar o estado da aplicação.
   * Necessário para autenticação baseada em cookie HttpOnly.
   * Deixe vazio ('') para desabilitar a chamada de verificação inicial.
   */
  CHECK_AUTH_ENDPOINT: '/api/auth/me',

  // ── Armazenamento Local ───────────────────────────────────────────────────

  /** Chave no localStorage para o access token JWT */
  ACCESS_TOKEN_KEY: 'jdf_access_token',

  /** Chave no localStorage para o refresh token */
  REFRESH_TOKEN_KEY: 'jdf_refresh_token',

  // ── Campos da Resposta do Backend ────────────────────────────────────────

  /**
   * Nome do campo no JSON de resposta do login que contém o access token.
   * Exemplos comuns: 'accessToken' | 'token' | 'jwt' | 'access_token'
   */
  TOKEN_RESPONSE_FIELD: 'accessToken' as const,

  /**
   * Nome do campo no JSON de resposta do login que contém o refresh token.
   * Exemplos comuns: 'refreshToken' | 'refresh_token'
   * Deixe null se o backend não suportar refresh token.
   */
  REFRESH_TOKEN_RESPONSE_FIELD: 'refreshToken' as const,

  // ── Cookies & CSRF ────────────────────────────────────────────────────────

  /**
   * Envia cookies nas requisições cross-origin (necessário para autenticação via cookie HttpOnly).
   * O backend DEVE ter Access-Control-Allow-Credentials: true e uma origem explícita (não *).
   */
  WITH_CREDENTIALS: true,

  /**
   * Nome do cabeçalho CSRF enviado pelo frontend nas requisições de mutação.
   * Padrão Angular / Spring Security: 'X-XSRF-TOKEN'
   */
  CSRF_HEADER_NAME: 'X-XSRF-TOKEN',

  /**
   * Nome do cookie CSRF (não-HttpOnly) enviado pelo backend para ser lido pelo frontend.
   * Padrão Spring Security: 'XSRF-TOKEN'
   */
  CSRF_COOKIE_NAME: 'XSRF-TOKEN',

  // ── Navegação ─────────────────────────────────────────────────────────────

  /** Rota da página de login */
  LOGIN_URL: '/login',

  /** Rota para redirecionar após login bem-sucedido */
  POST_LOGIN_REDIRECT: '/atendimento',
} as const;
