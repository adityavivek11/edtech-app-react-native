import { supabase } from '../supabase';
import type { Lecture } from '@/types/database.types';

export const lectureService = {
    async getLecturesByCourseId(courseId: string): Promise<Lecture[]> {
        const { data, error } = await supabase
            .from('lectures')
            .select('*')
            .eq('course_id', courseId)
            .order('order', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async getLectureById(lectureId: string): Promise<Lecture | null> {
        const { data, error } = await supabase
            .from('lectures')
            .select('*')
            .eq('id', lectureId)
            .single();

        if (error) throw error;
        return data;
    },

    async updateLectureProgress(userId: string, lectureId: string, progress: number) {
        const { error } = await supabase
            .from('lecture_progress')
            .upsert(
                {
                    user_id: userId,
                    lecture_id: lectureId,
                    progress,
                    last_accessed: new Date().toISOString(),
                },
                {
                    onConflict: 'user_id,lecture_id',
                    ignoreDuplicates: false
                }
            );

        if (error) throw error;
    }
}; 