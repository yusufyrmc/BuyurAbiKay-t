-- ========================================================
-- BuyurAbi Dijital Adisyon & Kasa Otomasyonu - Supabase Veritabanı Şeması
-- ========================================================
-- Bu SQL kodunu Supabase paneline giriş yapıp sol menüdeki "SQL Editor"
-- bölümüne yapıştırarak "RUN" butonuna basıp çalıştırabilirsiniz.
-- Bu betik; Yetkili Profilleri, İşletme Başvuruları, Canlı Siparişler
-- ve Çağrı/Destek Kayıtları için gerekli tüm tabloları, yetkileri ve
-- Canlı (Realtime) senkronizasyon yayınlarını eksiksiz kurar.
-- ========================================================

-- 1. YETKİLİ PROFİLLERİ (profiles) TABLOSU
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    role TEXT DEFAULT 'İşletme Sahibi',
    password TEXT,
    created_at TEXT,
    timestamp BIGINT
);

-- 2. İŞLETME KAYITLARI & LİSANSLAR (registrations) TABLOSU
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
    password TEXT,
    created_at TEXT,
    timestamp BIGINT,
    owner_email TEXT,
    owner_role TEXT
);

-- Tablo zaten mevcutsa eksik kolonları ekle
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS owner_email TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS owner_role TEXT;

-- 3. CANLI SİPARİŞLER (orders) TABLOSU
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    business_name TEXT NOT NULL,
    table_name TEXT NOT NULL,
    customer_name TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    total_price NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'yeni', -- 'yeni', 'hazirlaniyor', 'masada', 'tamamlandi', 'iptal'
    payment_method TEXT DEFAULT 'Masada Kart / Nakit',
    cancel_reason TEXT,
    created_at TEXT,
    timestamp BIGINT
);

-- 4. ÇAĞRI VE DESTEK GÖRÜŞME NOTLARI (support_notes) TABLOSU
CREATE TABLE IF NOT EXISTS public.support_notes (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    agent TEXT DEFAULT 'Destek Temsilcisi',
    category TEXT DEFAULT 'Genel Danışma',
    text TEXT NOT NULL,
    created_at TEXT,
    timestamp BIGINT
);

-- ========================================================
-- 5. ROW LEVEL SECURITY (RLS) AKTİFLEŞTİRME
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_notes ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- 6. GÜVENLİK POLİTİKALARI (Tüm Okuma/Yazma İşlemlerine İzin Ver)
-- ========================================================

-- Profiles Politikaları
DROP POLICY IF EXISTS "Public Read Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public Insert Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public Update Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public Delete Profiles" ON public.profiles;

CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Insert Profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Public Delete Profiles" ON public.profiles FOR DELETE USING (true);

-- Registrations Politikaları
DROP POLICY IF EXISTS "Public Read Access" ON public.registrations;
DROP POLICY IF EXISTS "Public Insert Access" ON public.registrations;
DROP POLICY IF EXISTS "Public Update Access" ON public.registrations;
DROP POLICY IF EXISTS "Public Delete Access" ON public.registrations;

CREATE POLICY "Public Read Access" ON public.registrations FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON public.registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access" ON public.registrations FOR UPDATE USING (true);
CREATE POLICY "Public Delete Access" ON public.registrations FOR DELETE USING (true);

-- Orders Politikaları
DROP POLICY IF EXISTS "Public Read Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Insert Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Update Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Delete Orders" ON public.orders;

CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Public Delete Orders" ON public.orders FOR DELETE USING (true);

-- Support Notes Politikaları
DROP POLICY IF EXISTS "Public Read Support Notes" ON public.support_notes;
DROP POLICY IF EXISTS "Public Insert Support Notes" ON public.support_notes;
DROP POLICY IF EXISTS "Public Update Support Notes" ON public.support_notes;
DROP POLICY IF EXISTS "Public Delete Support Notes" ON public.support_notes;

CREATE POLICY "Public Read Support Notes" ON public.support_notes FOR SELECT USING (true);
CREATE POLICY "Public Insert Support Notes" ON public.support_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Support Notes" ON public.support_notes FOR UPDATE USING (true);
CREATE POLICY "Public Delete Support Notes" ON public.support_notes FOR DELETE USING (true);

-- ========================================================
-- 7. REALTIME (CANLI SENKRONİZASYON) YAYINI TANIMI
-- ========================================================
DO $$
BEGIN
  -- profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;

  -- registrations
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'registrations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.registrations;
  END IF;

  -- orders
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;

  -- support_notes
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'support_notes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.support_notes;
  END IF;
END $$;

-- ========================================================
-- 8. BAŞLANGIÇ DEMO VERİLERİ (İsteğe Bağlı Örnek Kayıtlar)
-- ========================================================

