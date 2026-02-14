import api from "./api"; // senin axios instance (ASP.NET)

export async function analyzeImage(imageUri: string, petId: number) {
    const formData = new FormData();

    formData.append("file", {
        uri: imageUri,
        name: "image.jpg",
        type: "image/jpeg",
    } as any);

    formData.append("petId", String(petId));

    // Token'ı api interceptor zaten ekliyor ama fetch kullanınca biz ekleyeceğiz:
    // api'deki memoryToken’a erişemiyorsan, AsyncStorage'dan çek:
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    const token = await AsyncStorage.getItem("auth_token");

    const url = `${api.defaults.baseURL}/api/Ai/analyze-full`;

    console.log("➡️ AI ANALYZE via FETCH:", url);

    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: token ? `Bearer ${token}` : "",
            // ❗ Content-Type koyma! boundary'yi fetch kendisi ayarlasın
            Accept: "application/json",
        },
        body: formData as any,
    });

    const text = await res.text();
    let data: any = null;
    try {
        data = JSON.parse(text);
    } catch {
        data = { raw: text };
    }

    if (!res.ok) {
        console.log("❌ AI FETCH ERROR:", res.status, data);
        throw new Error(data?.error || `AI analyze failed (${res.status})`);
    }

    return data;
}
