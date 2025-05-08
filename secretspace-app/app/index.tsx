import { Button, ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function Index() {
    const [username, setUsername] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const token = await AsyncStorage.getItem('jwt');
                if (token) {
                    // Make the API call to get the username
                    const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/auth/me`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setUsername(response.data.username);
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('jwt');
            setUsername(null); // Reset username after logout
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ScrollView>
            <Button title="Go to Create Page" onPress={() => router.push('/place/create')} />
            <Button title="All" onPress={() => router.push('/place/all')} />
            <Button title="Nearby" onPress={() => router.push('/nearby')} />

            {username ? (
                <View>
                    <Text className="text-xl text-center">Welcome, {username}</Text>
                    <Button title="Logout" onPress={handleLogout} />
                </View>
            ) : (
                <View>
                    <Button title="Register" onPress={() => router.push('/register')} />
                    <Button title="Login" onPress={() => router.push('/login')} />
                </View>
            )}
        </ScrollView>
    );
}
