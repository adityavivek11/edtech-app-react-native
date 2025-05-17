import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { usePreventScreenCapture } from 'expo-screen-capture';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useNavigation } from 'expo-router';
import { supabase } from '@/utils/supabase';
import type { Lecture } from '@/types/database.types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface VideoPlayerProps {
  lecture?: Lecture;
  videoUrl?: string;
  onProgress?: (progress: number) => void;
}

export const VideoPlayer = ({ lecture, videoUrl, onProgress }: VideoPlayerProps) => {
  usePreventScreenCapture();

  const [usernamePosition, setUsernamePosition] = useState({ top: 10, left: 10 });
  const [videoLayout, setVideoLayout] = useState({ width: 0, height: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const navigation = useNavigation();

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    getUserEmail();
  }, []);

  const videoSource = lecture?.video_url || videoUrl || '';

  if (!videoSource) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const player = useVideoPlayer(videoSource, (player) => {
    player.play();
  });

  useEffect(() => {
    setIsPlaying(player.playing);

    const intervalId = setInterval(() => {
      setIsPlaying(player.playing);
      if (onProgress && player.duration > 0) {
        onProgress(player.currentTime / player.duration);
      }
    }, 200);

    return () => clearInterval(intervalId);
  }, [player, onProgress]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (videoLayout.width > 0 && videoLayout.height > 0) {
        setUsernamePosition({
          top: Math.random() * (videoLayout.height - 30),
          left: Math.random() * (videoLayout.width - 100),
        });
      }
    }, 2000);
    return () => clearInterval(intervalId);
  }, [videoLayout]);

  useEffect(() => {
    if (navigation) {
      navigation.setOptions({ headerShown: !isFullscreen });
    }

    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        isFullscreen
          ? ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
          : ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };

    lockOrientation();

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, [isFullscreen]);

  return (
    <View style={styles.container}>
      <StatusBar hidden={isFullscreen} />

      <View
        style={isFullscreen ? styles.fullscreenVideoWrapper : styles.videoWrapper}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setVideoLayout({ width, height });
        }}
      >
        <VideoView
          style={StyleSheet.absoluteFill}
          player={player}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
        />

        <Text
          style={[
            styles.username,
            {
              top: usernamePosition.top,
              left: usernamePosition.left,
            },
          ]}
        >
          {userEmail || 'Loading...'}
        </Text>

        {!isFullscreen && (
          <TouchableOpacity
            onPress={() => setIsFullscreen(true)}
            style={styles.fullscreenButton}
          >
            <Text style={styles.fullscreenText}>Fullscreen</Text>
          </TouchableOpacity>
        )}
      </View>

      {isFullscreen && (
        <TouchableOpacity
          onPress={() => setIsFullscreen(false)}
          style={styles.exitFullscreenButtonOverlayBase}
        >
          <Text style={styles.fullscreenText}>Exit Fullscreen</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    position: 'relative',
  },
  fullscreenVideoWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: screenHeight,
    width: screenWidth,
    backgroundColor: 'black',
    zIndex: 999,
    elevation: 10,
  },
  username: {
    position: 'absolute',
    color: 'white',
    fontSize: 12,
    fontWeight: 'normal',
    padding: 5,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  fullscreenButton: {
    position: 'absolute',
    top: 10,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    zIndex: 1,
  },
  fullscreenText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  exitFullscreenButtonOverlayBase: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    zIndex: 1000,
  },
});
