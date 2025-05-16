import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { createDoubt } from '@/utils/services/doubts';
import { useAuth } from '@/hooks/useAuth';

export default function AddDoubt() {
  const router = useRouter();
  const { session, initialized } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialized && !session) {
      Alert.alert(
        'Authentication Required',
        'You need to sign in to add a doubt',
        [{ text: 'OK', onPress: () => router.push('/signin') }]
      );
    }
  }, [initialized, session, router]);

  const handleSubmit = async () => {
    if (!session) {
      Alert.alert('Authentication Required', 'You need to sign in to add a doubt');
      router.push('/signin');
      return;
    }

    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await createDoubt(title, description);
      Alert.alert('Success', 'Your doubt has been submitted successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error submitting doubt:', error);
      Alert.alert('Error', 'Failed to submit your doubt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Add New Doubt' }} />
      
      <View style={styles.content}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter a title for your doubt"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your doubt in detail"
          placeholderTextColor="#999"
          multiline
          textAlignVertical="top"
          numberOfLines={6}
        />

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Doubt</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 150,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});