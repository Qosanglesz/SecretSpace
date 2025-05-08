import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        globalThis.localStorage = globalThis.localStorage || new Map();
        const user = globalThis.localStorage.get(username);

        if (!user || user.password !== password) {
            Alert.alert('Error', 'Invalid username or password');
            return;
        }

        Alert.alert('Success', 'Logged in!');
        router.replace('/'); // Navigate to home or main screen
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
            >
                <Text className="text-white text-center font-semibold">Login</Text>
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
