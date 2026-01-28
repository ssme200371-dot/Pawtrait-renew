-- Create Gallery Table
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  style_id TEXT,
  style_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Gallery
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own images
CREATE POLICY "Users can view own gallery" ON gallery
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own images
CREATE POLICY "Users can insert into own gallery" ON gallery
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete own gallery items" ON gallery
  FOR DELETE USING (auth.uid() = user_id);


-- Create Storage Bucket for User Images
INSERT INTO storage.buckets (id, name, public) VALUES ('pawtrait_gallery', 'pawtrait_gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Users can upload to their own folder
CREATE POLICY "Users can upload gallery images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pawtrait_gallery' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage Policy: Users can view their own images (or public if we want)
-- Since the bucket is public, we might allow public read, or restrict to owner.
-- For a gallery, usually public read is fine if the URL is known, or restrict. 
-- Let's allow public read for simplicity of <img> tags, but listing is restricted by DB RLS.
CREATE POLICY "Public Access to Gallery Images" ON storage.objects
  FOR SELECT USING (bucket_id = 'pawtrait_gallery');

-- Grant permissions if needed (usually authenticated role has access by default if policies exist)
