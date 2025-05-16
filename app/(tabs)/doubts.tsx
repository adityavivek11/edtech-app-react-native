import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getUserDoubts, formatDate } from '@/utils/services/doubts';
import { Doubt } from '@/types/database.types';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function Doubts() {
    const router = useRouter();
    const { session, initialized } = useAuth();
    const [doubts, setDoubts] = useState<Doubt[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (initialized) {
            if (session) {
                fetchDoubts();
            } else {
                setLoading(false);
            }
        }
    }, [initialized, session]);

    const fetchDoubts = async () => {
        try {
            const data = await getUserDoubts();
            setDoubts(data);
        } catch (error) {
            console.error('Error fetching doubts:', error);
            Alert.alert('Error', 'Failed to load doubts. Please try again later.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchDoubts();
    };

    const handleAddDoubt = () => {
        router.push('/add-doubt');
    };

    const handleViewDoubt = (doubtId: string) => {
        router.push(`/doubt/${doubtId}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return '#FFA000';
            case 'answered':
                return '#2196F3';
            case 'resolved':
                return '#4CAF50';
            default:
                return '#999999';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Your Doubts</Text>
            </View>
            
            {!initialized ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                </View>
            ) : !session ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Please sign in to view your doubts</Text>
                    <TouchableOpacity 
                        style={styles.signInButton}
                        onPress={() => router.push('/signin')}
                    >
                        <Text style={styles.signInButtonText}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            ) : loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                </View>
            ) : (
                <ScrollView 
                    style={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#4CAF50']}
                        />
                    }
                >
                    {doubts.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>You haven't asked any doubts yet.</Text>
                            <Text style={styles.emptySubtext}>Tap the button below to ask your first doubt.</Text>
                        </View>
                    ) : (
                        doubts.map((doubt) => (
                            <TouchableOpacity 
                                key={doubt.id} 
                                style={styles.doubtCard}
                                onPress={() => handleViewDoubt(doubt.id)}
                            >
                                <Text style={styles.doubtTitle}>{doubt.title}</Text>
                                <Text style={styles.doubtDescription} numberOfLines={2}>
                                    {doubt.description}
                                </Text>
                                <View style={styles.doubtFooter}>
                                    <Text style={styles.doubtDate}>Posted {formatDate(doubt.created_at)}</Text>
                                    <Text style={[
                                        styles.doubtStatus,
                                        { color: getStatusColor(doubt.status) }
                                    ]}>
                                        {doubt.status.charAt(0).toUpperCase() + doubt.status.slice(1)}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}

                    <TouchableOpacity 
                        style={styles.addButton}
                        onPress={handleAddDoubt}
                    >
                        <Text style={styles.addButtonText}>+ Add New Doubt</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        marginTop: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 16,
    },
    signInButton: {
        backgroundColor: '#2196F3',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
        width: 200,
    },
    signInButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    doubtCard: {
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    doubtTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    doubtDescription: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 12,
    },
    doubtFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    doubtDate: {
        fontSize: 14,
        color: '#999999',
    },
    doubtStatus: {
        fontSize: 14,
        fontWeight: '500',
    },
    addButton: {
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    addButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
}); 