// app/_layout.tsx
import { Stack } from "expo-router";
import "../global.css"

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="nearby" options={{ headerShown: false }} />
      <Stack.Screen name="place/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="ai-suggestions" options={{ headerShown: false }} />
      {/* Add other screens */}
    </Stack>
  );
}