import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

type Place = {
    place_id: string;
    name: string;
    description: string;
    latitude: string;
    longitude: string;
    image: any; // base64 or URL
};

function bufferToBase64(buffer: { data: number[] }): string {
    const binary = buffer.data.map((b) => String.fromCharCode(b)).join('');
    return btoa(binary);
}


export default function AllPlacesScreen() {
    const [places, setPlaces] = useState<Place[]>([]);
    const router = useRouter();

    useEffect(() => {
        fetchPlaces();
    }, []);

    const fetchPlaces = async () => {
        try {
            const res = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/places`);
            setPlaces(res.data);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to fetch places');
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
                        fetchPlaces(); // Refresh
                    } catch (err) {
                        console.error(err);
                        Alert.alert('Error', 'Failed to delete');
                    }
                },
            },
        ]);
    };


    return (
        <ScrollView className="flex-1 bg-white p-4">
            <Text className="text-2xl font-bold mb-4">All Places</Text>

            {places.map((place) => (
                <View key={place.place_id} className="border rounded-xl p-4 mb-4 bg-gray-100">
                    <Text className="text-lg font-semibold">{place.name}</Text>
                    <Text className="text-gray-600 mb-1">{place.description}</Text>
                    <Text className="text-xs text-gray-500">
                        Lat: {place.latitude} | Lng: {place.longitude}
                    </Text>

                    {place.image && (
                        <Image
                            source={{ uri: `data:image/jpeg;base64,${bufferToBase64(place.image)}` }}
                            style={{ width: 100, height: 100 }}
                        />
                    )}

                    <View className="flex-row justify-between mt-2">
                        <TouchableOpacity
                            className="bg-blue-500 px-4 py-2 rounded-lg"
                            // onPress={() => router.push(`/places/${place.place_id}`)}
                        >
                            <Text className="text-white">View</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-yellow-500 px-4 py-2 rounded-lg"
                            // onPress={() => router.push(`/places/update/${place.place_id}`)}
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
            ))}
        </ScrollView>
    );
}
