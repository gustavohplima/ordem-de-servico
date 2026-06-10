# Guia de Bypass de Autenticacao (Somente Desenvolvimento)

Este projeto possui um modo de bypass para desenvolvimento local sem backend.

## Onde esta a configuracao

Arquivo: `src/app/auth/auth.config.ts`

Variavel principal:

- `ENABLE_LOCAL_AUTH_BYPASS`

## Como habilitar (desenvolvimento local)

1. Abra `src/app/auth/auth.config.ts`.
2. Altere `ENABLE_LOCAL_AUTH_BYPASS` para `true`.
3. Rode o frontend normalmente.
4. O sistema vai:
- liberar rotas privadas no guard;
- simular usuario autenticado no `AuthService`;
- pular `checkAuth` no `APP_INITIALIZER`;
- nao tentar refresh/token no `AuthInterceptor`.

## Como desabilitar (voltar ao fluxo real)

1. Abra `src/app/auth/auth.config.ts`.
2. Altere `ENABLE_LOCAL_AUTH_BYPASS` para `false`.
3. Reinicie o frontend.
4. O sistema volta a exigir backend para login/autenticacao.

## Regra para nao enviar em producao

Checklist obrigatorio antes de merge/release:

1. Confirmar que `ENABLE_LOCAL_AUTH_BYPASS = false`.
2. Rodar build de producao.
3. Validar login real com backend ativo.
4. Revisar PR para garantir que bypass nao ficou habilitado.

## Arquivos impactados pelo bypass

- `src/app/auth/auth.config.ts`
- `src/app/auth/auth.guard.ts`
- `src/app/auth/auth.service.ts`
- `src/app/auth/auth.interceptor.ts`
- `src/app/app.config.ts`
