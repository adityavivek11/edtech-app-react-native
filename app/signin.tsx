import React, { useEffect, useState, useRef } from 'react';
import { View, Alert, StatusBar, StyleSheet, TouchableOpacity, Text, ActivityIndicator, SafeAreaView, Image, Animated, Pressable } from 'react-native';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Session } from '@supabase/supabase-js';
import { userService } from '@/utils/services/user';
import * as Font from 'expo-font';

// Generate redirect URI without useProxy (which is deprecated)
const redirectTo = AuthSession.makeRedirectUri();

export default function SignIn() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const buttonScale = useRef(new Animated.Value(1)).current;
    const buttonOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        async function loadFonts() {
            await Font.loadAsync({
                'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
                'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
                'Poppins-SemiBold': require('@/assets/fonts/Poppins-SemiBold.ttf'),
            });
            setFontsLoaded(true);
        }

        loadFonts();
        checkUserSignedIn();
    }, []);

    const checkUserSignedIn = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            console.log('Current session:', session);
            if (session) {
                // Check if the user is allowed
                await checkUserIsAllowed(session);
            }
        } catch (error) {
            console.error('Error checking session:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkUserIsAllowed = async (session: Session) => {
        try {
            // Ensure the user has a profile
            await userService.ensureProfileExists(
                session.user.id,
                session.user.user_metadata?.full_name || ''
            );
            
            // Check if the user is allowed
            const isAllowed = await userService.checkUserIsAllowed(session.user.id);

            if (isAllowed) {
                // User is allowed, go to home
                router.push('/');
            } else {
                // User is not allowed, go to waiting screen
                router.push('/waiting-approval');
            }
        } catch (error) {
            console.error('Error checking isAllowed status:', error);
            // Let the RootLayout handle this case
            router.push('/');
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            console.log('Starting Google sign-in...');
            
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectTo,
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
                    redirectTo
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
                                // Check if the user is allowed after successful auth
                                await checkUserIsAllowed(session);
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

    const onPressIn = () => {
        Animated.parallel([
            Animated.timing(buttonScale, {
                toValue: 0.96,
                duration: 150,
                useNativeDriver: true
            }),
            Animated.timing(buttonOpacity, {
                toValue: 0.9,
                duration: 150,
                useNativeDriver: true
            })
        ]).start();
    };

    const onPressOut = () => {
        Animated.parallel([
            Animated.timing(buttonScale, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true
            }),
            Animated.timing(buttonOpacity, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true
            })
        ]).start();
    };

    if (loading || !fontsLoaded) {
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
                <View style={styles.logoContainer}>
                    <Image 
                        source={require('@/assets/aaa-logo.png')} 
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.illustrationContainer}>
                    <Image 
                        source={require('@/assets/auth-illustration.png')} 
                        style={styles.illustration}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <Pressable 
                        onPress={handleGoogleSignIn}
                        onPressIn={onPressIn}
                        onPressOut={onPressOut}
                        disabled={loading}
                    >
                        <Animated.View 
                            style={[
                                styles.signInButton,
                                {
                                    transform: [{ scale: buttonScale }],
                                    opacity: buttonOpacity
                                }
                            ]}
                        >
                            <View style={styles.buttonContent}>
                                <Image 
                                    source={require('@/assets/google-icon.png')} 
                                    style={styles.googleIcon} 
                                />
                                <Text style={styles.signInText}>Continue with Google</Text>
                            </View>
                        </Animated.View>
                    </Pressable>
                </View>

                <Text style={styles.termsText}>
                    By continuing, you agree to our Terms{'\n'}
                    & Privacy Policy.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF3E0', // Cream background color
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAF3E0', // Cream background color
    },
    content: {
        flex: 1,
        padding: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 36,
    },
    logo: {
        width: 420,
        height: 180,
    },
    illustrationContainer: {
        width: '100%',
        height: 220,
        marginBottom: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    illustration: {
        width: '100%',
        height: '100%',
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    signInButton: {
        backgroundColor: 'transparent',
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        maxWidth: 320,
        borderWidth: 1.5,
        borderColor: '#e3e0dc',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    googleIcon: {
        width: 24,
        height: 24,
        marginRight: 16,
    },
    signInText: {
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'Poppins-Medium',
        color: '#3C4043', // Google's text color
        letterSpacing: 0.25,
        textAlign: 'center',
        paddingTop: 3
    },
    termsText: {
        fontSize: 14,
        color: '#666666',
        marginTop: 30,
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
        letterSpacing: 0.2,
    },
});