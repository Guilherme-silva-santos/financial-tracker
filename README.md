# Gastos API

Sistema de controle de gastos do dia a dia, com foco em reduzir a fricção de registro. Além do fluxo tradicional via API/sistema, o cadastro de gastos pode ser feito através de um bot no Telegram, tornando o processo mais rápido e automatizado.

## Motivação

A maioria dos apps de controle financeiro exige muitos cliques para registrar um gasto simples, o que acaba desestimulando o uso constante. Este projeto propõe um fluxo alternativo: registrar um gasto conversando com um bot, da mesma forma que se manda uma mensagem para um amigo.

## Funcionalidades (MVP)

- **Autenticação**: cadastro e login de usuários (JWT)
- **Multi-user**: cada usuário tem seus próprios dados isolados
- **Categorias**: criação e gerenciamento de categorias de gastos
- **Gastos**: cadastro, listagem e remoção de gastos
- **Bot do Telegram**:
  - Vínculo de conta via código temporário
  - Cadastro de gasto por mensagem (descrição + valor), com seleção de categoria via botões inline
  - Consulta de gastos por comandos (`/hoje`, `/mes`, `/categoria`)

## Stack

- **Backend**: NestJS
- **Banco de dados**: PostgreSQL (via Prisma ORM)
- **Cache / estado efêmero**: Redis (usado para gerenciar o estado da conversa do bot)
- **Bot**: Telegram Bot API (via `nestjs-telegraf`)
- **Autenticação**: JWT (Passport)

## Arquitetura (visão geral)

```
[Telegram Bot API] --webhook--> [NestJS API] --Prisma--> [PostgreSQL]
                                      |
                                      +--> [Redis] (estado da conversa do bot)
                                      |
                              [Clientes HTTP] (fluxo via API/sistema)
```

## Pré-requisitos

- Node.js
- Docker e Docker Compose
- Uma conta no Telegram e um bot criado via [@BotFather](https://t.me/BotFather)
- [ngrok](https://ngrok.com/) (ou similar) para expor o webhook em ambiente de desenvolvimento

## Configuração do ambiente

1. Clone o repositório:

   ```bash
   git clone <url-do-repositorio>
   cd gastos-api
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Copie o arquivo de variáveis de ambiente de exemplo e preencha os valores:

   ```bash
   cp .env.example .env
   ```

   Variáveis principais:

   | Variável | Descrição |
   |---|---|
   | `DATABASE_URL` | String de conexão do PostgreSQL |
   | `REDIS_URL` | String de conexão do Redis |
   | `JWT_SECRET` | Chave secreta para assinatura dos tokens JWT |
   | `TELEGRAM_BOT_TOKEN` | Token do bot gerado pelo @BotFather |
   | `TELEGRAM_WEBHOOK_URL` | URL pública do webhook (ex: URL gerada pelo ngrok em dev) |

4. Suba os serviços de infraestrutura (PostgreSQL e Redis):

   ```bash
   docker compose up -d
   ```

5. Rode as migrations do Prisma:

   ```bash
   npx prisma migrate dev
   ```

6. Inicie a aplicação em modo desenvolvimento:

   ```bash
   npm run start:dev
   ```

## Configurando o bot do Telegram em desenvolvimento

1. Exponha a porta local da aplicação com o ngrok:

   ```bash
   ngrok http 3000
   ```

2. Configure a URL HTTPS gerada como webhook do bot (ou defina via `TELEGRAM_WEBHOOK_URL` e deixe a aplicação configurar automaticamente na inicialização, conforme implementado no módulo `telegram`).

3. No Telegram, converse com o bot e envie `/start <codigo>` (o código é gerado através do endpoint de vínculo de conta) para associar sua conta ao chat.

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run start:dev` | Inicia a aplicação em modo desenvolvimento (watch mode) |
| `npm run build` | Compila o projeto |
| `npm run start:prod` | Inicia a aplicação a partir do build de produção |
| `npx prisma migrate dev` | Cria e aplica migrations em desenvolvimento |
| `npx prisma studio` | Abre uma interface visual para o banco de dados |

## Documentação da API

Após subir a aplicação, a documentação Swagger fica disponível em:

```
http://localhost:3000/api
```

## Roadmap

- [ ] Categorização automática de gastos
- [ ] Dashboard com gráficos e relatórios
- [ ] Edição/remoção de gastos via bot
- [ ] Suporte a múltiplos idiomas
- [ ] Integração com Open Finance

## Licença

Projeto pessoal em desenvolvimento.