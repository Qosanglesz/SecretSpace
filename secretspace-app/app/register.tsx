import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';

export default function RegisterScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        // Simulate saving user (replace with real backend call)
        const user = { username, password };
        globalThis.localStorage = globalThis.localStorage || new Map();
        globalThis.localStorage.set(username, user);

        Alert.alert('Success', 'Registered successfully!');
        router.replace('/login');
    };

    return (
        <View className="flex-1 justify-center px-6 bg-white">
            <Text className="text-2xl font-bold mb-6 text-center">Register</Text>

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
                onPress={handleRegister}
                className="bg-green-600 py-3 rounded-xl"
            >
                <Text className="text-white text-center font-semibold">Register</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => router.push('/login')}
                className="mt-4"
            >
                <Text className="text-center text-gray-600">Already have an account? Login</Text>
            </TouchableOpacity>
        </View>
    );
}
