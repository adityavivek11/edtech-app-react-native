-- Create doubts table
CREATE TABLE IF NOT EXISTS public.doubts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    lecture_id UUID REFERENCES public.lectures(id) ON DELETE SET NULL
);

-- Create doubt replies table
CREATE TABLE IF NOT EXISTS public.doubt_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    doubt_id UUID NOT NULL REFERENCES public.doubts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_teacher BOOLEAN NOT NULL DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doubt_replies ENABLE ROW LEVEL SECURITY;

-- Create policies for doubts
CREATE POLICY "Users can view their own doubts" 
    ON public.doubts FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view all doubts" 
    ON public.doubts FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'teacher'
    ));

CREATE POLICY "Users can insert their own doubts" 
    ON public.doubts FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own doubts" 
    ON public.doubts FOR UPDATE 
    USING (auth.uid() = user_id);

-- Create policies for doubt replies
CREATE POLICY "Anyone can view doubt replies" 
    ON public.doubt_replies FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.doubts 
        WHERE public.doubts.id = doubt_id AND (
            public.doubts.user_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM auth.users 
                WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'teacher'
            )
        )
    ));

CREATE POLICY "Users can insert their own replies" 
    ON public.doubt_replies FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own replies" 
    ON public.doubt_replies FOR UPDATE 
    USING (auth.uid() = user_id);