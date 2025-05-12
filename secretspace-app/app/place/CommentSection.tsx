import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StyleSheet,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add this component to your PlaceDetailScreen.tsx file
export const CommentSection = ({ placeId, onCommentAdded }) => {
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [averageRating, setAverageRating] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check if user is logged in
    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('jwt');
            setIsLoggedIn(!!token);
        };
        checkAuth();
    }, []);

    // Fetch comments and average rating
    useEffect(() => {
        if (placeId) {
            fetchComments();
            fetchAverageRating();
        }
    }, [placeId]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                `${process.env.EXPO_PUBLIC_API_URL}/places/${placeId}/comments`
            );
            setComments(res.data);
        } catch (err) {
            console.error('Error fetching comments:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAverageRating = async () => {
        try {
            const res = await axios.get(
                `${process.env.EXPO_PUBLIC_API_URL}/places/${placeId}/rating`
            );
            setAverageRating(res.data.average);
        } catch (err) {
            console.error('Error fetching rating:', err);
        }
    };

    const handleSubmit = async () => {
        if (!isLoggedIn) {
            Alert.alert('Login Required', 'Please login to add a comment');
            return;
        }

        if (!comment.trim()) {
            Alert.alert('Error', 'Please enter a comment');
            return;
        }

        if (rating === 0) {
            Alert.alert('Error', 'Please select a rating');
            return;
        }

        setSubmitting(true);
        try {
            const token = await AsyncStorage.getItem('jwt');
            
            // First create the comment
            const commentRes = await axios.post(
                `${process.env.EXPO_PUBLIC_API_URL}/places/comments`,
                {
                    content: comment,
                    place_id: placeId
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            // Then create the rating linked to the comment
            await axios.post(
                `${process.env.EXPO_PUBLIC_API_URL}/places/ratings`,
                {
                    value: rating,
                    place_id: placeId,
                    comment_id: commentRes.data.comment_id
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            // Clear form and refresh data
            setComment('');
            setRating(0);
            fetchComments();
            fetchAverageRating();
            
            if (onCommentAdded) {
                onCommentAdded();
            }
            
            Alert.alert('Success', 'Your review has been submitted');
        } catch (err) {
            console.error('Error submitting review:', err);
            Alert.alert('Error', 'Failed to submit your review');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (value, interactive = false) => {
        return (
            <View className="flex-row">
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => interactive && setRating(star)}
                        disabled={!interactive}
                    >
                        <Ionicons
                            name={star <= value ? "star" : "star-outline"}
                            size={interactive ? 32 : 16}
                            color={star <= value ? "#FFD700" : "#A0AEC0"}
                            style={{ marginRight: 2 }}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="bg-white p-4 rounded-xl shadow-sm mb-8"
        >
            <View className="flex-row items-center mb-4">
                <Ionicons name="chatbubble-outline" size={20} color="#4B5563" />
                <Text className="text-lg font-bold text-gray-800 ml-2">Reviews</Text>
                {averageRating > 0 && (
                    <View className="flex-row items-center ml-auto">
                        <Text className="text-gray-700 mr-1">{averageRating.toFixed(1)}</Text>
                        {renderStars(Math.round(averageRating))}
                    </View>
                )}
            </View>

            {/* Add review form */}
            <View className="mb-6 bg-gray-50 p-3 rounded-lg">
                <Text className="font-semibold text-gray-700 mb-2">Write a review</Text>
                
                <View className="mb-3 items-center">
                    {renderStars(rating, true)}
                </View>
                
                <TextInput
                    value={comment}
                    onChangeText={setComment}
                    placeholder="Share your experience..."
                    multiline
                    className="bg-white border border-gray-200 rounded-lg p-3 min-h-[80px] text-gray-700"
                />
                
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={submitting}
                    className={`mt-3 p-3 rounded-lg ${submitting ? 'bg-blue-300' : 'bg-blue-500'}`}
                >
                    {submitting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text className="text-white font-semibold text-center">Submit Review</Text>
                    )}
                </TouchableOpacity>
                
                {!isLoggedIn && (
                    <Text className="text-red-500 text-xs mt-2 text-center">
                        You need to be logged in to submit a review
                    </Text>
                )}
            </View>

            {/* Comments list */}
            {loading ? (
                <ActivityIndicator size="small" color="#3B82F6" />
            ) : comments.length > 0 ? (
                <View>
                    {comments.map((item) => (
                        <View key={item.comment_id} className="mb-4 border-b border-gray-100 pb-3">
                            <View className="flex-row justify-between items-center mb-1">
                                <Text className="font-semibold text-gray-800">
                                    {item.user?.username || 'Anonymous'}
                                </Text>
                                <Text className="text-gray-500 text-xs">
                                    {formatDate(item.created_at)}
                                </Text>
                            </View>
                            
                            {item.rating && (
                                <View className="mb-1">
                                    {renderStars(item.rating.value)}
                                </View>
                            )}
                            
                            <Text className="text-gray-700">{item.content}</Text>
                        </View>
                    ))}
                </View>
            ) : (
                <View className="items-center py-4">
                    <Ionicons name="chatbubbles-outline" size={40} color="#CBD5E0" />
                    <Text className="text-gray-500 mt-2">No reviews yet. Be the first!</Text>
                </View>
            )}
        </KeyboardAvoidingView>
    );
};

// Add this to your PlaceDetailScreen component's return statement
// Inside the ScrollView, after the Map section:
/*
<CommentSection 
    placeId={id} 
    onCommentAdded={() => fetchPlaceDetails(id)}
/>
*/