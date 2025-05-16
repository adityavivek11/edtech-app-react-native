import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function RootLayout() {
    const { session, initialized } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (!initialized) return;

        const inAuthGroup = segments[0] === 'signin';

        if (!session && !inAuthGroup) {
            // Redirect to sign-in if not authenticated
            router.replace('/signin');
        } else if (session && inAuthGroup) {
            // Redirect to home if authenticated
            router.replace('/(tabs)');
        }
    }, [session, initialized, segments]);

    if (!initialized) {
        return null;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="signin" options={{ headerShown: false }} />
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
