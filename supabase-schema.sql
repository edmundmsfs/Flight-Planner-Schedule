-- Run this in Supabase SQL Editor to create the required tables

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Airports table
CREATE TABLE IF NOT EXISTS airports (
  icao TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  runway INTEGER
);

-- Schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flight_number TEXT NOT NULL,
  airline TEXT NOT NULL,
  departure TEXT NOT NULL,
  departure_city TEXT,
  arrival TEXT NOT NULL,
  arrival_city TEXT,
  departure_time TEXT NOT NULL,
  arrival_time TEXT NOT NULL,
  block_time DOUBLE PRECISION NOT NULL,
  distance INTEGER NOT NULL,
  date TEXT NOT NULL,
  status TEXT DEFAULT 'Scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE airports ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Airports: everyone can read
CREATE POLICY "Anyone can view airports" ON airports FOR SELECT USING (true);

-- Schedules: users can only manage their own
CREATE POLICY "Users can view own schedules" ON schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own schedules" ON schedules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own schedules" ON schedules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own schedules" ON schedules FOR DELETE USING (auth.uid() = user_id);

-- Sample airport data
INSERT INTO airports (icao, name, city, country, lat, lon, runway) VALUES
  ('WIII', 'Soekarno-Hatta', 'Jakarta', 'Indonesia', -6.1255, 106.6558, 3660),
  ('WADD', 'I Gusti Ngurah Rai', 'Bali', 'Indonesia', -8.7481, 115.1672, 3000),
  ('WARR', 'Juanda', 'Surabaya', 'Indonesia', -7.3798, 112.7871, 3000),
  ('WIMM', 'Kualanamu', 'Medan', 'Indonesia', 3.6422, 98.8737, 3750),
  ('WAAA', 'Sultan Hasanuddin', 'Makassar', 'Indonesia', -5.0616, 119.5540, 3100),
  ('WAHI', 'Jenderal Ahmad Yani', 'Semarang', 'Indonesia', -6.9723, 110.3758, 2560),
  ('WIOO', 'Supadio', 'Pontianak', 'Indonesia', -0.1507, 109.4045, 2250),
  ('WAOO', 'Syamsudin Noor', 'Banjarmasin', 'Indonesia', -3.4409, 114.7612, 2500),
  ('WIDN', 'Hang Nadim', 'Batam', 'Indonesia', 1.1211, 104.1190, 4040),
  ('WADL', 'Zainuddin Abdul Madjid', 'Lombok', 'Indonesia', -8.7618, 116.2750, 2750),
  ('WAHH', 'Yogyakarta International', 'Yogyakarta', 'Indonesia', -7.9009, 110.0577, 3250),
  ('WAJJ', 'Sentani', 'Jayapura', 'Indonesia', -2.5765, 140.5159, 3000),
  ('WALL', 'Sultan Aji Muhammad Sulaiman', 'Balikpapan', 'Indonesia', -1.2675, 116.8944, 2500),
  ('WAMM', 'Sam Ratulangi', 'Manado', 'Indonesia', 1.5493, 124.9261, 2650),
  ('WIBB', 'Sultan Syarif Kasim II', 'Pekanbaru', 'Indonesia', 0.4611, 101.4480, 2600),
  ('WIPP', 'Sultan Mahmud Badaruddin II', 'Palembang', 'Indonesia', -2.8981, 104.7001, 3000),
  ('WARJ', 'Adisumarmo', 'Solo', 'Indonesia', -7.5152, 110.7569, 2600),
  ('WIPA', 'Sultan Thaha', 'Jambi', 'Indonesia', -1.6380, 103.6440, 2400),
  ('WITT', 'Sultan Iskandar Muda', 'Banda Aceh', 'Indonesia', 5.5225, 95.4003, 3500),
  ('VTBS', 'Suvarnabhumi', 'Bangkok', 'Thailand', 13.6811, 100.7472, 4000),
  ('VTBU', 'U-Tapao Rayong-Pattaya', 'Pattaya', 'Thailand', 12.6799, 101.0051, 3505),
  ('VTSP', 'Phuket International', 'Phuket', 'Thailand', 8.1132, 98.3168, 3000),
  ('WMKK', 'Kuala Lumpur International', 'Kuala Lumpur', 'Malaysia', 2.7455, 101.7099, 4124),
  ('WMKP', 'Penang International', 'Penang', 'Malaysia', 5.2971, 100.2768, 3352),
  ('WSSS', 'Changi', 'Singapore', 'Singapore', 1.3644, 103.9915, 4000)
ON CONFLICT (icao) DO NOTHING;
