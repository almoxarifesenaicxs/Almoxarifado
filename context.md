# Contexto do Projeto - Almoxarifado SENAI

Este documento serve como mapa rapido do projeto para desenvolvimento, manutencao e deploy. Ele nao deve conter chaves privadas, `.env` real ou credenciais Firebase.

## Visao Geral

O sistema e uma aplicacao de almoxarifado para registrar demandas, acompanhar fila operacional, gerenciar compras, checklists, usuarios, notificacoes e relatorios.

A arquitetura esta dividida em:

- `AlmoxarifadoSenai.Api`: API ASP.NET Core 8.
- `FrontEnd`: aplicacao React + Vite + TypeScript.
- Firebase/Firestore: banco principal da aplicacao.
- Firebase Storage ou armazenamento equivalente: usado para anexos quando configurado pela API.
- Render: hospedagem da API.
- Vercel: hospedagem do frontend.

## Tecnologias

Backend:

- ASP.NET Core 8.
- JWT Bearer para autenticacao.
- Google Cloud Firestore.
- Swagger em ambiente de desenvolvimento.
- Health check em `/health`.

Frontend:

- React.
- TypeScript.
- Vite.
- Axios.
- React Router.
- React Icons.
- Recharts.

## Estrutura Principal

```txt
Almoxarifado/
  AlmoxarifadoSenai.Api/
    Controllers/
    DTOs/
    Models/
    Services/
    Program.cs
    appsettings.json
    .env.example

  FrontEnd/
    src/
      components/
      pages/
      routes/
      services/
      types/
    package.json
    .env.example
    .env.production

  DEPLOY.md
  context.md
```

## Backend

Arquivo de entrada:

- `AlmoxarifadoSenai.Api/Program.cs`

Responsabilidades principais:

- Carregar `.env` local quando existir.
- Configurar credenciais Firebase por `FIREBASE_CREDENTIALS_JSON` em producao.
- Configurar CORS para o frontend.
- Registrar `FirestoreService`, `StorageService` e `JwtService`.
- Configurar autenticacao JWT.
- Mapear controllers e `/health`.

Controllers principais:

- `AuthController`: login, primeiro acesso e recuperacao de acesso.
- `UsuariosController`: cadastro, listagem, edicao, inativacao e exclusao de usuarios.
- `DemandasController`: criacao, listagem, detalhes, status, duplicacao e exclusao de demandas.
- `SolicitacoesCompraController`: fluxo de compras.
- `ChecklistsController`: modelos de checklist, execucao e historico.
- `NotificacoesController`: notificacoes e contador de nao lidas.
- `AnexosController`: upload, listagem, download e exclusao de anexos.
- `DashboardController`: indicadores, relatorio, SLA e operacao gerencial.
- `HistoricoController`: historico de demandas.
- `FirestoreController`: rota simples de teste da conexao Firestore.

## Frontend

Arquivo de rotas:

- `FrontEnd/src/routes/AppRoutes.tsx`

Servico base da API:

- `FrontEnd/src/services/api.ts`

O frontend usa `VITE_API_URL` como base da API. Em producao, o valor esperado e:

```txt
VITE_API_URL=https://sua-api.onrender.com/api
```

O token JWT fica no `localStorage` em:

```txt
@senai:token
```

O usuario logado fica no `localStorage` em:

```txt
@senai:user
```

O Axios adiciona automaticamente:

```txt
Authorization: Bearer TOKEN
```

## Perfis de Usuario

Perfis usados atualmente:

- `Admin`
- `Coordenador`
- `Almoxarifado`
- `Professor`

Observacao importante:

- O backend ainda aceita `Almoxarife` em algumas rotas por compatibilidade com dados antigos.
- Na criacao/edicao de usuario pelo frontend, a opcao correta e `Almoxarifado`, nao `Almoxarife`.

Permissoes gerais:

- `Admin`: acesso amplo, incluindo usuarios e exclusoes.
- `Coordenador`: gestao, relatorios, compras e usuarios.
- `Almoxarifado`: fila operacional, compras e checklists.
- `Professor`: abertura e acompanhamento de demandas.

