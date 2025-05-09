// app/index.tsx
import {Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator} from 'react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './context/auth';

export default function Index() {
    const { username, logout, loading } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#0891b2" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="px-5 py-6 bg-white shadow-sm">
                <View className="flex-row justify-between items-center">
                    <Text className="text-2xl font-bold text-gray-800">Explore</Text>
                    {username ? (
                        <TouchableOpacity
                            // onPress={() => router.push('/profile')}
                            className="flex-row items-center">
                            <View className="w-8 h-8 rounded-full bg-cyan-600 mr-2 items-center justify-center">
                                <Text className="text-white font-bold">{username.charAt(0).toUpperCase()}</Text>
                            </View>
                            <Text className="text-gray-800 font-medium">{username}</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={() => router.push('/login')}
                            className="py-2 px-4 bg-cyan-600 rounded-full">
                            <Text className="text-white font-medium">Sign In</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Main Content */}
            <View className="flex-1 px-5 py-6">
                {/* Feature Cards */}
                <View className="flex-row justify-between mb-8">
                    <TouchableOpacity
                        onPress={() => router.push('/place/create')}
                        className="bg-white rounded-2xl shadow-sm p-4 w-[48%] items-center">
                        <View className="bg-cyan-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                            <Ionicons name="add-outline" size={24} color="#0891b2" />
                        </View>
                        <Text className="font-medium text-gray-800">Create Place</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/place/all')}
                        className="bg-white rounded-2xl shadow-sm p-4 w-[48%] items-center">
                        <View className="bg-cyan-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                            <Ionicons name="grid-outline" size={24} color="#0891b2" />
                        </View>
                        <Text className="font-medium text-gray-800">All Places</Text>
                    </TouchableOpacity>
                </View>

                {/* Nearby Section */}
                <View className="bg-white rounded-2xl shadow-sm p-5 mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-gray-800">Nearby Places</Text>
                        <TouchableOpacity onPress={() => router.push('/nearby')}>
                            <Text className="text-cyan-600 font-medium">See All</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="bg-gray-100 h-32 rounded-xl items-center justify-center">
                        <Ionicons name="location-outline" size={32} color="#0891b2" />
                        <Text className="text-gray-600 mt-2">Discover places around you</Text>
                    </View>
                </View>

                {/* Bottom Section */}
                {username ? (
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="bg-white rounded-2xl shadow-sm p-4 flex-row items-center justify-center">
                        <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                        <Text className="text-red-600 font-medium ml-2">Logout</Text>
                    </TouchableOpacity>
                ) : (
                    <View className="bg-white rounded-2xl shadow-sm p-5">
                        <Text className="text-gray-800 font-medium text-center mb-4">
                            Join to create and share places
                        </Text>
                        <View className="flex-row justify-between">
                            <TouchableOpacity
                                onPress={() => router.push('/register')}
                                className="bg-cyan-600 py-3 rounded-xl w-[48%] items-center">
                                <Text className="text-white font-medium">Register</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => router.push('/login')}
                                className="bg-gray-200 py-3 rounded-xl w-[48%] items-center">
                                <Text className="text-gray-800 font-medium">Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}