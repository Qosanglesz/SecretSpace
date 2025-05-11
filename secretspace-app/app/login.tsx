import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            setIsLoading(true); // Show loading indicator while logging in
            const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/login`, {
                username,
                password,
            });

            const { token } = response.data;

            // Store the JWT token in AsyncStorage
            await AsyncStorage.setItem('jwt', token);

            // Redirect to home screen after successful login
            Alert.alert('Login successful');
            router.push('/');

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false); // Hide loading indicator
        }
    };

    return (
        <View className="flex-1 justify-center px-6 bg-white">
            <Text className="text-2xl font-bold mb-6 text-center">Login</Text>

            <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
            />
            <TextInput
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
            />

            <TouchableOpacity
                onPress={handleLogin}
                className="bg-blue-600 py-3 rounded-xl"
                disabled={isLoading} // Disable button while loading
            >
                <Text className="text-white text-center font-semibold">{isLoading ? 'Logging in...' : 'Login'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => router.push('/register')}
                className="mt-4"
            >
                <Text className="text-center text-gray-600">Don't have an account? Register</Text>
            </TouchableOpacity>
        </View>
    );
}