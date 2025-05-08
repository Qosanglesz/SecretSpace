import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator} from 'react-native';
import axios from 'axios';
import {useRouter} from 'expo-router';

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
    const router = useRouter();

    useEffect(() => {
        fetchPlaces();
    }, []);

    const fetchPlaces = async () => {
        try {
            const res = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/places`);

            if (Array.isArray(res.data)) {
                setPlaces(res.data);
            } else {
                console.warn("Fetched data is not an array:", res.data);
                setPlaces([]); // fallback to empty Array
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to fetch places');
        } finally {
            setLoading(false);
        }
    };


    const handleDelete = async (id: string) => {
        Alert.alert('Confirm Delete', 'Are you sure you want to delete this place?', [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await axios.delete(`${process.env.EXPO_PUBLIC_API_URL}/places/${id}`);
                        await fetchPlaces();
                    } catch (err) {
                        console.error(err);
                        Alert.alert('Error', 'Failed to delete');
                    }
                },
            },
        ]);
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#0000ff"/>
                <Text className="mt-2">Loading places...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white p-4">
            <Text className="text-2xl font-bold mb-4">All Places</Text>
            {places.length === 0 ? (
                <Text className="text-gray-500 text-center mt-10">No places found.</Text>
            ) : (
                places.map((place) => (
                    // ...your map logic here
                    <View key={place.place_id} className="border rounded-xl p-4 mb-4 bg-gray-100">
                        <Text className="text-lg font-semibold">{place.name}</Text>
                        <Text className="text-gray-600 mb-1">{place.description}</Text>
                        <Text className="text-xs text-gray-500">
                            Lat: {place.latitude} | Lng: {place.longitude}
                        </Text>

                        {Array.isArray(place.images) && place.images.length > 0 && (
                            <ScrollView horizontal className="my-2">
                                {place.images.map((img, index) => (
                                    <Image
                                        key={index}
                                        source={{uri: `data:image/jpeg;base64,${bufferToBase64(img.image)}`}}
                                        style={{width: 100, height: 100, marginRight: 10, borderRadius: 8}}
                                    />
                                ))}
                            </ScrollView>
                        )}

                        <View className="flex-row justify-between mt-2">
                            <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg">
                                <Text className="text-white">View</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="bg-yellow-500 px-4 py-2 rounded-lg"
                                onPress={() => router.push(`/place/update/${place.place_id}`)}
                            >
                                <Text className="text-white">Update</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="bg-red-500 px-4 py-2 rounded-lg"
                                onPress={() => handleDelete(place.place_id)}
                            >
                                <Text className="text-white">Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            )}
        </ScrollView>
    );
}
