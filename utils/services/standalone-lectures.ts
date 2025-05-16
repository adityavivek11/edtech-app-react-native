import { supabase } from '@/utils/supabase';

export type StandaloneLecture = {
    id: string;
    created_at: string;
    title: string;
    description: string | null;
    video_url: string;
    thumbnail_url: string | null;
    duration: string | null;
    display_order: number;
    is_active: boolean;
};

export const standaloneLectureService = {
    async getActiveLectures(): Promise<StandaloneLecture[]> {
        const { data, error } = await supabase
            .from('standalone_lectures')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error fetching standalone lectures:', error);
            throw error;
        }

        return data || [];
    },

    async getLectureById(id: string): Promise<StandaloneLecture> {
        const { data, error } = await supabase
            .from('standalone_lectures')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching standalone lecture:', error);
            throw error;
        }

        if (!data) {
            throw new Error('Lecture not found');
        }

        return data;
    }
}; 