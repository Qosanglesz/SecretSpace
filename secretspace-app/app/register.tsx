import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import axios from 'axios';

export default function RegisterScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            // ส่งข้อมูลไปที่ API
            const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/users`, {
                username,
                password,
            });

            // ตรวจสอบผลลัพธ์จาก API
            if (response.status === 201) {
                Alert.alert('Success', 'Registered successfully!');
                router.replace('/login');
            } else {
                Alert.alert('Error', 'Failed to register');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An error occurred while registering');
        }
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
