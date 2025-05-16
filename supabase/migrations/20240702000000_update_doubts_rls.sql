-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own doubts" ON public.doubts;
DROP POLICY IF EXISTS "Teachers can view all doubts" ON public.doubts;
DROP POLICY IF EXISTS "Users can insert their own doubts" ON public.doubts;
DROP POLICY IF EXISTS "Users can update their own doubts" ON public.doubts;
DROP POLICY IF EXISTS "Anyone can view doubt replies" ON public.doubt_replies;
DROP POLICY IF EXISTS "Users can insert their own replies" ON public.doubt_replies;
DROP POLICY IF EXISTS "Users can update their own replies" ON public.doubt_replies;

-- Create simpler policies for doubts
CREATE POLICY "Enable read access for all users" 
    ON public.doubts FOR SELECT 
    USING (true);

CREATE POLICY "Enable insert for authenticated users only" 
    ON public.doubts FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" 
    ON public.doubts FOR UPDATE 
    USING (auth.uid() = user_id);

-- Create simpler policies for doubt replies
CREATE POLICY "Enable read access for all users" 
    ON public.doubt_replies FOR SELECT 
    USING (true);

CREATE POLICY "Enable insert for authenticated users only" 
    ON public.doubt_replies FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" 
    ON public.doubt_replies FOR UPDATE 
    USING (auth.uid() = user_id);