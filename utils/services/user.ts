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
    },

    async checkUserIsAllowed(userId: string): Promise<boolean> {
        try {
            // Check if the user is allowed in the profiles table
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('isAllowed')
                .eq('id', userId)
                .single();
            
            if (error) {
                console.error('Error checking if user is allowed:', error);
                return false;
            }
            
            return profile?.isAllowed || false;
        } catch (error) {
            console.error('Error checking if user is allowed:', error);
            return false;
        }
    },

    async ensureProfileExists(userId: string, fullName: string = ''): Promise<void> {
        try {
            // Check if profile exists
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', userId)
                .single();
            
            if (error || !profile) {
                // Create profile if it doesn't exist
                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                        id: userId,
                        full_name: fullName,
                        isAllowed: false,
                    });
                
                if (insertError) {
                    console.error('Error creating user profile:', insertError);
                    throw insertError;
                }
            }
        } catch (error) {
            console.error('Error ensuring profile exists:', error);
            throw error;
        }
    }
}; 