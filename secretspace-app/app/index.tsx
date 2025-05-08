import {Button} from "react-native";
import {useRouter} from "expo-router";

export default function Index() {
    const router = useRouter();

    return (
        <Button title="Go to Create Page" onPress={() => router.push('/place/create')}/>
    );
}
