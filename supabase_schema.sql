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

-- 3. Mevcut Politikaları Temizle (Hata Almamak İçin)
DROP POLICY IF EXISTS "Public Read Access" ON public.registrations;
DROP POLICY IF EXISTS "Public Insert Access" ON public.registrations;
DROP POLICY IF EXISTS "Public Update Access" ON public.registrations;
DROP POLICY IF EXISTS "Public Delete Access" ON public.registrations;

-- 4. Politikaları Tekrar Oluştur (Tüm İşlemlere İzin Ver)
CREATE POLICY "Public Read Access" ON public.registrations FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON public.registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access" ON public.registrations FOR UPDATE USING (true);
CREATE POLICY "Public Delete Access" ON public.registrations FOR DELETE USING (true);

-- 5. Realtime (Canlı Senkronizasyon) Yayınını Aktifleştir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'registrations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.registrations;
  END IF;
END $$;
