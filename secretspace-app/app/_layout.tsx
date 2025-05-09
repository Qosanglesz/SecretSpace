// app/_layout.tsx
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './context/auth';
import '../global.css'

// This component handles protected routes
function ProtectedRouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Define protected routes
    const protectedRoutes = ['place/create', 'place/all'];

    // Check if current route is protected
    const inProtectedRoute = segments.some(segment =>
        protectedRoutes.includes(segment) ||
        protectedRoutes.includes(`${segments[0]}/${segment}`)
    );

    // Redirect if user is not authenticated and trying to access protected route
    if (!isAuthenticated && inProtectedRoute) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, segments]);

  if (loading) {
    return (
        <View className="flex-1 justify-center items-center bg-gray-50">
          <ActivityIndicator size="large" color="#0891b2" />
        </View>
    );
  }

  return <>{children}</>;
}

// Root layout component with auth provider
export default function RootLayout() {
  return (
      <AuthProvider>
        <ProtectedRouteGuard>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{
              title: "Login",
              // Prevent going back to protected routes after redirect
              headerBackVisible: true
            }} />
            <Stack.Screen name="register" options={{ title: "Register" }} />
            <Stack.Screen name="nearby" options={{ title: "Nearby Places" }} />
            <Stack.Screen
                name="place/create"
                options={{ title: "Create Place" }}
            />
            <Stack.Screen
                name="place/all"
                options={{ title: "All Places" }}
            />
            {/* Add other screens here */}
          </Stack>
        </ProtectedRouteGuard>
      </AuthProvider>
  );
}