## Fluxo de Login e Primeiro Acesso

O login usa:

- `matricula`
- `dataNascimento`

Endpoint:

```txt
POST /api/Auth/login
```

Quando o usuario foi criado pelo coordenador/admin sem e-mail, a API retorna:

```txt
precisaCompletarCadastro: true
```

Nesse caso, o frontend redireciona para:

```txt
/primeiro-acesso
```

O usuario completa:

- e-mail
- telefone
- setor

Endpoint:

```txt
POST /api/Auth/completar-cadastro
```

Depois disso, `PrimeiroAcesso` passa para `false` no Firestore.

## Recuperacao de Acesso

Tela:

```txt
/recuperar-acesso
```

Endpoint:

```txt
POST /api/Auth/recuperar-acesso
```

Entrada:

- matricula ou e-mail

Comportamento atual:

- Se encontrar usuario ativo com e-mail, retorna uma mensagem orientando o acesso.
- Se o usuario ainda nao tiver e-mail, orienta fazer login pela matricula e completar o primeiro acesso.

Importante:

- Atualmente a recuperacao localiza o acesso e retorna orientacao. Ela nao envia e-mail real por SMTP.
- Para producao completa, o proximo passo seria ligar `EmailService` a um provedor real, como SendGrid, Resend, SMTP institucional ou Firebase Extension.

## Demandas

Telas principais:

- `/nova-demanda`
- `/demandas`
- `/demandas/detalhes/:id`
- `/almoxarifado`

Fluxo esperado:

1. Professor abre uma demanda.
2. Almoxarifado acompanha na fila operacional.
3. Almoxarifado altera status.
4. Coordenador/Admin acompanham por dashboards e relatorios.

Status usados:

- `Aberta`
- `Em Andamento`
- `Aguardando Material`
- `Concluida`
- `Cancelada`

Observacao:

- Alguns textos antigos podem aparecer com acento diferente se vierem de dados antigos do Firestore. O codigo tenta normalizar status em pontos sensiveis.

## Compras

Telas principais:

- `/compras`
- `/compras/nova`
- `/compras/detalhes/:id`

Uso esperado:

- Almoxarifado/Admin criam solicitacoes.
- Coordenador/Admin acompanham e alteram status.

## Checklists

Telas principais:

- `/checklists`
- `/checklists/execucao/:id`
- `/checklists/historico`
- `/checklists/visualizar/:id`

Comportamento:

- A tela de modelos busca checklists reais da API.
- Os indicadores usam os modelos e execucoes retornados pelo backend.
- Checklists inativos nao devem ser executados.
- Admin pode excluir.
- Almoxarifado/Admin podem criar, editar, duplicar, ativar/inativar e executar.
- Coordenador pode consultar historico e visualizacao, quando permitido pela rota.

Endpoints:

```txt
GET    /api/Checklists
POST   /api/Checklists
GET    /api/Checklists/{id}
PUT    /api/Checklists/{id}
DELETE /api/Checklists/{id}
POST   /api/Checklists/{id}/duplicar
POST   /api/Checklists/executar
GET    /api/Checklists/execucoes
```

## Notificacoes

Tela:

```txt
/notificacoes
```

Endpoints:

```txt
GET /api/Notificacoes
GET /api/Notificacoes/nao-lidas/contador
PUT /api/Notificacoes/{id}/marcar-lida
PUT /api/Notificacoes/marcar-todas-lidas
```

Ponto de atencao:

- Consultas Firestore com multiplos filtros e ordenacao podem exigir indice composto.
- Quando possivel, a API deve evitar queries que dependam de indice extra ou ordenar em memoria para reduzir erro em producao.

## Anexos

Endpoints:

```txt
POST   /api/Anexos/upload
GET    /api/Anexos/demanda/{demandaId}
GET    /api/Anexos/{id}/download
DELETE /api/Anexos/{id}
```

Pontos de atencao:

- O frontend deve sempre consumir anexos via API.
- Nao usar caminho local em producao.
- Se upload/download falhar em producao, verificar configuracao Firebase/Storage e variaveis de ambiente no Render.

## Relatorios