-- Başlangıç Profili
INSERT INTO public.profiles (id, full_name, email, phone, role, password, created_at, timestamp)
VALUES 
  ('PRF-1001', 'Ahmet Yılmaz', 'ahmet@gaziantepsofrasi.com', '0532 555 44 33', 'İşletme Sahibi', '123456', 'Bugün', 1700000000000),
  ('PRF-1002', 'Selin Kaya', 'selin@modakafe.com', '0544 888 12 34', 'Restoran Müdürü', '123456', 'Dün', 1700000000000)
ON CONFLICT (id) DO NOTHING;

-- Başlangıç İşletme Başvuruları
INSERT INTO public.registrations (id, business_name, full_name, business_type, phone, city, full_address, plan, plan_price, status, password, created_at, timestamp, owner_email, owner_role)
VALUES
  ('REG-1001', 'Gaziantep Lezzet Sofrası', 'Ahmet Yılmaz', 'Izgara & Dönerci', '0532 555 44 33', 'İstanbul / Kadıköy', 'Caferağa Mah. Moda Cad. No:84/A Kadıköy', 'Profesyonel Paket (25 Masa - ₺899/ay)', 899, 'onaylandi', '123456', '10 dk önce', 1700000000000, 'ahmet@gaziantepsofrasi.com', 'İşletme Sahibi'),
  ('REG-1002', 'Moda Artisan Kafe', 'Selin Kaya', 'Kafe & Patisserie', '0544 888 12 34', 'İstanbul / Kadıköy', 'Mühürdar Sok. No:12 Moda', 'Başlangıç Paketi (10 Masa - ₺499/ay)', 499, 'onaylandi', '123456', '2 saat önce', 1700000000000, 'selin@modakafe.com', 'Restoran Müdürü'),
  ('REG-1003', 'Çıtır Taş Fırın Pide', 'Mehmet Öztürk', 'Pide & Lahmacun Salonu', '0505 111 22 33', 'Ankara / Çankaya', 'Tunalı Hilmi Cad. No:45 Çankaya', 'Kurumsal Paket (Sınırsız - ₺1.499/ay)', 1499, 'bekliyor', '123456', '45 dk önce', 1700000000000, 'mehmet@citirpide.com', 'İşletme Sahibi')
ON CONFLICT (id) DO NOTHING;

-- Başlangıç Canlı Siparişler
INSERT INTO public.orders (id, business_id, business_name, table_name, customer_name, items, total_price, status, payment_method, created_at, timestamp)
VALUES
  ('SIP-1081', 'REG-1001', 'Gaziantep Lezzet Sofrası', 'Masa 4', 'Kemal Arslan', '[{"name":"Zırh Kıyma Adana Kebap","qty":2,"price":340,"note":"Az acılı, bol sumaklı"},{"name":"Bol Köpüklü Yayık Ayran","qty":2,"price":45}]'::jsonb, 770, 'yeni', 'Masada Kredi Kartı', '2 dk önce', 1700000000000),
  ('SIP-1080', 'REG-1002', 'Moda Artisan Kafe', 'Bahçe Masa 2', 'Zeynep Demir', '[{"name":"Flat White & Kruvasan","qty":1,"price":185},{"name":"San Sebastian Cheesecake","qty":1,"price":195}]'::jsonb, 380, 'hazirlaniyor', 'Online Kart ile Ödendi', '8 dk önce', 1700000000000),
  ('SIP-1079', 'REG-1003', 'Çıtır Taş Fırın Pide', 'Masa 8', 'Burak Şahin', '[{"name":"Taş Fırın Kuşbaşılı Pide","qty":2,"price":290},{"name":"Kutu Kola","qty":2,"price":50}]'::jsonb, 680, 'masada', 'Nakit', '15 dk önce', 1700000000000),
  ('SIP-1078', 'REG-1001', 'Gaziantep Lezzet Sofrası', 'Masa 1', 'Mustafa Kaya', '[{"name":"Tereyağlı İskender Kebap","qty":1,"price":380},{"name":"Künefe","qty":1,"price":160}]'::jsonb, 540, 'tamamlandi', 'Kredi Kartı', '35 dk önce', 1700000000000)
ON CONFLICT (id) DO NOTHING;

-- Başlangıç Çağrı ve Destek Notları
INSERT INTO public.support_notes (id, business_id, agent, category, text, created_at, timestamp)
VALUES
  ('NOTE-1', 'REG-1001', 'Destek Temsilcisi (Yusuf)', 'Masa / QR Kontrolü', 'Ahmet Bey aradı. Masa 4 garson çağırma testi yapıldı ve kasanın bildirim sesi onaylandı.', 'Bugün 11:20', 1700000000000),
  ('NOTE-2', 'REG-1002', 'Destek Ekibi', 'Menü & Fiyat Ayarlama', 'Selin Hanım aradı, yeni sezon fiyat ayarlama ve özel masa fiyatı adımları tarif edildi.', 'Dün 16:45', 1700000000000)
ON CONFLICT (id) DO NOTHING;
