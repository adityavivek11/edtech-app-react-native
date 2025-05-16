import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';
import { carouselService, type CarouselImage } from '@/utils/services/carousel';
import { courseService } from '@/utils/services/courses';
import { standaloneLectureService, type StandaloneLecture } from '@/utils/services/standalone-lectures';
import type { Course } from '@/types/database.types';

const { width: screenWidth } = Dimensions.get('window');

const Index = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
    const [standaloneLectures, setStandaloneLectures] = useState<StandaloneLecture[]>([]);
    const [activeSlide, setActiveSlide] = useState(0);

    useEffect(() => {
        checkUser();
        loadCourses();
        loadCarousel();
        loadStandaloneLectures();
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

    const loadCourses = async () => {
        try {
            const coursesData = await courseService.getAllCourses();
            setCourses(coursesData);
        } catch (error) {
            console.error('Error loading courses:', error);
        }
    };

    const loadCarousel = async () => {
        try {
            const carouselData = await carouselService.getActiveCarouselImages();
            setCarouselImages(carouselData);
        } catch (error) {
            console.error('Error loading carousel:', error);
        }
    };

    const loadStandaloneLectures = async () => {
        try {
            console.log('Loading standalone lectures...');
            const { data, error } = await supabase
                .from('standalone_lectures')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (error) {
                console.error('Error loading standalone lectures:', error);
                return;
            }

            if (!data || data.length === 0) {
                console.log('No standalone lectures found');
                return;
            }

            console.log('Loaded standalone lectures:', data);
            setStandaloneLectures(data);
        } catch (error) {
            console.error('Error in loadStandaloneLectures:', error);
        }
    };

    const navigateToCourse = (courseId: string) => {
        router.push({
            pathname: '/course/[id]',
            params: { id: courseId }
        });
    };

    const navigateToLecture = (lectureId: string) => {
        console.log('Navigating to lecture with ID:', lectureId);
        router.push({
            pathname: '/standalone-lecture/[id]',
            params: { id: lectureId }
        });
    };

    const renderLecture = (lecture: StandaloneLecture) => {
        console.log('Rendering lecture card:', lecture);
        return (
            <TouchableOpacity 
                key={lecture.id} 
                style={styles.videoCard}
                onPress={() => navigateToLecture(lecture.id)}
            >
                <View style={styles.videoThumbnail}>
                    {lecture.thumbnail_url ? (
                        <Image 
                            source={{ uri: lecture.thumbnail_url }}
                            style={styles.videoImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.videoPlaceholder}>
                            <FontAwesome name="play-circle" size={30} color="#4CAF50" />
                        </View>
                    )}
                </View>
                <Text style={styles.videoTitle}>{lecture.title}</Text>
                {lecture.duration && (
                    <Text style={styles.videoDuration}>{lecture.duration}</Text>
                )}
            </TouchableOpacity>
        );
    };

    const renderCourse = (course: Course) => (
        <TouchableOpacity 
            key={course.id} 
            style={styles.courseCard}
            onPress={() => navigateToCourse(course.id)}
        >
            <View style={styles.courseThumbnail}>
                {course.image_url ? (
                    <Image 
                        source={{ uri: course.image_url }}
                        style={styles.courseImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.courseIcon}>
                        <FontAwesome name="book" size={30} color="#FFFFFF" />
                    </View>
                )}
            </View>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <View style={styles.courseInfo}>
                <View style={styles.instructorRow}>
                    <FontAwesome name="user-circle" size={12} color="#666" />
                    <Text style={styles.instructorText}>{course.instructor}</Text>
                </View>
                <Text style={styles.statsText}>{course.duration}</Text>
            </View>
        </TouchableOpacity>
    );

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
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
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Greeting Section */}
                <View style={styles.greetingContainer}>
                    <Text style={styles.greetingText}>{getGreeting()}</Text>
                    {user && <Text style={styles.usernameText}>{user.user_metadata?.full_name || 'User'}</Text>}
                </View>

                {/* Carousel Section */}
                <View style={styles.carouselContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(event) => {
                            const slideSize = event.nativeEvent.layoutMeasurement.width;
                            const index = event.nativeEvent.contentOffset.x / slideSize;
                            setActiveSlide(Math.round(index));
                        }}
                    >
                        {carouselImages.map((image) => (
                            <View key={image.id} style={styles.carouselItem}>
                                <Image
                                    source={{ uri: image.image_url }}
                                    style={styles.carouselImage}
                                    resizeMode="cover"
                                />
                            </View>
                        ))}
                    </ScrollView>
                    <View style={styles.paginationContainer}>
                        {carouselImages.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.paginationDot,
                                    index === activeSlide ? styles.paginationDotActive : null
                                ]}
                            />
                        ))}
                    </View>
                </View>

                {/* Get To Know Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Get To Know Ayurveda</Text>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        style={styles.videosContainer}
                        contentContainerStyle={styles.videosContentContainer}
                    >
                        {standaloneLectures.map((lecture) => renderLecture(lecture))}
                    </ScrollView>
                </View>

                {/* Courses Section */}
                <View style={[styles.section, styles.lastSection]}>
                    <Text style={styles.sectionTitle}>Courses We Offer</Text>
                    <View style={styles.coursesGrid}>
                        {courses.map((course) => renderCourse(course))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

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
    scrollView: {
        flex: 1,
    },
    carouselContainer: {
        height: 200,
        marginVertical: 20,
    },
    carouselItem: {
        width: screenWidth,
        height: 200,
        backgroundColor: '#F8F8F8',
    },
    carouselImage: {
        width: '100%',
        height: '100%',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#CCCCCC',
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: '#4CAF50',
    },
    section: {
        padding: 20,
    },
    lastSection: {
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#1A1A1A',
    },
    videosContainer: {
        flexDirection: 'row',
    },
    videosContentContainer: {
        paddingRight: 20,
    },
    videoCard: {
        width: 150,
        marginRight: 15,
    },
    videoThumbnail: {
        width: 150,
        height: 100,
        backgroundColor: '#F8F8F8',
        borderRadius: 10,
        overflow: 'hidden',
    },
    videoImage: {
        width: '100%',
        height: '100%',
    },
    videoPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
    },
    videoTitle: {
        marginTop: 8,
        fontSize: 14,
        color: '#1A1A1A',
    },
    videoDuration: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    coursesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    courseCard: {
        width: '48%',
        marginBottom: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    courseThumbnail: {
        width: '100%',
        height: 120,
        backgroundColor: '#4CAF50',
    },
    courseIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    courseTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginTop: 10,
        marginHorizontal: 12,
    },
    courseInfo: {
        padding: 12,
        paddingTop: 4,
    },
    instructorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    instructorText: {
        fontSize: 12,
        color: '#666',
    },
    statsText: {
        fontSize: 12,
        color: '#666',
    },
    courseImage: {
        width: '100%',
        height: '100%',
    },
    greetingContainer: {
        padding: 20,
        paddingBottom: 0,
    },
    greetingText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    usernameText: {
        fontSize: 18,
        color: '#666',
        marginTop: 4,
    },
});

export default Index;