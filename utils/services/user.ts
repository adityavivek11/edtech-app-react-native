import { supabase } from '@/utils/supabase';

export const userService = {
    async updateUserMetadata(userId: string, metadata: { full_name?: string; avatar_url?: string }) {
        const { data, error } = await supabase.auth.updateUser({
            data: metadata
        });

        if (error) {
            console.error('Error updating user metadata:', error);
            throw error;
        }

        return data;
    },

    async updateProfile(userId: string, updates: { full_name?: string; avatar_url?: string }) {
        try {
            // Update the user's metadata
            await this.updateUserMetadata(userId, updates);
            
            // Refresh the session to get the updated metadata
            const { data: { session }, error } = await supabase.auth.refreshSession();
            
            if (error) throw error;
            return session?.user;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }
}; 