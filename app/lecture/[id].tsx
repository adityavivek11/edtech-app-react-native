import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { VideoPlayer } from '@/components/VideoPlayer';
import { lectureService } from '@/utils/services/lectures';
import type { Lecture } from '@/types/database.types';
import { supabase } from '@/utils/supabase';

export default function LectureDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [lecture, setLecture] = useState<Lecture | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        if (!id) {
            setError('No lecture ID provided');
            setLoading(false);
            return;
        }
        loadLecture();
        checkUser();
    }, [id]);

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            setUser(session.user);
        }
    };

    const loadLecture = async () => {
        try {
            const lectureData = await lectureService.getLectureById(id);
            if (!lectureData) {
                setError('Lecture not found');
                return;
            }
            setLecture(lectureData);
        } catch (error) {
            console.error('Error loading lecture:', error);
            setError('Failed to load lecture');
        } finally {
            setLoading(false);
        }
    };

    const handleProgress = async (progress: number) => {
        if (user) {
            try {
                await lectureService.updateLectureProgress(user.id, id, progress);
            } catch (error) {
                console.error('Error updating progress:', error);
            }
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
            </View>
            </SafeAreaView>
        );
    }

    if (!lecture) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Lecture not found</Text>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
            </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
            <VideoPlayer lecture={lecture} onProgress={handleProgress} />
            <View style={styles.content}>
                <Text style={styles.title}>{lecture.title}</Text>
                {lecture.description && (
                    <Text style={styles.description}>{lecture.description}</Text>
                )}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#FF0000',
        marginBottom: 20,
        textAlign: 'center',
    },
    backButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1A1A1A',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#666666',
    },
}); 