import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import { userService } from '@/utils/services/user';

export default function RootLayout() {
    const { session, initialized } = useAuth();
    const segments = useSegments();
    const router = useRouter();
    const [isCheckingProfile, setIsCheckingProfile] = useState(false);

    useEffect(() => {
        if (!initialized) return;

        const inAuthGroup = segments[0] === 'signin';
        const inWaitingGroup = segments[0] === 'waiting-approval';

        const checkProfileStatus = async () => {
            if (!session) return;
            
            try {
                setIsCheckingProfile(true);
                
                // Ensure the user has a profile
                await userService.ensureProfileExists(
                    session.user.id, 
                    session.user.user_metadata?.full_name || ''
                );
                
                // Check if user is allowed
                const isAllowed = await userService.checkUserIsAllowed(session.user.id);
                
                if (!isAllowed) {
                    // User is not allowed, redirect to waiting screen
                    if (!inWaitingGroup) {
                        router.replace('/waiting-approval');
                    }
                } else if (inWaitingGroup) {
                    // User is allowed but on waiting screen, redirect to home
                    router.replace('/(tabs)');
                }
            } catch (error) {
                console.error('Error checking profile status:', error);
            } finally {
                setIsCheckingProfile(false);
            }
        };

        if (!session && !inAuthGroup) {
            // Redirect to sign-in if not authenticated
            router.replace('/signin');
        } else if (session && inAuthGroup) {
            // Check profile status when user is authenticated
            checkProfileStatus();
        } else if (session && !inWaitingGroup && !isCheckingProfile) {
            // Check profile status for authenticated users not in waiting screen
            checkProfileStatus();
        }
    }, [session, initialized, segments]);

    if (!initialized) {
        return null;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="signin" options={{ headerShown: false }} />
            <Stack.Screen name="waiting-approval" options={{ headerShown: false }} />
            <Stack.Screen name="enrolled-courses" options={{ headerShown: false }} />
            <Stack.Screen name="account-settings" options={{ headerShown: false }} />
            <Stack.Screen 
                name="course/[id]" 
                options={{ 
                    headerShown: false,
                    presentation: 'card'
                }} 
            />
        </Stack>
    );
}
