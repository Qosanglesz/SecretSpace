import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TextInput, Text, Image, ScrollView, Alert, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

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

export default function UpdatePlaceScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [place, setPlace] = useState<Place | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlace = async () => {
            try {
                const res = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/places/${id}`);
                const placeData = res.data;

                setPlace(placeData);
                setName(placeData.name);
                setDescription(placeData.description);
                setLatitude(placeData.latitude.toString());
                setLongitude(placeData.longitude.toString());

                // Pre-fill images
                if (Array.isArray(placeData.images)) {
                    setImages(placeData.images.map((img: ImageBuffer) => ({ uri: `data:image/jpeg;base64,${bufferToBase64(img.image)}` })));
                }
            } catch (err) {
                console.error(err);
                Alert.alert('Error', 'Failed to load place data.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchPlace();
    }, [id]);

    const pickImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsMultipleSelection: true,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });

        if (!result.canceled) {
            setImages(result.assets);
        }
    };

    const handleUpdate = async () => {
        const formData = new FormData();

        formData.append('name', name);
        formData.append('description', description);
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);

        images.forEach((img, index) => {
            formData.append('images', {
                uri: img.uri,
                name: `image_${index}.jpg`,
                type: 'image/jpeg',
            } as any);
        });

        try {
            await axios.put(`${process.env.EXPO_PUBLIC_API_URL}/places/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Alert.alert('Success', 'Place updated!');
            router.push('/');
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to update place');
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#0000ff" />
                <Text className="mt-2">Loading place...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white px-6 pt-10" contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
            <Text className="text-2xl font-semibold mb-4">Update Place</Text>

            <Text className="text-sm font-medium mb-1">Name</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Place name" className="border border-gray-300 rounded-xl p-3 mb-4" />

            <Text className="text-sm font-medium mb-1">Description</Text>
            <TextInput
                value={description}
                onChangeText={setDescription}
                multiline
                placeholder="Description..."
                className="border border-gray-300 rounded-xl p-3 mb-4 h-24 text-start text-gray-700"
            />

            <Text className="text-sm font-medium mb-2">Select Location</Text>
            <View className="h-64 rounded-xl overflow-hidden mb-4">
                <MapView
                    style={{ flex: 1 }}
                    region={
                        latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))
                            ? {
                                latitude: parseFloat(latitude),
                                longitude: parseFloat(longitude),
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }
                            : undefined
                    }
                    onPress={(e: MapPressEvent) => {
                        const { latitude, longitude } = e.nativeEvent.coordinate;
                        setLatitude(latitude.toString());
                        setLongitude(longitude.toString());
                    }}
                >
                    {latitude && longitude && (
                        <Marker
                            coordinate={{
                                latitude: parseFloat(latitude),
                                longitude: parseFloat(longitude),
                            }}
                        />
                    )}
                </MapView>
            </View>

            <Text className="text-sm font-medium mb-1">Latitude</Text>
            <TextInput
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="decimal-pad"
                className="border border-gray-300 rounded-xl p-3 mb-2"
            />

            <Text className="text-sm font-medium mb-1">Longitude</Text>
            <TextInput
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="decimal-pad"
                className="border border-gray-300 rounded-xl p-3 mb-4"
            />

            <TouchableOpacity onPress={pickImages} className="bg-blue-600 rounded-xl py-3 px-4 mb-4">
                <Text className="text-white text-center font-semibold">Pick Images</Text>
            </TouchableOpacity>

            {images.length > 0 && (
                <ScrollView horizontal className="mb-4">
                    {images.map((img, index) => (
                        <Image key={index} source={{ uri: img.uri }} className="w-24 h-24 mr-2 rounded-lg" />
                    ))}
                </ScrollView>
            )}

            <TouchableOpacity onPress={handleUpdate} className="bg-green-600 rounded-xl py-3 px-4">
                <Text className="text-white text-center font-semibold">Update</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
