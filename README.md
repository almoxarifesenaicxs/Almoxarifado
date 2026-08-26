# Almoxarifado SENAI

Sistema web para gerenciamento de demandas, compras, checklists e atividades de almoxarifado do SENAI. A aplicação oferece painéis e fluxos diferentes conforme o perfil do usuário, com autenticação via JWT, persistência no Google Cloud Firestore e uma interface responsiva com suporte a tema claro e escuro.

## Funcionalidades

- Autenticação e primeiro acesso por matrícula;
- controle de acesso baseado em perfis;
- cadastro e administração de usuários;
- criação, acompanhamento, edição e duplicação de demandas;
- atualização de status e priorização de atendimentos;
- gerenciamento de solicitações de compra;
- criação e execução de checklists;
- upload e download de anexos;
- histórico das demandas;
- central de notificações com lixeira;
- dashboard, relatórios e indicadores de SLA;
- recuperação de acesso por e-mail;
- interface responsiva com temas claro e escuro.

## Perfis de acesso

O sistema possui os seguintes perfis:

- `Desenvolvedor`;
- `Admin`;
- `Coordenador`;
- `Professor`;
- `Almoxarife`;
- `Almoxarifado`.

As permissões são validadas na API por meio de roles do JWT. O frontend também utiliza essas informações para controlar a exibição de páginas e itens do menu.

## Tecnologias

### Backend

- .NET 8;
- ASP.NET Core Web API;
- Google Cloud Firestore;
- JWT Bearer Authentication;
- Swagger/OpenAPI;
- SMTP para envio de e-mails.

### Frontend

- React 19;
- TypeScript;
- Vite;
- React Router;
- Axios;
- Recharts;
- React Icons;
- CSS responsivo.

### Infraestrutura

- Docker;
- Render para a API;
- Vercel para o frontend;
- Firebase/Google Cloud para persistência.

## Arquitetura

```text
Frontend React
    |
    | HTTP/JSON + JWT
    v
ASP.NET Core Controllers
    |
    v
Serviços da aplicação
    |
    +-- Firestore
    +-- armazenamento de anexos
    +-- SMTP
    +-- geração de JWT
```

A API está organizada em `Controllers`, `DTOs`, `Models`, `Services` e `Constants`. No frontend, as responsabilidades estão separadas entre `pages`, `components`, `routes`, `services`, `styles` e `types`.

## Estrutura do projeto

```text
Almoxarifado/
|-- AlmoxarifadoSenai.Api/
|   |-- Constants/
|   |-- Controllers/
|   |-- DTOs/
|   |-- Models/
|   |-- Services/
|   |-- Program.cs
|   `-- appsettings.json
|-- FrontEnd/
|   |-- public/
|   `-- src/
|       |-- components/
|       |-- pages/
|       |-- routes/
|       |-- services/
|       |-- styles/
|       `-- types/
|-- Dockerfile
|-- DEPLOY.md
`-- SENAI_PROJETO.sln
```

## Pré-requisitos

Antes de iniciar, instale:

