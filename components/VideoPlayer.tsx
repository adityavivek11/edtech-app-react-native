import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Lecture } from '@/types/database.types';

const { width: screenWidth } = Dimensions.get('window');

interface VideoPlayerProps {
    lecture?: Lecture;
    videoUrl?: string;
    onProgress?: (progress: number) => void;
}

export const VideoPlayer = ({ lecture, videoUrl, onProgress }: VideoPlayerProps) => {
    const [status, setStatus] = useState<any>({});
    const video = useRef<Video>(null);
    const insets = useSafeAreaInsets();
    
    // Determine the video URL from either the lecture object or the direct videoUrl prop
    const videoSource = lecture?.video_url || videoUrl;
    
    if (!videoSource) {
        console.error('VideoPlayer: No video source provided');
    }

    useEffect(() => {
        return () => {
            if (video.current) {
                video.current.unloadAsync();
            }
        };
    }, []);

    const handlePlaybackStatusUpdate = (status: any) => {
        setStatus(status);
        if (onProgress && status.isLoaded) {
            const progress = status.positionMillis / status.durationMillis;
            onProgress(progress);
        }
    };

    return (
        <View style={styles.container}>
            {videoSource && (
                <Video
                    ref={video}
                    style={styles.video}
                    source={{
                        uri: videoSource,
                    }}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping={false}
                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                />
            )}
            {(!status.isLoaded || !videoSource) && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        width: '100%',
        aspectRatio: 16/9,
    },
    video: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
}); 