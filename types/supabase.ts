export interface CourseEnrollment {
  id: string;
  created_at: string;
  user_id: string;
  course_id: string;
  progress: number;
  completed_lessons: number[];
  last_accessed: string;
} 