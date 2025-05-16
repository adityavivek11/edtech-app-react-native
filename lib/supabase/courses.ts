import { createClient } from '@/lib/supabase/client';
import { CourseEnrollment } from '@/types/supabase';

// Get enrollment for a specific course and user
export async function getCourseEnrollment(courseId: string, userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .single();
    
  if (error) throw error;
  return data as CourseEnrollment;
}

// Create a new course enrollment
export async function createCourseEnrollment(courseId: string, userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('course_enrollments')
    .insert([
      {
        course_id: courseId,
        user_id: userId,
        progress: 0,
        completed_lessons: [],
        last_accessed: new Date().toISOString(),
      },
    ])
    .select()
    .single();
    
  if (error) throw error;
  return data as CourseEnrollment;
}

// Update course enrollment progress
export async function updateCourseProgress(
  enrollmentId: string,
  progress: number,
  completedLessons: number[]
) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('course_enrollments')
    .update({
      progress,
      completed_lessons: completedLessons,
      last_accessed: new Date().toISOString(),
    })
    .eq('id', enrollmentId)
    .select()
    .single();
    
  if (error) throw error;
  return data as CourseEnrollment;
}

// Get all enrollments for a user
export async function getUserEnrollments(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('course_enrollments')
    .select('*, course:courses(*)')
    .eq('user_id', userId);
    
  if (error) throw error;
  return data;
}

// Delete a course enrollment
export async function deleteCourseEnrollment(enrollmentId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('course_enrollments')
    .delete()
    .eq('id', enrollmentId);
    
  if (error) throw error;
  return true;
} 