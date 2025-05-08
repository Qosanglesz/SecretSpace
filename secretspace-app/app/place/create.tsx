import React, { useState } from 'react';
import { TextInput, Text, Image, ScrollView, Alert, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useRouter } from 'expo-router';


export default function CreatePlaceScreen() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

    const pickImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsMultipleSelection: true,
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ this is correct
        });

        if (!result.canceled) {
            setImages(result.assets);
        }
    };

    const handleSubmit = async () => {
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
            await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/places`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Alert.alert('Success', 'Place created!');
            router.push('/');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Something went wrong');
        }
    };

    return (
        <ScrollView className="flex-1 bg-white px-6 pt-10">
            <Text className="text-2xl font-semibold mb-4">Create New Place</Text>

            <Text className="text-sm font-medium mb-1">Name</Text>
            <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Place name"
                className="border border-gray-300 rounded-xl p-3 mb-4"
            />

            <Text className="text-sm font-medium mb-1">Description</Text>
            <TextInput
                value={description}
                onChangeText={setDescription}
                multiline
                placeholder="Description..."
                className="border border-gray-300 rounded-xl p-3 mb-4 h-24 text-start text-gray-700"
            />

            <Text className="text-sm font-medium mb-1">Latitude</Text>
            <TextInput
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="decimal-pad"
                placeholder="e.g. 13.7563"
                className="border border-gray-300 rounded-xl p-3 mb-4"
            />

            <Text className="text-sm font-medium mb-1">Longitude</Text>
            <TextInput
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="decimal-pad"
                placeholder="e.g. 100.5018"
                className="border border-gray-300 rounded-xl p-3 mb-4"
            />

            <TouchableOpacity
                onPress={pickImages}
                className="bg-blue-600 rounded-xl py-3 px-4 mb-4"
            >
                <Text className="text-white text-center font-semibold">Pick Images</Text>
            </TouchableOpacity>

            {images.length > 0 && (
                <ScrollView horizontal className="mb-4">
                    {images.map((img, index) => (
                        <Image
                            key={index}
                            source={{ uri: img.uri }}
                            className="w-24 h-24 mr-2 rounded-lg"
                        />
                    ))}
                </ScrollView>
            )}

            <TouchableOpacity
                onPress={handleSubmit}
                className="bg-green-600 rounded-xl py-3 px-4"
            >
                <Text className="text-white text-center font-semibold">Submit</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
