# Front End Services

## Producao

Este projeto Angular em producao deve ser servido por Nginx via Docker.

- O `Dockerfile` gera o build com `ng build --configuration production`.
- A imagem final usa `nginx:alpine` para servir os arquivos estaticos.
- O arquivo `nginx.conf` aplica fallback de SPA (`try_files ... /index.html`).
- A aplicacao em producao escuta na porta `80` dentro do container (Nginx).

Comandos:

```bash
docker build -t front-end-services .
docker run --rm -p 80:80 front-end-services
```

Para teste local sem usar a porta 80 do host:

```bash
docker run --rm -p 8080:80 front-end-services
```

Em producao, nao execute `node dist/front-end-services/server/server.mjs`.
