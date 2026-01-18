# Environment Setup Guide

This document explains how to manage development and production environments in this project.

## Overview

The project supports two environments:
- **Development (dev)**: Local Docker PostgreSQL database
- **Production (prod)**: Supabase PostgreSQL database

## Quick Start

### Switch to Development Environment

```bash
npm run env:dev
```

This copies `.env.development` to `.env` and configures the app to use the local Docker database.

### Switch to Production Environment

```bash
npm run env:prod
```

This copies `.env.production` to `.env` and configures the app to use the Supabase database.

## Environment Files

| File | Description | Git Tracked |
|------|-------------|-------------|
| `.env` | Active environment config (auto-generated) | ❌ No |
| `.env.development` | Development environment template | ❌ No |
| `.env.production` | Production environment template | ❌ No |
| `.env.example` | Example template for new developers | ✅ Yes |

## Configuration Details

### Development Environment (`.env.development`)

```bash
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dude_images?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/dude_images?schema=public"
JWT_SECRET=your-dev-secret
```

**Requirements:**
- Docker and Docker Compose installed
- PostgreSQL container running (`docker-compose up -d`)

### Production Environment (`.env.production`)

```bash
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://postgres.XXX:PASSWORD@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?schema=public&pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.XXX:PASSWORD@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"
JWT_SECRET=your-prod-secret
```

**Key Points:**
- `DATABASE_URL` uses connection pooling (`pgbouncer=true`) for better performance in production
- `DIRECT_URL` is used only for migrations (bypasses connection pooling for schema changes)
- **Always use a different JWT_SECRET in production!**
- Note: With Prisma 7, migrations automatically use `DIRECT_URL` when available via the `prisma:migrate:prod` script

## Workflow Examples

### Local Development Workflow

```bash
# 1. Switch to dev environment
npm run env:dev

# 2. Start Docker database
docker-compose up -d

# 3. Run migrations
npm run prisma:migrate:dev

# 4. Start development server
npm run start:dev

# 5. (Optional) Open Prisma Studio
npm run prisma:studio:dev
```

### Production Database Testing

```bash
# 1. Switch to prod environment
npm run env:prod

# 2. Run migrations on Supabase
npm run prisma:migrate:prod

# 3. (Optional) View production data
npm run prisma:studio:prod

# 4. Switch back to dev
npm run env:dev
```

### Deploying Migrations to Production

```bash
# Test locally first
npm run env:dev
npm run prisma:migrate:dev

# Verify everything works
npm run start:dev

# Deploy to production (automatically enables RLS on internal tables)
npm run env:prod
npm run prisma:migrate:prod
```

**Note:** `prisma:migrate:prod` now automatically runs `prisma:rls:prod` after migrations to enable Row-Level Security on Prisma internal tables (`_prisma_migrations`).

## NPM Scripts Reference

### Environment Management

| Script | Description |
|--------|-------------|
| `npm run env:dev` | Switch to development environment |
| `npm run env:prod` | Switch to production environment |

### Prisma Commands (Environment-aware)

| Script | Description |
|--------|-------------|
| `npm run prisma:migrate:dev` | Run migrations in dev environment |
| `npm run prisma:migrate:prod` | Deploy migrations to prod + auto-enable RLS |
| `npm run prisma:rls:prod` | Manually enable RLS on Prisma internal tables |
| `npm run prisma:studio:dev` | Open Prisma Studio for dev database |
| `npm run prisma:studio:prod` | Open Prisma Studio for prod database |

## Best Practices

### 🔒 Security

1. **Never commit `.env` files** (except `.env.example`)
2. **Use different JWT secrets** for dev and prod
3. **Rotate production secrets** regularly
4. **Don't share production credentials** in Slack, email, etc.

### 🚀 Development

1. **Always work in dev environment** for day-to-day development
2. **Test migrations locally** before deploying to production
3. **Use `env:dev`/`env:prod` scripts** instead of manually editing `.env`
4. **Commit changes** to `.env.example` when adding new variables

### 📦 Production Deployment

1. **Run migrations** before deploying new code
2. **Use `DIRECT_URL`** for migrations (not the pooled connection)
3. **Verify environment** before running destructive operations
4. **Keep backups** of production database

## Troubleshooting

### Issue: Prisma Client errors after switching environments

**Solution:**
```bash
# Make sure you've switched to the correct environment
npm run env:dev
# or
npm run env:prod

# Then regenerate Prisma Client
npm run prisma:generate
```

### Issue: Migrations fail with connection errors

**For development:**
```bash
# Ensure Docker container is running
docker-compose up -d

# Check container status
docker ps

# View logs
docker logs dude_images_db
```

**For production:**
```bash
# Verify Supabase credentials in .env.production
# Check that DIRECT_URL (not DATABASE_URL) is used for migrations
npm run env:prod
npm run prisma:migrate:prod
```

### Issue: Wrong database being used

**Check current environment:**
```bash
cat .env | grep DATABASE_URL
```

**Expected outputs:**
- Dev: `localhost:5432/dude_images`
- Prod: `supabase.com:5432/postgres`

### Issue: Can't connect to Supabase

**Checklist:**
1. ✅ Supabase project is active
2. ✅ Database password is correct
3. ✅ IP whitelist includes your IP (or use `0.0.0.0/0` for all IPs)
4. ✅ Connection pooling is enabled in Supabase
5. ✅ Using correct connection string from Supabase dashboard

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | Database connection URL | See examples above |
| `DIRECT_URL` | Direct database URL (for migrations) | See examples above |
| `JWT_SECRET` | Secret key for JWT tokens | Random 64+ character string |

### Supabase Connection String Format

**Pooled connection (for app runtime):**
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[REGION].pooler.supabase.com:5432/postgres?schema=public&pgbouncer=true&connection_limit=1
```

**Direct connection (for migrations):**
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[REGION].pooler.supabase.com:5432/postgres
```

**Get these from:**
Supabase Dashboard → Project Settings → Database → Connection string

## Additional Resources

- [Prisma + Supabase Guide](https://www.prisma.io/docs/guides/database/supabase)
- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [Supabase Documentation](https://supabase.com/docs)

---

**Last Updated:** 2026-01-17
**Maintained by:** Development Team
