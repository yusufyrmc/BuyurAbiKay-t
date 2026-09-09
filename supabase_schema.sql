-- ========================================================
-- BuyurAbi QR Menü Kayıt Sistemi - Supabase Veritabanı Şeması
-- ========================================================
-- Bu kodu Supabase paneline giriş yapıp "SQL Editor" bölümünde çalıştırın.

-- 1. Registrations (İşletme Başvuruları) Tablosunu Oluştur
CREATE TABLE IF NOT EXISTS public.registrations (
    id TEXT PRIMARY KEY,
    business_name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    business_type TEXT,
    phone TEXT NOT NULL,
    city TEXT,
    full_address TEXT,
    plan TEXT,
    plan_price NUMERIC DEFAULT 899,
    status TEXT DEFAULT 'bekliyor', -- 'bekliyor', 'onaylandi', 'reddedildi'
    created_at TEXT,
    timestamp BIGINT
);

-- 2. Row Level Security (RLS) Aktifleştirme
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 3. Herkese Okuma (Select) İzni Ver
CREATE POLICY "Public Read Access"
ON public.registrations FOR SELECT
USING (true);

-- 4. Herkese Yeni Başvuru Ekleme (Insert) İzni Ver
CREATE POLICY "Public Insert Access"
ON public.registrations FOR INSERT
WITH CHECK (true);

-- 5. Herkese Güncelleme (Update) İzni Ver (Onaylama/Reddetme için)
CREATE POLICY "Public Update Access"
ON public.registrations FOR UPDATE
USING (true);

-- 6. Herkese Silme (Delete) İzni Ver
CREATE POLICY "Public Delete Access"
ON public.registrations FOR DELETE
USING (true);

-- 7. Realtime (Canlı Senkronizasyon) Yayınını Aktifleştir
ALTER PUBLICATION supabase_realtime ADD TABLE public.registrations;
