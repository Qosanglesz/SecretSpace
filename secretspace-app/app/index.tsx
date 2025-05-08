import {Button, ScrollView} from "react-native";
import {useRouter} from "expo-router";

export default function Index() {
    const router = useRouter();

    return (
        <ScrollView>
            <Button title="Go to Create Page" onPress={() => router.push('/place/create')}/>
            <Button title="All" onPress={() => router.push('/place/all')}/>
        </ScrollView>
    );
}
