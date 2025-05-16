-- Create the course_enrollments table
CREATE TABLE course_enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    progress DECIMAL DEFAULT 0 NOT NULL,
    completed_lessons INTEGER[] DEFAULT '{}' NOT NULL,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, course_id)
);

-- Create an index for faster lookups
CREATE INDEX course_enrollments_user_id_idx ON course_enrollments(user_id);
CREATE INDEX course_enrollments_course_id_idx ON course_enrollments(course_id);

-- Set up Row Level Security (RLS)
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own enrollments"
    ON course_enrollments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enrollments"
    ON course_enrollments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments"
    ON course_enrollments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Sample data (optional - uncomment if needed)
-- INSERT INTO course_enrollments (user_id, course_id, progress, completed_lessons)
-- VALUES
--     ('user-uuid-1', 'course-uuid-1', 25.0, '{0,1}'),
--     ('user-uuid-2', 'course-uuid-2', 75.0, '{0,1,2,3}'); 