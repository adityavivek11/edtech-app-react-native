import { supabase } from '@/utils/supabase';

export type CarouselImage = {
    id: string;
    created_at: string;
    title: string | null;
    description: string | null;
    image_url: string;
    link_url: string | null;
    display_order: number;
    is_active: boolean;
};

export const carouselService = {
    async getActiveCarouselImages(): Promise<CarouselImage[]> {
        const { data, error } = await supabase
            .from('carousel_images')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error fetching carousel images:', error);
            throw error;
        }

        return data || [];
    }
}; 