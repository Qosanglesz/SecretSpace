import React, { useEffect, useState } from 'react';
import { View, Text, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import {useLocalSearchParams, useRouter} from 'expo-router';
import MapView, { Marker } from 'react-native-maps';

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
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    useEffect(() => {
        if (id) {
            fetchPlaceDetails(id as string);
        }
    }, [id]);

    const fetchPlaceDetails = async (placeId: string) => {
        try {
            const res = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/places/${placeId}`);
            setPlace(res.data);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to fetch place details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#0000ff" />
                <Text className="mt-2">Loading place details...</Text>
            </View>
        );
    }

    if (!place) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text className="text-red-500">Place not found</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white p-4">
            <Text className="text-2xl font-bold mb-4">{place.name}</Text>
            <Text className="text-lg text-gray-600 mb-4">{place.description}</Text>

            {Array.isArray(place.images) && place.images.length > 0 && (
                <ScrollView horizontal pagingEnabled className="my-4">
                    {place.images.map((img, index) => (
                        <Image
                            key={index}
                            source={{ uri: `data:image/jpeg;base64,${bufferToBase64(img.image)}` }}
                            style={{
                                width: 360, // Adjust this based on screen size or use Dimensions.get('window').width
                                height: 240,
                                marginRight: 10,
                                borderRadius: 12,
                            }}
                            resizeMode="cover"
                        />
                    ))}
                </ScrollView>

            )}

            <Text className="text-xs text-gray-500 mb-4">
                Latitude: {place.latitude} | Longitude: {place.longitude}
            </Text>

            <View className="mb-4" style={{ height: 300 }}>
                <MapView
                    style={{ flex: 1 }}
                    initialRegion={{
                        latitude: parseFloat(place.latitude),
                        longitude: parseFloat(place.longitude),
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                >
                    <Marker
                        coordinate={{
                            latitude: parseFloat(place.latitude),
                            longitude: parseFloat(place.longitude),
                        }}
                        title={place.name}
                    />
                </MapView>
            </View>
        </ScrollView>
    );
}
