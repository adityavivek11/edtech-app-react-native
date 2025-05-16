import React, { useEffect, useState } from 'react';
import { View, Alert, StatusBar, StyleSheet, TouchableOpacity, Text, ActivityIndicator, SafeAreaView } from 'react-native';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

export default function SignIn() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUserSignedIn();
    }, []);

    const checkUserSignedIn = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            console.log('Current session:', session);
            if (session) {
                router.replace('/(tabs)');
            }
        } catch (error) {
            console.error('Error checking session:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            console.log('Starting Google sign-in...');
            
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: 'exp://192.168.1.60:8081/--/signin',
                },
            });

            console.log('Sign-in response:', { data, error });

            if (error) {
                console.error('Sign-in error details:', error);
                throw error;
            }

            if (data?.url) {
                console.log('Opening URL in browser:', data.url);
                const result = await WebBrowser.openAuthSessionAsync(
                    data.url,
                    'exp://192.168.1.60:8081/--/signin'
                );

                console.log('Browser result:', result);

                if (result.type === 'success') {
                    const { url } = result;
                    if (url.includes('code=')) {
                        const code = url.split('code=')[1]?.split('#')[0];
                        if (code) {
                            console.log('Exchanging code for session...');
                            const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                            
                            if (exchangeError) {
                                console.error('Error exchanging code:', exchangeError);
                                throw exchangeError;
                            }

                            if (session) {
                                console.log('Session established after code exchange');
                                router.replace('/(tabs)');
                            }
                        }
                    }
                }
            }
        } catch (error: any) {
            console.error('Sign-in error:', error);
            Alert.alert(
                'Error',
                error.message || 'Failed to sign in with Google. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome</Text>
                    <Text style={styles.subtitle}>Sign in to get started</Text>
                </View>

                <TouchableOpacity 
                    style={styles.signInButton} 
                    onPress={handleGoogleSignIn}
                    disabled={loading}
                >
                    <Text style={styles.signInText}>Sign in with Google</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 48,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
    },
    signInButton: {
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    signInText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
});