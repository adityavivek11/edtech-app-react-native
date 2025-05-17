-- Create profiles table with required columns
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    isAllowed BOOLEAN DEFAULT FALSE,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Admin users can view all profiles" 
    ON public.profiles FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.uid() = auth.users.id 
        AND (raw_user_meta_data->>'role' = 'admin' OR raw_user_meta_data->>'role' = 'teacher')
    ));

CREATE POLICY "Admin users can update all profiles" 
    ON public.profiles FOR UPDATE 
    USING (EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.uid() = auth.users.id 
        AND (raw_user_meta_data->>'role' = 'admin' OR raw_user_meta_data->>'role' = 'teacher')
    ));

-- Create trigger to update the updatedAt timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updatedAt
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at(); 