# KPI Advertising Anka — Social Media Workbench

All-in-one social media management app untuk social media specialist. **Tanpa fitur AI.**

## Fitur

- **Content Calendar** — jadwal post per platform (bulanan)
- **Composer** — buat post multi-platform, character limit checker, pilih media, draft/schedule
- **Posts** — daftar & detail post, publish manual, hapus
- **Media Library** — upload gambar/video ke Supabase Storage, cari, hapus
- **Social Accounts** — connect/disconnect akun (Meta: Instagram & Facebook fully implemented; platform lain stub)
- **Analytics** — agregasi likes/comments/shares/reach/impressions + sync dari platform
- **Unified Inbox** — komentar/DM dari semua platform (stub siap dikembangkan)
- **Reports** — generate CSV report per periode, simpan ke Storage
- **Scheduled Publishing** — Vercel Cron tiap menit memproses post yang jatuh tempo

## Tech Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Prisma 6 · PostgreSQL (Supabase) · Supabase Auth/Storage · Vercel

## Setup

### 1. Install

```bash
npm install
```

### 2. Supabase

1. Buat project di [supabase.com](https://supabase.com).
2. Ambil `Project URL`, `anon key`, `service_role key`.
3. Ambil connection string Postgres (Settings → Database):
   - `DATABASE_URL` → pooler port `6543` (tambahkan `?pgbouncer=true`)
   - `DIRECT_URL` → direct port `5432`
4. Buat Storage bucket (public):
   - `media`
   - `reports`

### 3. Environment

Copy `.env.example` → `.env.local`, isi:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=...
DIRECT_URL=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENCRYPTION_KEY=...   # 64 hex chars (32 bytes). Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
CRON_SECRET=...
```

### 4. Database

```bash
npm run db:push       # sync schema ke Supabase
npm run db:generate   # generate Prisma client
```

### 5. Jalankan

```bash
npm run dev
```

Buka http://localhost:3000 → daftar akun → login.

## Meta (Instagram/Facebook) OAuth

1. Buat app di [Meta for Developers](https://developers.facebook.com/).
2. Tambahkan produk Facebook Login & Instagram Basic Display / Graph.
3. Set Valid OAuth Redirect URI:
   `http://localhost:3000/api/oauth/instagram/callback`
   `http://localhost:3000/api/oauth/facebook/callback`
4. Isi `META_APP_ID` & `META_APP_SECRET`.

## Deploy (Vercel)

1. Push ke GitHub, import ke Vercel.
2. Tambahkan semua env vars.
3. `vercel.json` sudah berisi cron `/api/cron/publish` tiap menit. Set `CRON_SECRET` dan header otorisasi cron (Vercel mengirim `Authorization: Bearer <CRON_SECRET>` bila dikonfigurasi).

## Struktur

```
src/
  app/
    (dashboard)/          # halaman app (calendar, composer, media, dll)
    api/                  # route handlers (posts, media, oauth, cron, reports)
    login, register
  components/
    features/             # komponen fitur
    layout/               # sidebar
    ui/                   # shadcn
  lib/
    platforms/            # adapter pattern (meta.ts, stub.ts, types.ts)
    supabase/             # client, server, admin
    auth.ts, prisma.ts, crypto.ts
prisma/schema.prisma
```

## Menambah platform baru

Implement `PlatformAdapter` di `src/lib/platforms/` mengikuti `meta.ts`, lalu daftarkan di `src/lib/platforms/index.ts`. Setelah itu OAuth route `/api/oauth/[platform]/*` otomatis memakainya.

## Catatan

- Token akses disimpan terenkripsi (AES-256-GCM) via `src/lib/crypto.ts`.
- Instagram publishing butuh media container flow — implementasi disederhanakan di `meta.ts` (TODO).
- Platform selain Meta masih stub dan akan menampilkan error "not implemented".
