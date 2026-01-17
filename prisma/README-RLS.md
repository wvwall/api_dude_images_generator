# Row-Level Security (RLS) for Prisma + Supabase

## 🔒 Why RLS Isn't Automatic

### The Problem
When using Prisma with Supabase, Prisma creates internal tables like `_prisma_migrations` that are exposed via Supabase's REST API **without Row-Level Security (RLS)** enabled by default.

### Why This Happens

1. **Prisma is DB-agnostic** - It doesn't know about Supabase-specific features like RLS
2. **Backwards compatibility** - Supabase doesn't enable RLS automatically to avoid breaking existing apps
3. **Different architectures** - Server-side apps (like NestJS) don't always need RLS since they connect with privileged credentials

### The Risk
Without RLS, anyone with your Supabase `anon` API key could potentially:
- Read your migration history
- See internal database metadata
- Access other unprotected tables

---

## ✅ Our Solution: Automatic RLS Script

We've automated RLS enablement with a post-migration script.

### What It Does

The file `prisma/enable-rls.sql` automatically:
1. ✅ Enables Row-Level Security on `_prisma_migrations`
2. ✅ Revokes access from `PUBLIC`, `anon`, and `authenticated` roles
3. ✅ Leaves access for `postgres` role (your server) intact

### How It Works

```bash
# When you run migrations on production:
npm run prisma:migrate:prod

# It automatically:
# 1. Deploys migrations (using DIRECT_URL)
# 2. Runs enable-rls.sql to secure internal tables
```

### Manual Execution

If you need to run it separately:

```bash
npm run prisma:rls:prod
```

---

## 🎯 What Gets Protected

| Table | Protected | Access |
|-------|-----------|--------|
| `_prisma_migrations` | ✅ Yes | Server only |
| `images` | ⚠️ Manual | Configure your own RLS |
| `users` | ⚠️ Manual | Configure your own RLS |
| `assets` | ⚠️ Manual | Configure your own RLS |

**Important:** This script only protects Prisma's internal tables. You must still configure RLS policies for your application tables (`images`, `users`, `assets`) based on your business logic.

---

## 🔐 Access Control After RLS

### ✅ Who Can Access `_prisma_migrations`

1. **Your NestJS server** - Uses `postgres` role (bypasses RLS)
2. **Database owner** - Full access via direct connection
3. **Supabase Dashboard** - You can still view/manage via UI

### ❌ Who Cannot Access

1. **REST API clients** - Using `anon` or `authenticated` keys
2. **Browser/mobile apps** - Connecting via Supabase client libraries
3. **GraphQL queries** - Via PostgREST

---

## 🧪 Testing RLS Protection

### Test 1: Verify RLS is Enabled

```bash
npm run env:prod
npm run prisma:studio:prod
# Check if _prisma_migrations is visible (it should be)
```

### Test 2: Try REST API Access (Should Fail)

```bash
curl https://YOUR_PROJECT.supabase.co/rest/v1/_prisma_migrations \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Expected: 403 Forbidden or empty result
```

### Test 3: Migrations Still Work

```bash
npm run prisma:migrate:prod
# Expected: Migrations deploy successfully
```

---

## 📋 Customizing the Script

Edit `prisma/enable-rls.sql` to protect additional tables:

```sql
-- Example: Protect a custom metadata table
ALTER TABLE IF EXISTS public.my_internal_table
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.my_internal_table FROM PUBLIC;
REVOKE ALL ON public.my_internal_table FROM anon;
REVOKE ALL ON public.my_internal_table FROM authenticated;
```

---

## 🚨 Troubleshooting

### Issue: Migrations fail after enabling RLS

**Cause:** Using pooled connection URL for migrations

**Solution:** Ensure `prisma:migrate:prod` uses `DIRECT_URL` (already configured in package.json)

### Issue: Can't see tables in Prisma Studio

**Cause:** Using wrong connection string

**Solution:** Run `npm run prisma:studio:prod` (uses correct credentials)

### Issue: Need to disable RLS temporarily

```sql
-- In Supabase SQL Editor:
ALTER TABLE public._prisma_migrations DISABLE ROW LEVEL SECURITY;
```

---

## 📚 Learn More

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Prisma + Supabase Guide](https://www.prisma.io/docs/guides/database/supabase)
- [PostgreSQL RLS Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

**Last Updated:** 2026-01-17
