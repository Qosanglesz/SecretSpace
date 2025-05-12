// app/ai-suggestions.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for our data
interface LocationType {
  latitude: number;
  longitude: number;
}

interface PlacePhoto {
  url: string;
}

interface Place {
  id?: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type?: string;
  amenities?: string;
  mapImage?: string;
  photoUrls?: string[];
  photos?: string[];
}

export default function AiSuggestionsScreen() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [preferences, setPreferences] = useState('');
  const [location, setLocation] = useState<LocationType | null>(null);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required');
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Could not get your current location');
    }
  };

  const getSuggestions = async () => {
    if (!location) {
      Alert.alert('Location Required', 'Please wait for your location to be determined');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (!token) {
        Alert.alert('Authentication Required', 'Please log in to use this feature');
        return;
      }

      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/ai/suggest-places`,
        {
          params: {
            lat: location.latitude,
            lng: location.longitude,
            preferences: preferences,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Process the response to handle images
      const places = response.data.places || [];
      
      // Log the response to see what we're getting
    //   console.log('AI suggestions response:', JSON.stringify(places[0], null, 2));
      
      setSuggestions(places);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      Alert.alert('Error', 'Failed to get AI suggestions');
    } finally {
      setLoading(false);
    }
  };

  const addPlaceToDatabase = async (place: Place) => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (!token) {
        Alert.alert('Authentication Required', 'Please log in to use this feature');
        return;
      }

      setLoading(true);
      await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/ai/add-place`,
        place,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert(
        'Success',
        `${place.name} has been added to your places!`,
        [
          {
            text: 'View Place',
            onPress: () => {
              // Navigate to nearby screen with the place's coordinates
              router.push({
                pathname: '/nearby',
                params: {
                  lat: place.latitude.toString(),
                  lng: place.longitude.toString(),
                  fromAI: 'true'
                }
              });
            },
          },
          { text: 'OK', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('Error adding place:', error);
      Alert.alert('Error', 'Failed to add place');
    } finally {
      setLoading(false);
    }
  };

  const renderPlaceCard = (place: Place, index: number) => (
    <View key={index} className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden border border-gray-200">
      <View className="bg-gray-50 p-4">
        <Text className="text-lg font-bold text-gray-800">{place.name}</Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="location-outline" size={16} color="#4B5563" />
          <Text className="text-gray-500 text-sm ml-1">
            {place.latitude}, {place.longitude}
          </Text>
        </View>
      </View>
      
      {/* Display map image if available */}
      {place.mapImage && (
        <Image 
          source={{ uri: place.mapImage }}
          style={{ width: '100%', height: 200 }}
          resizeMode="cover"
        />
      )}
      
      {/* Display place photos if available */}
      {place.photoUrls && place.photoUrls.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ padding: 8 }}>
          {place.photoUrls.map((url: string, photoIndex: number) => (
            <Image 
              key={photoIndex}
              source={{ uri: url }}
              style={{ width: 150, height: 100, marginRight: 8, borderRadius: 8 }}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}
      
      {/* Display place photos if available (alternative format) */}
      {place.photos && place.photos.length > 0 && !place.photoUrls && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ padding: 8 }}>
          {place.photos.map((photo: string, photoIndex: number) => (
            <Image 
              key={photoIndex}
              source={{ uri: photo }}
              style={{ width: 150, height: 100, marginRight: 8, borderRadius: 8 }}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}
      
      <View className="p-4">
        <Text className="text-gray-700 mb-3">{place.description}</Text>
        
        {place.type && (
          <View className="flex-row items-center mb-2">
            <Ionicons name="business-outline" size={16} color="#4B5563" />
            <Text className="text-gray-600 ml-2">{place.type}</Text>
          </View>
        )}
        
        {place.amenities && (
          <View className="flex-row items-center mb-2">
            <Ionicons name="wifi-outline" size={16} color="#4B5563" />
            <Text className="text-gray-600 ml-2">{place.amenities}</Text>
          </View>
        )}
        
        <TouchableOpacity
          className="bg-green-600 py-2 rounded-lg mt-3"
          onPress={() => addPlaceToDatabase(place)}
        >
          <Text className="text-white text-center font-semibold">Add to My Places</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity
            className="p-2"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text className="text-black font-bold text-lg ml-2">AI Secret Space Finder</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="bg-blue-50 p-4 rounded-xl mb-6">
          <View className="flex-row items-center mb-3">
            <Ionicons name="bulb-outline" size={24} color="#3B82F6" />
            <Text className="text-blue-700 font-bold text-lg ml-2">Discover Hidden Quiet Spaces</Text>
          </View>
          <Text className="text-blue-700 mb-3">
            Our AI can suggest potential quiet places near you that might be perfect for studying or working.
          </Text>
          
          <Text className="font-semibold text-gray-700 mb-2">What are you looking for?</Text>
          <TextInput
            value={preferences}
            onChangeText={setPreferences}
            placeholder="e.g., cafe with wifi, quiet library, outdoor space with shade"
            className="bg-white border border-gray-300 rounded-xl p-3 mb-3"
            multiline
          />
          
          <TouchableOpacity
            className="bg-blue-600 py-3 rounded-xl"
            onPress={getSuggestions}
            disabled={loading}
          >
            <Text className="text-white text-center font-semibold">
              {loading ? 'Finding spaces...' : 'Find Secret Spaces'}
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-600 mt-4">Our AI is searching for hidden quiet spaces...</Text>
          </View>
        )}

        {!loading && suggestions.length > 0 && (
          <View>
            <Text className="text-xl font-bold text-gray-800 mb-4">Suggested Secret Spaces</Text>
            
            {/* Use the renderPlaceCard function here */}
            {suggestions.map((place, index) => renderPlaceCard(place, index))}
          </View>
        )}

        {!loading && suggestions.length === 0 && (
          <View className="items-center justify-center py-8">
            <Ionicons name="search-outline" size={64} color="#CBD5E0" />
            <Text className="text-gray-500 mt-4 text-center">
              No suggestions yet. Try searching for quiet spaces near you!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}