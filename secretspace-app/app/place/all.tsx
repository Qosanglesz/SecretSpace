import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
    StatusBar
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from '@expo/vector-icons';

type ImageBuffer = {
    image: {
        data: number[];
    };
};

type Place = {
    place_id: string;
    name: string;
    description: string;
    latitude: string;
    longitude: string;
    images?: ImageBuffer[];
};

function bufferToBase64(buffer: { data: number[] }): string {
    const binary = buffer.data.map((b) => String.fromCharCode(b)).join('');
    return btoa(binary);
}

export default function AllPlacesScreen() {
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchPlaces();
    }, []);

    const fetchPlaces = async () => {
        try {
            const token = await AsyncStorage.getItem('jwt');
            const res = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/places`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

            if (Array.isArray(res.data)) {
                setPlaces(res.data);
            } else {
                console.warn("Fetched data is not an array:", res.data);
                setPlaces([]);
            }
        } catch (err) {
            Alert.alert('Error', (err as Error).message || 'Failed to fetch places');
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchPlaces();
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this place?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const token = await AsyncStorage.getItem('jwt');
                            await axios.delete(`${process.env.EXPO_PUBLIC_API_URL}/places/${id}`,
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                });
                            await fetchPlaces();
                        } catch (err) {
                            console.error(err);
                            Alert.alert('Error', 'Failed to delete');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const renderPlaceCard = (place: Place) => {
        return (
            <View key={place.place_id} className="mb-4 bg-white rounded-2xl overflow-hidden shadow-md">
                {/* Image gallery with indicator of how many images there are */}
                {Array.isArray(place.images) && place.images.length > 0 ? (
                    <View className="relative">
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            className="w-full h-48"
                        >
                            {place.images.map((img, index) => (
                                <Image
                                    key={index}
                                    source={{uri: `data:image/jpeg;base64,${bufferToBase64(img.image)}`}}
                                    className="w-full h-full"
                                    style={{ width: 400 }}
                                    resizeMode="cover"
                                />
                            ))}
                        </ScrollView>
                        {place.images.length > 1 && (
                            <View className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded-full">
                                <Text className="text-white text-xs">{place.images.length} photos</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View className="w-full h-32 bg-gray-200 items-center justify-center">
                        <Ionicons name="image-outline" size={48} color="#A0AEC0" />
                        <Text className="text-gray-500 text-xs mt-1">No images</Text>
                    </View>
                )}

                {/* Place details */}
                <View className="p-4">
                    <Text className="text-xl font-bold text-gray-800">{place.name}</Text>

                    <View className="flex-row items-center mt-1 mb-2">
                        <Ionicons name="location-outline" size={16} color="#4B5563" />
                        <Text className="text-xs text-gray-500 ml-1">
                            {place.latitude}, {place.longitude}
                        </Text>
                    </View>

                    <Text className="text-gray-600 text-sm mb-4" numberOfLines={2}>
                        {place.description}
                    </Text>

                    {/* Action buttons */}
                    <View className="flex-row justify-between">
                        <TouchableOpacity
                            className="flex-row items-center justify-center bg-blue-500 px-4 py-2 rounded-lg flex-1 mr-2"
                            onPress={() => router.push(`/place/${place.place_id}`)}
                        >
                            <Ionicons name="eye-outline" size={16} color="#FFFFFF" />
                            <Text className="text-white font-medium ml-1">View</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center justify-center bg-amber-500 px-4 py-2 rounded-lg flex-1 mr-2"
                            onPress={() => router.push(`/place/update/${place.place_id}`)}
                        >
                            <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                            <Text className="text-white font-medium ml-1">Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center justify-center bg-red-500 px-4 py-2 rounded-lg flex-1"
                            onPress={() => handleDelete(place.place_id)}
                        >
                            <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                            <Text className="text-white font-medium ml-1">Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-4 text-gray-600 font-medium">Loading places...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 shadow-sm">
                <Text className="text-2xl font-bold text-gray-800">My Places</Text>
                <Text className="text-sm text-gray-500">Discover and manage your saved locations</Text>
            </View>

            {/* Places list */}
            <ScrollView
                className="flex-1 px-4 pt-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3B82F6"]} />
                }
            >
                {places.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <Ionicons name="location-outline" size={64} color="#CBD5E0" />
                        <Text className="text-gray-500 text-center mt-4 text-lg">No places found</Text>
                        <Text className="text-gray-400 text-center mt-1">Add your first place to get started</Text>
                        <TouchableOpacity
                            className="mt-6 bg-blue-500 px-6 py-3 rounded-lg flex-row items-center"
                            onPress={() => router.push('/place/create')}
                        >
                            <Ionicons name="add-outline" size={20} color="#FFFFFF" />
                            <Text className="text-white font-medium ml-1">Add New Place</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {places.map(renderPlaceCard)}
                        <View className="h-6" />
                    </>
                )}
            </ScrollView>

            {/* Floating action button to add new place */}
            {places.length > 0 && (
                <TouchableOpacity
                    className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
                    onPress={() => router.push('/place/create')}
                >
                    <Ionicons name="add-outline" size={32} color="#FFFFFF" />
                </TouchableOpacity>
            )}
        </View>
    );
}