- [.NET SDK 8](https://dotnet.microsoft.com/download/dotnet/8.0);
- [Node.js](https://nodejs.org/) com npm;
- um projeto no Firebase com o Firestore habilitado;
- uma chave de service account do Firebase.

## Configuração local

### 1. Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd Almoxarifado
```

### 2. Configure a API

Entre na pasta da API e crie o arquivo `.env` a partir do exemplo:

```bash
cd AlmoxarifadoSenai.Api
cp .env.example .env
```

No PowerShell, o último comando pode ser substituído por:

```powershell
Copy-Item .env.example .env
```

Configure pelo menos estas variáveis:

```env
ASPNETCORE_ENVIRONMENT=Development
Jwt__Key=uma-chave-forte-com-pelo-menos-32-caracteres
Jwt__Issuer=AlmoxarifadoAPI
Jwt__Audience=AlmoxarifadoUsuarios
Jwt__DurationInMinutes=60
Firebase__ProjectId=seu-id-do-projeto
Cors__AllowedOrigins__0=http://localhost:5173
```

Para autenticar no Firebase localmente, coloque a chave da service account em:

```text
AlmoxarifadoSenai.Api/firebase-credentials.json
```

Como alternativa, defina todo o conteúdo compactado do JSON em `FIREBASE_CREDENTIALS_JSON`.

Para habilitar a recuperação de acesso por e-mail, configure também:

```env
Email__SmtpHost=smtp.seu-provedor.com
Email__SmtpPort=587
Email__SmtpUser=seu-usuario
Email__SmtpPass=sua-senha-ou-token
Email__FromEmail=nao-responda@seudominio.com
Email__FromName=Sistema Almoxarifado SENAI
Email__EnableSsl=true
```

### 3. Execute a API

A partir da raiz do repositório:

```bash
dotnet restore SENAI_PROJETO.sln
dotnet run --project AlmoxarifadoSenai.Api/AlmoxarifadoSenai.Api.csproj
```

A API ficará disponível em:

```text
http://localhost:5000
```

Em ambiente de desenvolvimento, a documentação Swagger pode ser acessada em:

```text
http://localhost:5000/swagger
```

O health check geral está disponível em:

```text
http://localhost:5000/health
```

### 4. Configure e execute o frontend

Em outro terminal:

```bash
cd FrontEnd
npm install
```

Crie um arquivo `.env` com:

```env
VITE_API_URL=http://localhost:5000/api
```

Depois, inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A interface ficará disponível em:

```text
http://localhost:5173
```

## Scripts e comandos úteis

### Backend

```bash
dotnet build SENAI_PROJETO.sln
dotnet run --project AlmoxarifadoSenai.Api/AlmoxarifadoSenai.Api.csproj
```

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Principais rotas da API

| Recurso | Caminho base | Responsabilidade |
| --- | --- | --- |
| Autenticação | `/api/Auth` | Login, primeiro acesso e recuperação de acesso |
| Usuários | `/api/Usuarios` | Administração dos usuários |
| Demandas | `/api/Demandas` | Ciclo de vida das demandas |
| Anexos | `/api/Anexos` | Upload, download e exclusão de arquivos |
| Compras | `/api/SolicitacoesCompra` | Solicitações e atualização de compras |
| Checklists | `/api/Checklists` | Modelos, execução e histórico |
| Notificações | `/api/Notificacoes` | Leitura, lixeira e restauração |
| Histórico | `/api/Historico` | Auditoria de alterações em demandas |
| Dashboard | `/api/Dashboard` | Indicadores, relatórios e SLA |

As rotas protegidas esperam o token no cabeçalho:

```http
Authorization: Bearer SEU_TOKEN_JWT
```

## Build com Docker

Na raiz do projeto:

```bash
docker build -t almoxarifado-senai-api .
docker run --rm -p 8080:8080 --env-file AlmoxarifadoSenai.Api/.env almoxarifado-senai-api
```

Ao usar Docker, forneça as credenciais do Firebase pela variável `FIREBASE_CREDENTIALS_JSON`. Não copie a chave para a imagem.

## Deploy

O fluxo atualmente preparado utiliza:

- Render para a API, por meio do `Dockerfile`;
- Vercel para a aplicação React;
- variáveis de ambiente para JWT, Firebase, CORS e SMTP.

As instruções completas estão em [DEPLOY.md](./DEPLOY.md).

## Segurança

Nunca envie ao repositório:

- `.env`;
- `firebase-credentials.json`;
- senhas SMTP;
- chaves JWT;
- tokens de serviços externos.

Esses arquivos já estão previstos no `.gitignore`, mas isso não protege credenciais que tenham sido adicionadas ao histórico anteriormente. Se uma chave real tiver sido publicada ou compartilhada, revogue-a no provedor e gere outra imediatamente.

Use valores exclusivos e fortes em produção. Não mantenha as chaves de exemplo presentes nos arquivos de configuração.

## Licença

Este projeto ainda não possui uma licença definida. Antes de distribuir ou reutilizar o código publicamente, adicione um arquivo `LICENSE` compatível com os objetivos do projeto.
