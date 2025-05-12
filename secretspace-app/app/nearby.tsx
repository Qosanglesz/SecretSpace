import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    SafeAreaView,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

type Place = {
    place_id: string;
    name: string;
    description: string;
    latitude: string;
    longitude: string;
};

export default function NearbyScreen() {
    // Get URL parameters
    const params = useLocalSearchParams();
    
    const [latitude, setLatitude] = useState<string>('');
    const [longitude, setLongitude] = useState<string>('');
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number } | null>(
        null
    );
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    // Use a ref to track if we've already fetched places for the current location
    const lastFetchedLocation = useRef<string>('');
    
    // Check for parameters from AI suggestions
    useEffect(() => {
        if (params.lat && params.lng) {
            // console.log('Received coordinates from params:', params.lat, params.lng);
            setLatitude(params.lat as string);
            setLongitude(params.lng as string);
            
            // If coming from AI, automatically search for nearby places
            if (params.fromAI === 'true') {
                const timer = setTimeout(() => {
                    const locationKey = `${params.lat},${params.lng}`;
                    if (lastFetchedLocation.current !== locationKey) {
                        fetchNearbyPlaces();
                        lastFetchedLocation.current = locationKey;
                    }
                }, 500); // Short delay to ensure state is updated
                return () => clearTimeout(timer);
            }
        } else {
            // If no params, get current location
            handleUseCurrentLocation();
        }
    }, [params]); // Run when params change

    // Sync marker if lat/lon input changes
    useEffect(() => {
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        if (!isNaN(lat) && !isNaN(lon)) {
            setSelectedLocation({ lat, lon });
        }
    }, [latitude, longitude]);

    const handleMapPress = (e: any) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setLatitude(latitude.toString());
        setLongitude(longitude.toString());
        setSelectedLocation({ lat: latitude, lon: longitude });
        
        // Reset the last fetched location so we can fetch again if the user presses Search
        lastFetchedLocation.current = '';
    };

    const handleUseCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Location access is required');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            setLatitude(latitude.toString());
            setLongitude(longitude.toString());
            setSelectedLocation({ lat: latitude, lon: longitude });
            
            // Reset the last fetched location so we can fetch again
            lastFetchedLocation.current = '';
        } catch (error) {
            console.error('Error getting location:', error);
            Alert.alert('Location Error', 'Could not get your current location');
        }
    };

    const fetchNearbyPlaces = async () => {
        if (!latitude || !longitude) {
            Alert.alert('Missing location', 'Please select a location');
            return;
        }
        
        // Check if we've already fetched for this location
        const locationKey = `${latitude},${longitude}`;
        if (lastFetchedLocation.current === locationKey) {
            // console.log('Already fetched places for this location');
            return;
        }

        setLoading(true);
        try {
            const apiUrl = process.env.EXPO_PUBLIC_API_URL;
            if (!apiUrl) {
                throw new Error('API URL is not defined');
            }

            // console.log(`Fetching places near ${latitude}, ${longitude}`);
            
            const res = await axios.get(`${apiUrl}/places/nearby`, {
                params: {
                    lat: latitude,
                    lng: longitude,
                    radius: 0.5,
                },
                timeout: 10000, // 10 seconds timeout
            });
            
            // Update the last fetched location
            lastFetchedLocation.current = locationKey;
            
            setPlaces(res.data || []);
            // console.log(`Found ${res.data.length} places nearby`);
        } catch (err) {
            console.error('Failed to fetch places:', err);
            if (axios.isAxiosError(err) && err.message === 'Network Error') {
                Alert.alert('Connection Error', 'Cannot connect to the server. Please check your internet connection.');
            } else {
                Alert.alert('Error', 'Failed to fetch nearby places');
            }
        } finally {
            setLoading(false);
        }
    };

    // Toggle input area visibility
    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const screenHeight = Dimensions.get('window').height;
    const mapHeight = isCollapsed ? screenHeight * 0.85 : screenHeight * 0.6;
    const inputHeight = isCollapsed ? screenHeight * 0.15 : screenHeight * 0.25;
    
    // Memoize the results panel to prevent unnecessary re-renders
    const ResultsPanel = React.useMemo(() => {
        if (loading || places.length === 0) return null;
        
        return (
            <View className="absolute bottom-0 left-0 right-0 bg-white p-3 border-t border-gray-200">
                <Text className="font-semibold mb-1">Nearby Places ({places.length})</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 4 }}
                >
                    {places.map((place) => (
                        <TouchableOpacity
                            key={place.place_id}
                            onPress={() => router.push(`/place/${place.place_id}`)}
                            className="bg-gray-100 rounded-lg p-2 mr-2 shadow"
                        >
                            <Text className="font-semibold">{place.name}</Text>
                            <Text className="text-xs text-gray-500 w-32" numberOfLines={2}>
                                {place.description}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    }, [places, loading]);

    return (
        <SafeAreaView className="flex-1 bg-white">
            
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Map View */}
                <View style={{ height: mapHeight }}>
                    <MapView
                        style={{ flex: 1 }}
                        onPress={handleMapPress}
                        region={
                            selectedLocation
                                ? {
                                    latitude: selectedLocation.lat,
                                    longitude: selectedLocation.lon,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }
                                : {
                                    latitude: 13.7563,
                                    longitude: 100.5018,
                                    latitudeDelta: 0.05,
                                    longitudeDelta: 0.05,
                                }
                        }
                    >
                        {selectedLocation && (
                            <Marker
                                coordinate={{
                                    latitude: selectedLocation.lat,
                                    longitude: selectedLocation.lon,
                                }}
                                title="Selected Location"
                                pinColor="blue"
                            />
                        )}

                        {places.map((place) => (
                            <Marker
                                key={place.place_id}
                                coordinate={{
                                    latitude: parseFloat(place.latitude),
                                    longitude: parseFloat(place.longitude),
                                }}
                                title={place.name}
                                description={place.description}
                                onCalloutPress={() => router.push(`/place/${place.place_id}`)}
                            />
                        ))}
                    </MapView>

                    {/* Collapse toggle button */}
                    <TouchableOpacity
                        onPress={toggleCollapse}
                        className="absolute top-2 right-2 bg-white rounded-full p-2 shadow"
                    >
                        <Text>{isCollapsed ? '⬇️' : '⬆️'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Input Area */}
                <View style={{ height: inputHeight }} className="bg-white px-4 pt-2">
                    <ScrollView keyboardShouldPersistTaps="handled">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-lg font-semibold">Location</Text>
                            <TouchableOpacity
                                className="bg-blue-600 py-1 px-3 rounded-xl"
                                onPress={handleUseCurrentLocation}
                            >
                                <Text className="text-white text-xs font-semibold">My Location</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row gap-2 mb-2">
                            <TextInput
                                value={latitude}
                                onChangeText={(text) => {
                                    setLatitude(text);
                                    lastFetchedLocation.current = ''; // Reset when input changes
                                }}
                                keyboardType="decimal-pad"
                                placeholder="Latitude"
                                className="border border-gray-300 rounded-xl p-2 flex-1"
                            />

                            <TextInput
                                value={longitude}
                                onChangeText={(text) => {
                                    setLongitude(text);
                                    lastFetchedLocation.current = ''; // Reset when input changes
                                }}
                                keyboardType="decimal-pad"
                                placeholder="Longitude"
                                className="border border-gray-300 rounded-xl p-2 flex-1"
                            />
                        </View>

                        <TouchableOpacity
                            className="bg-green-600 py-2 rounded-xl mb-2"
                            onPress={fetchNearbyPlaces}
                        >
                            <Text className="text-white text-center font-semibold">Search Nearby</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Loading indicator */}
                {loading && (
                    <View className="absolute bottom-4 left-0 right-0 items-center">
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                )}

                {/* Results panel - using memoized component */}
                {ResultsPanel}
                
                <View className="absolute bottom-20 right-4 flex-col">
                    {/* AI Suggestions button */}
                    <TouchableOpacity
                        className="bg-blue-600 p-3 rounded-full shadow-lg"
                        onPress={() => router.push('/ai-suggestions')}
                    >
                        <Ionicons name="bulb" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* Home button */}
                    <TouchableOpacity
                        className="bg-green-600 p-3 rounded-full shadow-lg mt-6"
                        onPress={() => router.push('/')}
                    >
                        <Ionicons name="home" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}