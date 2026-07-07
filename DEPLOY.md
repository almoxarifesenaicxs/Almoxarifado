# Deploy Gratis: Render + Vercel

## Ordem certa

1. Subir a API no Render.
2. Testar a API.
3. Subir o frontend no Vercel.
4. Voltar no Render e liberar a URL do Vercel no CORS.

## API no Render

1. Entre no Render.
2. Clique em **New +**.
3. Clique em **Web Service**.
4. Conecte o repositorio do GitHub.
5. Selecione o repositorio `Almoxarifado`.
6. Configure:

```txt
Name: almoxarifado-api
Runtime: Docker
Branch: main
Root Directory: deixe vazio
Dockerfile Path: ./Dockerfile
Instance Type: Free
```

7. Em **Environment Variables**, adicione:

```txt
ASPNETCORE_ENVIRONMENT=Production
Jwt__Key=SenaiAlmoxarifado2026ChaveSuperSecreta
Jwt__Issuer=AlmoxarifadoAPI
Jwt__Audience=AlmoxarifadoUsuarios
Jwt__DurationInMinutes=60
Firebase__ProjectId=almoxarifadosenai-d7cca
Cors__AllowedOrigins__0=https://temp.vercel.app
FIREBASE_CREDENTIALS_JSON=cole-aqui-o-json-do-firebase-em-uma-linha
```

8. Para `FIREBASE_CREDENTIALS_JSON`, use o valor do JSON compactado em uma linha.

No Render:

```txt
Key: FIREBASE_CREDENTIALS_JSON
Value: tudo depois do sinal de = no seu .env
```

9. Clique em **Create Web Service**.
10. Aguarde o deploy terminar.
11. Teste:

```txt
https://SUA-API.onrender.com/health
https://SUA-API.onrender.com/api/Firestore
```

## Frontend no Vercel

1. Entre no Vercel.
2. Importe o mesmo repositorio.
3. Configure:

```txt
Framework Preset: Vite
Root Directory: FrontEnd
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

4. Em **Environment Variables**, adicione:

```txt
VITE_API_URL=https://SUA-API.onrender.com/api
```

5. Clique em **Deploy**.
6. Copie a URL final do Vercel.

## Liberar o front na API

1. Volte no Render.
2. Abra o servico `almoxarifado-api`.
3. Va em **Environment**.
4. Troque:

```txt
Cors__AllowedOrigins__0=https://temp.vercel.app
```

por:

```txt
Cors__AllowedOrigins__0=https://SUA-URL-DO-VERCEL.vercel.app
```

5. Clique em **Save Changes**.
6. Faca **Manual Deploy > Deploy latest commit** ou aguarde o Render redeployar.

## Observacoes

- No plano gratis do Render, a API pode dormir quando ficar sem uso. A primeira chamada pode demorar.
- Nao suba `.env` nem `firebase-credentials.json` para o GitHub.
- Se `/api/Firestore` retornar erro de credenciais, gere uma nova chave JSON no Firebase e atualize `FIREBASE_CREDENTIALS_JSON` no Render.
