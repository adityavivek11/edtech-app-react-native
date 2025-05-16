import { supabase } from '../supabase';
import type { Course, CourseEnrollment } from '@/types/database.types';

export const courseService = {
    async getAllCourses(): Promise<Course[]> {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching courses:', error);
            throw error;
        }

        return data || [];
    },

    async getCourseById(id: string): Promise<Course | null> {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching course:', error);
            throw error;
        }

        return data;
    },

    async getUserEnrollments(userId: string) {
        const { data, error } = await supabase
            .from('course_enrollments')
            .select('*, course:courses(*)')
            .eq('user_id', userId);
            
        if (error) {
            console.error('Error fetching enrollments:', error);
            throw error;
        }
        
        return data;
    },

    async enrollInCourse(courseId: string, userId: string): Promise<CourseEnrollment> {
        // First check if already enrolled
        const { data: existingEnrollment } = await supabase
            .from('course_enrollments')
            .select('*')
            .eq('course_id', courseId)
            .eq('user_id', userId)
            .single();

        if (existingEnrollment) {
            return existingEnrollment;
        }

        // If not enrolled, create new enrollment
        const { data, error } = await supabase
            .from('course_enrollments')
            .insert({
                course_id: courseId,
                user_id: userId,
                progress: 0,
                completed_lessons: [],
                last_accessed: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Error enrolling in course:', error);
            throw error;
        }

        return data;
    },

    async checkEnrollmentStatus(courseId: string, userId: string): Promise<CourseEnrollment | null> {
        const { data, error } = await supabase
            .from('course_enrollments')
            .select('*')
            .eq('course_id', courseId)
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is the "not found" error code
            console.error('Error checking enrollment:', error);
            throw error;
        }

        return data || null;
    },

    async updateCourseProgress(
        courseId: string, 
        userId: string, 
        lessonIndex: number, 
        completed: boolean
    ): Promise<void> {
        const enrollment = await this.checkEnrollmentStatus(courseId, userId);
        if (!enrollment) {
            throw new Error('Not enrolled in this course');
        }

        const completedLessons = new Set(enrollment.completed_lessons);
        if (completed) {
            completedLessons.add(lessonIndex);
        } else {
            completedLessons.delete(lessonIndex);
        }

        const { error } = await supabase
            .from('course_enrollments')
            .update({
                completed_lessons: Array.from(completedLessons),
                progress: (Array.from(completedLessons).length / enrollment.completed_lessons.length) * 100,
                last_accessed: new Date().toISOString()
            })
            .eq('course_id', courseId)
            .eq('user_id', userId);

        if (error) {
            console.error('Error updating progress:', error);
            throw error;
        }
    }
}; 