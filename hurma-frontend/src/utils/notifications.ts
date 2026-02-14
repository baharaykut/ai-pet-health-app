import * as Notifications from "expo-notifications";

// ===============================
// 🔔 AŞI BİLDİRİMİ PLANLA
// ===============================
export async function scheduleVaccineNotification(
    title: string,
    body: string,
    date: Date
) {
    // Geçmiş tarihse planlama
    if (date.getTime() <= Date.now()) {
        console.log("⏭️ Bildirim tarihi geçmiş, atlandı:", date);
        return;
    }

    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            sound: true,
        },
        trigger: {
            type: "date",   // ✅ BU ŞART
            date: date,     // ✅ BU ŞART
        } as Notifications.NotificationTriggerInput,
    });

    console.log("🔔 Bildirim planlandı:", title, date);
}
