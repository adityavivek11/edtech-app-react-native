import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';
import { userService } from '@/utils/services/user';

export default function AccountSettings() {
    const { preload } = useLocalSearchParams<{ preload: string }>();
    const [loading, setLoading] = useState(!preload);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        avatarUrl: '',
    });

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            
            if (session?.user) {
                setUser(session.user);
                setFormData({
                    fullName: session.user.user_metadata?.full_name || '',
                    avatarUrl: session.user.user_metadata?.avatar_url || '',
                });
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;

        try {
            setSaving(true);
            const updatedUser = await userService.updateProfile(user.id, {
                full_name: formData.fullName,
                avatar_url: formData.avatarUrl
            });
            setUser(updatedUser);
            Alert.alert('Success', 'Account settings updated successfully!');
        } catch (error) {
            console.error('Error updating account settings:', error);
            Alert.alert('Error', 'Failed to update account settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen 
                options={{
                    headerTitle: "Account Settings",
                    headerShown: true,
                    headerLeft: () => (
                        <TouchableOpacity 
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <FontAwesome name="arrow-left" size={20} color="#1A1A1A" />
                        </TouchableOpacity>
                    ),
                }}
            />
            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.fullName}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
                            placeholder="Enter your full name"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Avatar URL</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.avatarUrl}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, avatarUrl: text }))}
                            placeholder="Enter avatar URL"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.emailText}>{user?.email}</Text>
                    </View>
                </View>

                <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
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
    },
    content: {
        flex: 1,
        padding: 16,
    },
    backButton: {
        padding: 8,
        marginLeft: 8,
    },
    section: {
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    emailText: {
        fontSize: 16,
        color: '#666666',
        backgroundColor: '#EEEEEE',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
}); 