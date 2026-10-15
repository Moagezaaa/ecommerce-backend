# Ecommerce Backend

A production-oriented ecommerce REST API built with TypeScript, Express,
PostgreSQL, Redis, object-oriented design, and Clean Architecture.

The API currently supports authentication, catalog management, carts, orders,
inventory updates, Stripe payment intents, product reviews, and admin product
controls.

## Contents

- [Features](#features)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Database](#database)
- [API reference](#api-reference)
- [Development commands](#development-commands)
- [Security](#security)
- [GitHub workflow](#github-workflow)

## Features

- JWT authentication with password hashing
- Role-based authorization for admin operations
- Product and category catalog
- Shopping carts
- Transaction-safe order creation
- Stock validation and inventory movements
- Stripe PaymentIntent integration
- Product reviews
- PostgreSQL persistence with migrations
- Redis connection for caching infrastructure
- Centralized request validation and error handling
- Strict TypeScript, ESLint, and Prettier

## Architecture

The project follows Clean Architecture. Dependencies point inward: domain code
does not depend on Express, PostgreSQL, Redis, or Stripe.

```text
src/
├── domain/          # Entities and business concepts
├── application/     # Use cases, DTOs, and repository ports
├── infrastructure/  # PostgreSQL, Redis, JWT, crypto, and Stripe adapters
├── presentation/    # Express routes, controllers, middleware, and validation
└── config/          # Validated runtime configuration

database/
├── migrations/      # Versioned PostgreSQL schema
└── migrate.mjs      # Idempotent migration runner
```

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- PostgreSQL 16 or newer
- Redis 7 or newer
- Stripe test account for payment-intent development

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Install PostgreSQL on Ubuntu

Skip this step if PostgreSQL is already installed:

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

Create the application database and user:

```bash
sudo -u postgres psql -c "CREATE USER ecommerce WITH PASSWORD 'ecommerce';"
sudo -u postgres psql -c "CREATE DATABASE ecommerce OWNER ecommerce;"
```

If either object already exists, PostgreSQL will report it and the existing
object can be used.

### 3. Start services

```bash
sudo systemctl start postgresql
sudo systemctl start redis-server
```

Verify both services:

```bash
pg_isready -h localhost -p 5432
redis-cli ping
```

Expected Redis output:

```text
PONG
```

### 4. Configure the environment

```bash
cp .env.example .env
```

Edit `.env` and replace every placeholder. Generate a JWT secret with:

```bash
openssl rand -hex 32
```

### 5. Apply database migrations

```bash
npm run db:migrate
```

### 6. Start the API

Development mode with hot reload:

```bash
npm run dev
```

The API listens on `http://localhost:3000` by default.

## Environment variables

| Variable                | Required | Description                              |
| ----------------------- | -------- | ---------------------------------------- |
| `NODE_ENV`              | No       | `development`, `test`, or `production`   |
| `PORT`                  | No       | HTTP port; defaults to `3000`            |
| `DATABASE_URL`          | Yes      | PostgreSQL connection string             |
| `REDIS_URL`             | Yes      | Redis connection string                  |
| `JWT_SECRET`            | Yes      | Secret used to sign bearer tokens        |
| `STRIPE_SECRET_KEY`     | No       | Stripe test secret for payment intents   |
| `STRIPE_WEBHOOK_SECRET` | No       | Reserved for Stripe webhook verification |

Never commit `.env` or real credentials. Use `.env.example` as the shareable
configuration template.

## API reference

All request bodies use JSON. Protected endpoints require:

```http
Authorization: Bearer <jwt-token>
```

### Public endpoints

| Method | Endpoint                          | Description                              |
| ------ | --------------------------------- | ---------------------------------------- |
| `GET`  | `/`                               | Returns API status                       |
| `POST` | `/auth/register`                  | Creates a user and returns a token       |
| `POST` | `/auth/login`                     | Authenticates a user and returns a token |
| `GET`  | `/products`                       | Lists products                           |
| `POST` | `/products`                       | Creates a product                        |
| `GET`  | `/categories`                     | Lists categories                         |
| `POST` | `/categories`                     | Creates a category                       |
| `GET`  | `/products/:productId/reviews`    | Lists product reviews                    |
| `POST` | `/orders/:orderId/payment-intent` | Creates a Stripe PaymentIntent           |

### Authenticated endpoints

| Method | Endpoint                       | Description                     |
| ------ | ------------------------------ | ------------------------------- |
| `GET`  | `/auth/me`                     | Returns the current user        |
| `GET`  | `/cart/items`                  | Returns the current user's cart |
| `POST` | `/cart/items`                  | Adds a product to the cart      |
| `POST` | `/orders`                      | Creates an order from the cart  |
| `GET`  | `/orders`                      | Lists the current user's orders |
| `POST` | `/products/:productId/reviews` | Creates a product review        |

### Admin endpoints

Admin endpoints require a user with the `admin` role:

| Method  | Endpoint                              | Description                     |
| ------- | ------------------------------------- | ------------------------------- |
| `PATCH` | `/admin/products/:productId/status`   | Updates product active status   |
| `PATCH` | `/admin/products/:productId/approval` | Alias for product status update |

Example registration:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "customer@example.com",
    "password": "correct horse battery staple",
    "firstName": "Jane",
    "lastName": "Doe"
  }'
```

Use the returned token:

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer <token>"
```

When Stripe is not configured, the payment-intent endpoint returns `503`
instead of silently pretending that a payment was created.

## Database

Schema migrations are applied in filename order:

1. `001-create-users.sql`
2. `002-create-products.sql`
3. `003-create-commerce-schema.sql`

Run them through the migration runner:

```bash
npm run db:migrate
```

The schema includes users, roles, categories, products, product images,
inventory movements, carts, orders, payments, coupons, and reviews.

## Development commands

| Command                | Purpose                               |
| ---------------------- | ------------------------------------- |
| `npm run dev`          | Start the API with hot reload         |
| `npm run build`        | Compile TypeScript into `dist`        |
| `npm start`            | Run the compiled application          |
| `npm run db:migrate`   | Apply pending database migrations     |
| `npm run typecheck`    | Run TypeScript without emitting files |
| `npm run lint`         | Run ESLint                            |
| `npm run format`       | Format the repository                 |
| `npm run format:check` | Verify Prettier formatting            |

Before opening a pull request, run:

```bash
npm run lint
npm run typecheck
npm run format:check
npm run build
```

## Security

- Do not commit `.env`, passwords, JWT secrets, or Stripe credentials.
- Use Stripe test keys during development.
- Passwords are stored as hashes, never as plaintext.
- Use parameterized SQL queries.
- Keep `JWT_SECRET` long, random, and different per environment.
- Do not expose database or Redis ports publicly in production.

## GitHub workflow

The repository remote is:

```text
git@github.com:Moagezaaa/ecommerce-backend.git
```

Check that `.env` is ignored before staging:

```bash
git check-ignore .env
git status
```

Commit and push:

```bash
git add .
git diff --cached --check
git commit -m "Build ecommerce backend"
git push -u origin main
```

Clone the project elsewhere:

```bash
git clone git@github.com:Moagezaaa/ecommerce-backend.git
cd ecommerce-backend
npm install
cp .env.example .env
```
