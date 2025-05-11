import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    Alert,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    SafeAreaView,
    Linking
} from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { CommentSection } from './CommentSection';

const windowWidth = Dimensions.get('window').width;

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

export default function PlaceDetailScreen() {
    const [place, setPlace] = useState<Place | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    useEffect(() => {
        if (id) {
            fetchPlaceDetails(id as string);
        }
    }, [id]);

    const fetchPlaceDetails = async (placeId: string) => {
        try {
            const res = await axios.get(
                `${process.env.EXPO_PUBLIC_API_URL}/places/${placeId}`
            );
            setPlace(res.data);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to fetch place details');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenMaps = () => {
        if (!place) return;

        const url = `https://maps.google.com/?q=${place.latitude},${place.longitude}`;
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Alert.alert('Error', 'Cannot open maps application');
            }
        });
    };

    const handleScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const imageIndex = Math.round(contentOffsetX / windowWidth);
        setCurrentImageIndex(imageIndex);
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-4 text-gray-600 font-medium">Loading place details...</Text>
            </View>
        );
    }

    if (!place) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
                <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
                <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                <Text className="text-xl font-bold text-red-500 mt-4">Place not found</Text>
                <Text className="text-gray-500 mt-2 text-center px-4">
                    The place you're looking for doesn't exist or has been removed.
                </Text>
                <TouchableOpacity
                    className="mt-8 bg-blue-500 px-6 py-3 rounded-lg"
                    onPress={() => router.back()}
                >
                    <Text className="text-white font-medium">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const hasImages = Array.isArray(place.images) && place.images.length > 0;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" backgroundColor="#1F2937" />

            {/* Header */}
            <View className="bg-gray-800 absolute top-0 left-0 right-0 z-10 pt-12 pb-4 px-4">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        className="p-2"
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text className="text-white font-bold text-lg ml-2 flex-1" numberOfLines={1}>
                        {place.name}
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1 mt-24">
                {/* Image Gallery */}
                {hasImages ? (
                    <View className="relative">
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={handleScroll}
                            scrollEventThrottle={16}
                        >
                            {place.images!.map((img, index) => (
                                <Image
                                    key={index}
                                    source={{ uri: `data:image/jpeg;base64,${bufferToBase64(img.image)}` }}
                                    style={{
                                        width: windowWidth,
                                        height: windowWidth * 0.67,
                                    }}
                                    resizeMode="cover"
                                />
                            ))}
                        </ScrollView>

                        {/* Image counter */}
                        {place.images!.length > 1 && (
                            <View className="absolute bottom-3 right-3 bg-black/60 px-3 py-1 rounded-full">
                                <Text className="text-white text-xs font-medium">
                                    {currentImageIndex + 1} / {place.images!.length}
                                </Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View
                        className="bg-gray-200 items-center justify-center"
                        style={{ width: windowWidth, height: windowWidth * 0.5 }}
                    >
                        <Ionicons name="image-outline" size={64} color="#A0AEC0" />
                        <Text className="text-gray-500 text-sm mt-2">No images available</Text>
                    </View>
                )}

                {/* Place Details */}
                <View className="p-5">
                    <Text className="text-3xl font-bold text-gray-800">{place.name}</Text>

                    <View className="flex-row items-center mt-2 mb-4">
                        <TouchableOpacity
                            className="flex-row items-center"
                            onPress={handleOpenMaps}
                        >
                            <Ionicons name="location" size={18} color="#3B82F6" />
                            <Text className="text-blue-500 ml-1 font-medium text-sm">
                                {place.latitude}, {place.longitude}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="bg-white p-4 rounded-xl shadow-sm mb-5">
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="information-circle-outline" size={20} color="#4B5563" />
                            <Text className="text-lg font-bold text-gray-800 ml-2">About this place</Text>
                        </View>
                        <Text className="text-gray-700 leading-relaxed">
                            {place.description}
                        </Text>
                    </View>

                    {/* Map */}
                    <View className="bg-white p-4 rounded-xl shadow-sm mb-8">
                        <View className="flex-row justify-between items-center mb-2">
                            <View className="flex-row items-center">
                                <Ionicons name="map-outline" size={20} color="#4B5563" />
                                <Text className="text-lg font-bold text-gray-800 ml-2">Location</Text>
                            </View>
                            <TouchableOpacity
                                className="flex-row items-center"
                                onPress={handleOpenMaps}
                            >
                                <Text className="text-blue-500 text-sm font-medium mr-1">Open in Maps</Text>
                                <Ionicons name="open-outline" size={16} color="#3B82F6" />
                            </TouchableOpacity>
                        </View>

                        <View className="rounded-xl overflow-hidden" style={{ height: 250 }}>
                            <MapView
                                style={{ flex: 1 }}
                                initialRegion={{
                                    latitude: parseFloat(place.latitude),
                                    longitude: parseFloat(place.longitude),
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: parseFloat(place.latitude),
                                        longitude: parseFloat(place.longitude),
                                    }}
                                    title={place.name}
                                >
                                    <View className="bg-blue-500 p-2 rounded-full border-2 border-white">
                                        <Ionicons name="location" size={20} color="#FFFFFF" />
                                    </View>
                                </Marker>
                            </MapView>
                        </View>
                    </View>
                </View>
            </ScrollView>
            <CommentSection 
                placeId={id} 
                onCommentAdded={() => fetchPlaceDetails(id)}
            />
        </SafeAreaView>
    );
}