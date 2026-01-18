# Quick Setup Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- Docker & Docker Compose (for local dev)
- Supabase account (for production)

### Initial Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up development environment**
   ```bash
   # Copy development config
   npm run env:dev

   # Start local PostgreSQL
   docker-compose up -d

   # Run migrations
   npm run prisma:migrate:dev

   # Generate Prisma Client
   npm run prisma:generate
   ```

3. **Start development server**
   ```bash
   npm run start:dev
   ```

4. **Access the API**
   - API Base: `http://localhost:3001/api/v1`
   - Swagger Docs: `http://localhost:3001/api`

## 🔄 Switching Environments

### Development (Local Docker)
```bash
npm run env:dev
npm run start:dev
```

### Production (Supabase)
```bash
npm run env:prod
npm run start:prod
```

## 🗄️ Database Management

### Development
```bash
# Create new migration
npm run prisma:migrate:dev

# Open Prisma Studio
npm run prisma:studio:dev
```

### Production
```bash
# Deploy migrations to Supabase (auto-enables RLS on internal tables)
npm run prisma:migrate:prod

# Manually enable RLS if needed
npm run prisma:rls:prod

# View production data (careful!)
npm run prisma:studio:prod
```

**Note:** Migrations now automatically secure Prisma internal tables with Row-Level Security.

## 📝 Environment Files

| File | Purpose | Tracked |
|------|---------|---------|
| `.env` | Active config (auto-generated) | ❌ |
| `.env.development` | Dev template | ❌ |
| `.env.production` | Prod template | ❌ |
| `.env.example` | Example for new devs | ✅ |

## ⚙️ Configuration

### Development (.env.development)
- Uses local Docker PostgreSQL
- Port: 3001
- Database: `dude_images`

### Production (.env.production)
- Uses Supabase PostgreSQL
- Connection pooling enabled
- Separate direct URL for migrations

## 🔐 Security Notes

1. **Never commit** `.env*` files (except `.env.example`)
2. **Use different JWT secrets** for dev and prod
3. **Rotate production secrets** regularly
4. **Test migrations locally** before deploying

## 📚 More Info

See [ENVIRONMENTS.md](./ENVIRONMENTS.md) for detailed documentation.

## 🆘 Quick Troubleshooting

**Database connection failed?**
```bash
# Check Docker is running
docker ps

# Restart PostgreSQL
docker-compose restart
```

**Wrong environment?**
```bash
# Check current env
cat .env | grep DATABASE_URL

# Switch to dev
npm run env:dev
```

**Prisma Client out of sync?**
```bash
npm run prisma:generate
```

## 🎯 Common Workflows

### Adding a new feature
```bash
npm run env:dev
npm run start:dev
# Make changes...
npm run prisma:migrate:dev  # if schema changes
npm test
```

### Deploying to production
```bash
# Test locally first
npm run env:dev
npm test

# Deploy migrations
npm run env:prod
npm run prisma:migrate:prod

# Deploy app (hosting platform specific)
npm run build
npm run start:prod
```

---

**Need help?** Check [CLAUDE.md](./CLAUDE.md) for detailed development guide.
