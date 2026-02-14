import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Button, Image, Text, View } from "react-native";
import { analyzePet } from "../api/hurma";

export default function CameraScreen() {
    const [photo, setPhoto] = useState<any>(null);
    const [result, setResult] = useState<any>(null);

    async function pick() {
        const img = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });
        if (!img.canceled) setPhoto(img.assets[0]);
    }

    async function sendToAI() {
        const data = new FormData();
        data.append("file", { uri: photo.uri, name: "pet.jpg", type: "image/jpeg" });
        data.append("description", "topallıyor ve iştahsız");

        const res = await analyzePet(data);
        setResult(res.data);
    }

    return (
        <View style={{ padding: 20 }}>
            <Button title="Fotoğraf Seç" onPress={pick} />
            {photo && <Image source={{ uri: photo.uri }} style={{ width: 200, height: 200 }} />}
            <Button title="Analize Gönder" onPress={sendToAI} />

            {result && (
                <Text style={{ marginTop: 20 }}>
                    {JSON.stringify(result, null, 2)}
                </Text>
            )}
        </View>
    );
}
