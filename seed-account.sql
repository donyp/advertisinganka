-- ============================================================
-- Buat akun manual di Supabase Auth
-- Password default: Password123!   (GANTI setelah login pertama)
-- Jalankan di: Supabase Dashboard -> SQL Editor
-- ============================================================

-- 0) Bersihkan baris yang gagal dari percobaan sebelumnya (aman)
DELETE FROM auth.identities WHERE provider = 'email' AND identity_data->>'email' = 'admin@kpi-anka.local';
DELETE FROM auth.users WHERE email = 'admin@kpi-anka.local';

-- 1) User di auth.users
--    instance_id diambil dari user existing (kalau ada), fallback ke default.
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  is_sso_user,
  is_anonymous,
  email_change_confirm_status,
  created_at,
  updated_at
)
VALUES (
  COALESCE((SELECT instance_id FROM auth.users LIMIT 1), '00000000-0000-0000-0000-000000000000'::uuid),
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@kpi-anka.local',
  '$2b$12$Nz/DPjHFCf.M5sXnSRu1o.FY9.YzZQGIGIP7AJ0k3fjCMHowwsGaW',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Admin KPI Anka"}'::jsonb,
  false,
  false,
  false,
  0,
  now(),
  now()
);

-- 2) Identity
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email',
  u.email,
  now(),
  now(),
  now()
FROM auth.users u
WHERE u.email = 'admin@kpi-anka.local';

-- Verifikasi:
SELECT id, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data
FROM auth.users WHERE email = 'admin@kpi-anka.local';
