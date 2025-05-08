import React, { useState } from 'react';
import { TextInput, Text, Image, ScrollView, Alert, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useRouter } from 'expo-router';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { View } from 'react-native';


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
        <ScrollView
            className="flex-1 bg-white px-6 pt-10"
            contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
        >
            <View className="flex-1">
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

                <Text className="text-sm font-medium mb-2">Select Location</Text>
                <View className="h-64 rounded-xl overflow-hidden mb-4">
                    <MapView
                        style={{ flex: 1 }}
                        initialRegion={{
                            latitude: 13.7563,
                            longitude: 100.5018,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        }}
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
                        {latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude)) && (
                            <Marker
                                coordinate={{
                                    latitude: parseFloat(latitude),
                                    longitude: parseFloat(longitude),
                                }}
                            />
                        )}
                    </MapView>
                </View>

                <View className="mb-4">
                    <Text className="text-sm font-medium mb-1">Latitude</Text>
                    <TextInput
                        value={latitude}
                        onChangeText={(text) => setLatitude(text)}
                        keyboardType="decimal-pad"
                        placeholder="e.g. 13.7563"
                        className="border border-gray-300 rounded-xl p-3 mb-2"
                    />

                    <Text className="text-sm font-medium mb-1">Longitude</Text>
                    <TextInput
                        value={longitude}
                        onChangeText={(text) => setLongitude(text)}
                        keyboardType="decimal-pad"
                        placeholder="e.g. 100.5018"
                        className="border border-gray-300 rounded-xl p-3"
                    />
                </View>

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
                    className="bg-green-600 rounded-xl py-3 px-4 mb-10"
                >
                    <Text className="text-white text-center font-semibold">Submit</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

}
