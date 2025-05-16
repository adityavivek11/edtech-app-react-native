import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { courseService } from '@/utils/services/courses';
import type { Course } from '@/types/database.types';

export default function Courses() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const coursesData = await courseService.getAllCourses();
            setCourses(coursesData);
        } catch (error) {
            console.error('Error loading courses:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadCourses();
    }, []);

    const navigateToCourse = (courseId: string) => {
        router.push({
            pathname: '/course/[id]',
            params: { id: courseId }
        });
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Available Courses</Text>
            </View>
            
            <ScrollView 
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#4CAF50']}
                        tintColor="#4CAF50"
                    />
                }
            >
                {courses.map((course) => (
                    <TouchableOpacity 
                        key={course.id} 
                        style={styles.courseCard}
                        onPress={() => navigateToCourse(course.id)}
                    >
                        <View style={styles.courseImageContainer}>
                            {course.image_url ? (
                                <Image 
                                    source={{ uri: course.image_url }}
                                    style={styles.courseImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.courseIcon}>
                                    <FontAwesome name="book" size={40} color="#FFFFFF" />
                                </View>
                            )}
                        </View>
                        <View style={styles.courseInfo}>
                            <Text style={styles.courseTitle}>{course.title}</Text>
                            <View style={styles.instructorRow}>
                                <FontAwesome name="user-circle" size={16} color="#666" />
                                <Text style={styles.instructorText}>Instructor: {course.instructor}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
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
        backgroundColor: '#FFFFFF',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    courseCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    courseImageContainer: {
        height: 180,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    courseImage: {
        width: '100%',
        height: '100%',
    },
    courseIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
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
        color: '#666',
    },
}); 