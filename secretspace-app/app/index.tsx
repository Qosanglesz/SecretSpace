import {Button, ScrollView} from "react-native";
import {useRouter} from "expo-router";

export default function Index() {
    const router = useRouter();

    return (
        <ScrollView>
            <Button title="Go to Create Page" onPress={() => router.push('/place/create')}/>
            <Button title="All" onPress={() => router.push('/place/all')}/>
            <Button title="nearby" onPress={() => router.push('/nearby')}/>
            <Button title="register" onPress={() => router.push('/register')}/>
            <Button title="login" onPress={() => router.push('/login')}/>
        </ScrollView>
    );
}
