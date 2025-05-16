import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';
import { courseService } from '@/utils/services/courses';
import type { Course } from '@/types/database.types';

export default function EnrolledCourses() {
    const { preload } = useLocalSearchParams<{ preload: string }>();
    const [loading, setLoading] = useState(!preload);
    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
    const [user, setUser] = useState<any>(null);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            
            if (session?.user) {
                setUser(session.user);
                await loadEnrolledCourses(session.user.id);
            }
        } catch (error) {
            console.error('Error checking user:', error);
        } finally {
            setLoading(false);
            setHasLoaded(true);
        }
    };

    const loadEnrolledCourses = async (userId: string) => {
        try {
            const enrollments = await courseService.getUserEnrollments(userId);
            setEnrolledCourses(enrollments.map(enrollment => enrollment.course));
        } catch (error) {
            console.error('Error loading enrolled courses:', error);
        }
    };

    const navigateToCourse = (courseId: string) => {
        router.push({
            pathname: '/course/[id]',
            params: { id: courseId }
        });
    };

    const renderCourseItem = ({ item }: { item: Course }) => (
        <TouchableOpacity 
            style={styles.courseCard}
            onPress={() => navigateToCourse(item.id)}
        >
            <View style={styles.courseImageContainer}>
                {item.image_url ? (
                    <Image 
                        source={{ uri: item.image_url }}
                        style={styles.courseImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.coursePlaceholder}>
                        <FontAwesome name="book" size={30} color="#4CAF50" />
                    </View>
                )}
            </View>
            <View style={styles.courseInfo}>
                <Text style={styles.courseTitle}>{item.title}</Text>
                <View style={styles.instructorRow}>
                    <FontAwesome name="user-circle" size={16} color="#666" />
                    <Text style={styles.instructorText}>{item.instructor}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

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
                    headerTitle: "Enrolled Courses",
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
            {!hasLoaded ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                </View>
            ) : enrolledCourses.length > 0 ? (
                <FlatList
                    data={enrolledCourses}
                    renderItem={renderCourseItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyState}>
                    <FontAwesome name="book" size={50} color="#CCCCCC" />
                    <Text style={styles.emptyStateText}>No enrolled courses yet</Text>
                    <TouchableOpacity 
                        style={styles.browseCourseButton}
                        onPress={() => router.push('/(tabs)/courses')}
                    >
                        <Text style={styles.browseCourseButtonText}>Browse Courses</Text>
                    </TouchableOpacity>
                </View>
            )}
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
    listContent: {
        padding: 16,
    },
    backButton: {
        padding: 8,
        marginLeft: 8,
    },
    courseCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    courseImageContainer: {
        height: 160,
        backgroundColor: '#F8F8F8',
    },
    courseImage: {
        width: '100%',
        height: '100%',
    },
    coursePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
    },
    courseInfo: {
        padding: 16,
    },
    courseTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    instructorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    instructorText: {
        fontSize: 14,
        color: '#666666',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#666666',
        marginTop: 16,
        marginBottom: 24,
    },
    browseCourseButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    browseCourseButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
}); 