Tela:

```txt
/relatorios
```

Funcionalidades:

- Indicadores por periodo.
- Distribuicao por oficina.
- Prioridades.
- Lista de demandas recentes.
- Exportacao `.txt`.
- Exportacao `.csv`.

O CSV usa separador `;`, melhor para Excel em ambiente pt-BR.

## Variaveis de Ambiente

API local/producao:

```txt
ASPNETCORE_ENVIRONMENT=Production
Jwt__Key=troque-por-uma-chave-forte-com-pelo-menos-32-caracteres
Jwt__Issuer=AlmoxarifadoAPI
Jwt__Audience=AlmoxarifadoUsuarios
Jwt__DurationInMinutes=60
Firebase__ProjectId=almoxarifadosenaicxs
Cors__AllowedOrigins__0=https://seu-front.vercel.app
FIREBASE_CREDENTIALS_JSON={"type":"service_account","project_id":"..."}
```

Frontend:

```txt
VITE_API_URL=https://sua-api.onrender.com/api
```

Nunca subir:

- `.env`
- `firebase-credentials.json`
- JSON de service account do Firebase
- chaves privadas

## Deploy

Ordem correta:

1. Subir API no Render.
2. Testar `/health`.
3. Testar rota Firestore.
4. Subir frontend no Vercel.
5. Voltar no Render e liberar a URL final da Vercel no CORS.
6. Fazer redeploy da API.
7. Testar login e telas principais em producao.

API no Render:

```txt
Runtime: Docker
Branch: main ou develop, conforme ambiente desejado
Root Directory: vazio
Dockerfile Path: ./Dockerfile
Instance Type: Free
```

Frontend no Vercel:

```txt
Framework Preset: Vite
Root Directory: FrontEnd
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

## Comandos de Desenvolvimento

Frontend:

```bash
cd FrontEnd
npm install
npm run dev
npm run lint
npm run build
```

Backend:

```bash
dotnet restore AlmoxarifadoSenai.Api/AlmoxarifadoSenai.Api.csproj
dotnet build AlmoxarifadoSenai.Api/AlmoxarifadoSenai.Api.csproj
dotnet run --project AlmoxarifadoSenai.Api/AlmoxarifadoSenai.Api.csproj
```

Teste rapido da API:

```txt
GET http://localhost:porta/health
GET http://localhost:porta/api/Firestore
```

## Checklist Antes de Subir

- `npm run lint`
- `npm run build`
- `dotnet build AlmoxarifadoSenai.Api/AlmoxarifadoSenai.Api.csproj`
- Verificar se `.env` nao esta no Git.
- Verificar se `firebase-credentials.json` nao esta no Git.
- Verificar se `VITE_API_URL` aponta para API do Render.
- Verificar se `Cors__AllowedOrigins__0` aponta para URL da Vercel.
- Testar login com usuario real do Firestore.
- Testar primeiro acesso com usuario sem e-mail.
- Testar criacao/listagem de demanda.
- Testar fila do almoxarifado.
- Testar compras.
- Testar checklists.
- Testar notificacoes.
- Testar exportacao CSV dos relatorios.

## Pontos de Atencao Tecnicos

- Render gratuito pode "dormir". A primeira chamada pode demorar.
- Firestore diferencia nomes de campos e capitalizacao. O backend tenta mapear campos antigos e novos em usuarios.
- Alguns registros antigos podem ter perfil `Almoxarife`; o sistema preserva compatibilidade.
- A recuperacao de acesso ainda nao envia e-mail real.
- O `EmailService` atualmente pode compilar com warning por metodo async sem await.
- Evitar mocks no frontend. Dados operacionais devem vir da API.
- Evitar mensagens como "API nao conectada" para usuario final; preferir mensagens profissionais e orientadas a acao.

## Branches

Uso atual recomendado:

- `main`: producao estavel.
- `develop`: validacao e homologacao antes de ir para producao.

Ao finalizar alteracoes:

```bash
git status
git add .
git commit -m "mensagem objetiva"
git push origin develop
```

Para producao, abrir PR ou merge de `develop` para `main` quando estiver validado.

