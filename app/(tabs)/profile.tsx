import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { userService } from '@/utils/services/user';

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            
            if (session?.user) {
                setUser(session.user);
            }
        } catch (error) {
            console.error('Error checking user:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            router.replace('/signin');
        } catch (error) {
            console.error('Error signing out:', error);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const navigateToEnrolledCourses = () => {
        router.push({
            pathname: '/enrolled-courses',
            params: { preload: true }
        });
    };

    const navigateToAccountSettings = () => {
        router.push({
            pathname: '/account-settings',
            params: { preload: true }
        });
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
            <View style={styles.content}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        {user?.user_metadata?.avatar_url ? (
                            <Image 
                                source={{ uri: user.user_metadata.avatar_url }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <FontAwesome name="user" size={40} color="#4CAF50" />
                            </View>
                        )}
                    </View>
                    <Text style={styles.userName}>
                        {user?.user_metadata?.full_name || 'User'}
                    </Text>
                </View>

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>My Courses</Text>
                    
                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={navigateToAccountSettings}
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={styles.iconContainer}>
                                <FontAwesome name="cog" size={20} color="#4CAF50" />
                            </View>
                            <Text style={styles.menuItemText}>Account Settings</Text>
                        </View>
                        <FontAwesome name="chevron-right" size={16} color="#666" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={navigateToEnrolledCourses}
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={styles.iconContainer}>
                                <FontAwesome name="book" size={20} color="#4CAF50" />
                            </View>
                            <Text style={styles.menuItemText}>Enrolled Courses</Text>
                        </View>
                        <FontAwesome name="chevron-right" size={16} color="#666" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.menuItem, styles.logoutItem]}
                        onPress={handleLogout}
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.iconContainer, styles.logoutIcon]}>
                                <FontAwesome name="sign-out" size={20} color="#FF3B30" />
                            </View>
                            <Text style={[styles.menuItemText, styles.logoutText]}>Sign Out</Text>
                        </View>
                    </TouchableOpacity>
                </View>
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
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#4CAF50',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    menuSection: {
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 16,
        marginLeft: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuItemText: {
        fontSize: 16,
        color: '#1A1A1A',
    },
    logoutItem: {
        borderBottomWidth: 0,
        marginTop: 8,
    },
    logoutIcon: {
        backgroundColor: '#FFE5E5',
    },
    logoutText: {
        color: '#FF3B30',
    },
});