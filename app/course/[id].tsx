import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, SafeAreaView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { courseService } from '@/utils/services/courses';
import { lectureService } from '@/utils/services/lectures';
import type { Course, Lecture } from '@/types/database.types';

export default function CourseDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [course, setCourse] = useState<Course | null>(null);
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCourse();
        loadLectures();
    }, [id]);

    const loadCourse = async () => {
        try {
            const courseData = await courseService.getCourseById(id);
            setCourse(courseData);
        } catch (error) {
            console.error('Error loading course:', error);
        }
    };

    const loadLectures = async () => {
        try {
            const lecturesData = await lectureService.getLecturesByCourseId(id);
            setLectures(lecturesData);
        } catch (error) {
            console.error('Error loading lectures:', error);
        } finally {
            setLoading(false);
        }
    };

    const navigateToLecture = (lectureId: string) => {
        router.push({
            pathname: '/lecture/[id]',
            params: { id: lectureId }
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </SafeAreaView>
        );
    }

    if (!course) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Course not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.thumbnailContainer}>
                    {course.image_url ? (
                        <Image 
                            source={{ uri: course.image_url }}
                            style={styles.thumbnail}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.thumbnailPlaceholder}>
                            <FontAwesome name="book" size={50} color="#FFFFFF" />
                        </View>
                    )}
                </View>

                <View style={styles.header}>
                    <Text style={styles.title}>{course.title}</Text>
                    <View style={styles.instructorRow}>
                        <FontAwesome name="user-circle" size={16} color="#666" />
                        <Text style={styles.instructorText}>{course.instructor}</Text>
                    </View>
                </View>

                <View style={styles.lecturesSection}>
                    <Text style={styles.sectionTitle}>Course Lectures</Text>
                    {lectures.map((lecture) => (
                        <TouchableOpacity
                            key={lecture.id}
                            style={styles.lectureCard}
                            onPress={() => navigateToLecture(lecture.id)}
                        >
                            <View style={styles.lectureIcon}>
                                <FontAwesome name="play-circle" size={24} color="#4CAF50" />
                            </View>
                            <View style={styles.lectureInfo}>
                                <Text style={styles.lectureTitle}>{lecture.title}</Text>
                                <Text style={styles.lectureDuration}>{lecture.duration}</Text>
                            </View>
                            <FontAwesome name="chevron-right" size={16} color="#666" />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    thumbnailContainer: {
        height: 200,
        backgroundColor: '#F8F8F8',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    thumbnailPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 20,
        backgroundColor: '#F8F8F8',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1A1A1A',
    },
    instructorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    instructorText: {
        fontSize: 16,
        color: '#666',
    },
    lecturesSection: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#1A1A1A',
    },
    lectureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#F8F8F8',
        borderRadius: 10,
        marginBottom: 10,
    },
    lectureIcon: {
        marginRight: 15,
    },
    lectureInfo: {
        flex: 1,
    },
    lectureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    lectureDuration: {
        fontSize: 14,
        color: '#666',
    },
}); 