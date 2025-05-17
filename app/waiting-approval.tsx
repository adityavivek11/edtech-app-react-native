import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { Stack } from 'expo-router';
import { userService } from '@/utils/services/user';

export default function WaitingApproval() {
    const [loading, setLoading] = useState(false);
    
    const checkStatus = async () => {
        try {
            setLoading(true);
            
            // Get current user session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;
            
            if (!session?.user) {
                // If no session, redirect to sign in
                router.replace('/signin');
                return;
            }
            
            // Check if the user is allowed
            const isAllowed = await userService.checkUserIsAllowed(session.user.id);
            
            // If user is now allowed, redirect to home
            if (isAllowed) {
                router.replace('/(tabs)');
            } else {
                // Still not allowed, stay on this screen
                setLoading(false);
            }
        } catch (error) {
            console.error('Error checking status:', error);
            setLoading(false);
        }
    };
    
    // Check status on initial load
    useEffect(() => {
        checkStatus();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            
            <View style={styles.content}>
                <Text style={styles.title}>Waiting for Approval</Text>
                <Text style={styles.message}>Let your mentors allow you to move in.</Text>
                
                <TouchableOpacity 
                    style={styles.checkButton} 
                    onPress={checkStatus}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <Text style={styles.buttonText}>Check Status</Text>
                    )}
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
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 16,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 32,
        textAlign: 'center',
    },
    checkButton: {
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
}); 