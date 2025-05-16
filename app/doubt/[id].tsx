import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { getDoubtWithReplies, addDoubtReply, markDoubtAsResolved, formatDate } from '@/utils/services/doubts';
import { Doubt, DoubtReply } from '@/types/database.types';
import { useAuth } from '@/hooks/useAuth';

export default function DoubtDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, initialized } = useAuth();
  const [doubt, setDoubt] = useState<Doubt | null>(null);
  const [replies, setReplies] = useState<DoubtReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialized) {
      if (session) {
        fetchDoubtDetails();
      } else {
        setLoading(false);
        Alert.alert(
          'Authentication Required',
          'You need to sign in to view doubt details',
          [{ text: 'OK', onPress: () => router.push('/signin') }]
        );
      }
    }
  }, [initialized, session, id]);

  const fetchDoubtDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { doubt, replies } = await getDoubtWithReplies(id);
      setDoubt(doubt);
      setReplies(replies);
    } catch (error) {
      console.error('Error fetching doubt details:', error);
      Alert.alert('Error', 'Failed to load doubt details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = async () => {
    if (!session) {
      Alert.alert('Authentication Required', 'You need to sign in to add a reply');
      router.push('/signin');
      return;
    }

    if (!replyContent.trim() || !id) {
      Alert.alert('Error', 'Please enter a reply');
      return;
    }

    setSubmitting(true);
    try {
      const newReply = await addDoubtReply(id, replyContent);
      setReplies([...replies, newReply]);
      setReplyContent('');
    } catch (error) {
      console.error('Error adding reply:', error);
      Alert.alert('Error', 'Failed to add your reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsResolved = async () => {
    if (!session) {
      Alert.alert('Authentication Required', 'You need to sign in to mark a doubt as resolved');
      router.push('/signin');
      return;
    }

    if (!id) return;

    try {
      const updatedDoubt = await markDoubtAsResolved(id);
      setDoubt(updatedDoubt);
      Alert.alert('Success', 'Doubt marked as resolved');
    } catch (error) {
      console.error('Error marking doubt as resolved:', error);
      Alert.alert('Error', 'Failed to mark doubt as resolved');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Doubt Details' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </SafeAreaView>
    );
  }

  if (!doubt) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Doubt Details' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Doubt not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Doubt Details' }} />
      
      <ScrollView style={styles.content}>
        <View style={styles.doubtHeader}>
          <Text style={styles.doubtTitle}>{doubt.title}</Text>
          <View style={styles.statusContainer}>
            <Text style={[
              styles.statusText, 
              doubt.status === 'pending' ? styles.pendingStatus : 
              doubt.status === 'answered' ? styles.answeredStatus : 
              styles.resolvedStatus
            ]}>
              {doubt.status.charAt(0).toUpperCase() + doubt.status.slice(1)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.dateText}>Posted {formatDate(doubt.created_at)}</Text>
        
        <View style={styles.doubtContent}>
          <Text style={styles.descriptionText}>{doubt.description}</Text>
        </View>

        {doubt.status !== 'resolved' && (
          <TouchableOpacity 
            style={styles.resolveButton}
            onPress={handleMarkAsResolved}
          >
            <Text style={styles.resolveButtonText}>Mark as Resolved</Text>
          </TouchableOpacity>
        )}

        <View style={styles.repliesSection}>
          <Text style={styles.repliesSectionTitle}>
            Replies ({replies.length})
          </Text>
          
          {replies.length === 0 ? (
            <Text style={styles.noRepliesText}>No replies yet</Text>
          ) : (
            replies.map((reply) => (
              <View key={reply.id} style={[
                styles.replyItem,
                reply.is_teacher ? styles.teacherReply : {}
              ]}>
                {reply.is_teacher && (
                  <View style={styles.teacherBadge}>
                    <Text style={styles.teacherBadgeText}>Teacher</Text>
                  </View>
                )}
                <Text style={styles.replyContent}>{reply.content}</Text>
                <Text style={styles.replyDate}>{formatDate(reply.created_at)}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.addReplySection}>
          <Text style={styles.addReplyTitle}>Add Your Reply</Text>
          <TextInput
            style={styles.replyInput}
            value={replyContent}
            onChangeText={setReplyContent}
            placeholder="Type your reply here..."
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
            numberOfLines={4}
          />
          <TouchableOpacity 
            style={styles.replyButton}
            onPress={handleAddReply}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.replyButtonText}>Submit Reply</Text>
            )}
          </TouchableOpacity>
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#FF6B6B',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  doubtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  doubtTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 12,
  },
  statusContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pendingStatus: {
    color: '#FFA000',
  },
  answeredStatus: {
    color: '#2196F3',
  },
  resolvedStatus: {
    color: '#4CAF50',
  },
  dateText: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 16,
  },
  doubtContent: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  resolveButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  resolveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  repliesSection: {
    marginBottom: 24,
  },
  repliesSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  noRepliesText: {
    fontSize: 16,
    color: '#999999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  replyItem: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  teacherReply: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  teacherBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  teacherBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  replyContent: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  replyDate: {
    fontSize: 14,
    color: '#999999',
    alignSelf: 'flex-end',
  },
  addReplySection: {
    marginBottom: 24,
  },
  addReplyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  replyInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 120,
  },
  replyButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  replyButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});