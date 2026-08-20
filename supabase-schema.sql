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
CREATE POLICY "Users can delete own schedules" ON schedules FOR DELETE USING (auth.uid() = user_id);

-- Sample airport data for Indonesia
INSERT INTO airports (icao, name, city, lat, lon, runway) VALUES
  ('WIII', 'Soekarno-Hatta International Airport', 'Jakarta', -6.1256, 106.6558, 3905),
  ('WADD', 'Ngurah Rai International Airport', 'Bali', -8.7482, 115.1672, 3000),
  ('WARR', 'Juanda International Airport', 'Surabaya', -7.3798, 112.7868, 3000),
  ('WAME', 'Kualanamu International Airport', 'Medan', 3.6422, 98.8853, 3750),
  ('WAHQ', 'Sultan Hasanuddin International Airport', 'Makassar', -5.0616, 119.5542, 2500),
  ('WARJ', 'Adisumarmo International Airport', 'Solo', -7.5152, 110.7569, 2600),
  ('WARP', 'Achmad Yani International Airport', 'Semarang', -6.9724, 110.3753, 2600),
  ('WIOO', 'Supadio International Airport', 'Pontianak', -0.1507, 109.3711, 2250),
  ('WAOO', 'Syamsudin Noor International Airport', 'Banjarmasin', -3.4424, 114.7625, 2250),
  ('WIDD', 'Hang Nadim International Airport', 'Batam', 1.0456, 104.2217, 4000),
  ('WADL', 'Lombok International Airport', 'Lombok', -8.7582, 116.2750, 2750),
  ('WIPA', 'Sultan Thaha Airport', 'Jambi', -1.6380, 103.6440, 2400),
  ('WITT', 'Sultan Iskandar Muda International Airport', 'Banda Aceh', 5.5225, 95.4003, 3500),
  ('WAKK', 'Sultan Hasanuddin International Airport', 'Makassar', 5.0644, 119.5347, 2500)
ON CONFLICT (icao) DO NOTHING;
