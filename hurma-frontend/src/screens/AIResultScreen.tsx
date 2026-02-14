import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useMemo } from "react";
import {
    Alert,
    Image,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import colors from "../theme/colors";

/**
 * Backend response:
 * {
 *   success: true,
 *   result: {
 *     success: true,
 *     species: {...},
 *     skinDisease: {...},
 *     summary: {...},
 *     yoloDetections: [...],
 *     vets: [...]
 *   }
 * }
 */

// ================= TYPES =================

// ✅ FIX: UNCERTAIN da kullanıyorsun, type'a ekledik
type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "UNCERTAIN";

type SpeciesResult = {
    ok?: boolean;
    species?: string;
    confidence?: number;
    error?: string;
};

type SkinResult = {
    ok?: boolean;
    animal?: string;
    disease?: string; // backend: "scabies" gibi key ya da direkt isim
    confidence?: number;
    error?: string;
    all_probs?: Record<string, number>;
    // opsiyonel: backend risk gönderebilir
    risk?: RiskLevel | string;
};

type Summary = {
    animal?: string;
    disease?: string;
    confidence?: number;
    riskLevel?: RiskLevel | string; // backend bazen string gelebilir
    message?: string;
};

type YoloDetection = {
    class?: string;
    confidence?: number;
};

// Veteriner objesi için minimum esnek tip
type VetItem = {
    id?: number | string;
    name?: string;
    address?: string;
    phone?: string;
    distanceKm?: number; // backend gönderirse
    lat?: number;
    lng?: number;
};

type AIInnerResult = {
    success?: boolean;
    yoloDetections?: YoloDetection[];
    species?: SpeciesResult | null;
    skinDisease?: SkinResult | null;
    summary?: Summary | null;
    vets?: VetItem[];
    stage?: string;
    error?: string;
};

type AIEnvelope = {
    success?: boolean;
    result?: AIInnerResult;
};

// ================= HELPERS =================

function clamp01(n: number) {
    if (Number.isNaN(n)) return 0;
    if (n < 0) return 0;
    if (n > 1) return 1;
    return n;
}

function pct01(n?: number) {
    return Math.round(clamp01(typeof n === "number" ? n : 0) * 100);
}

function animalLabel(animal?: string) {
    if (animal === "dog") return "Köpek";
    if (animal === "cat") return "Kedi";
    if (!animal) return "Bilinmiyor";
    return animal;
}

function normalizeKey(s?: string) {
    return (s || "").trim().toLowerCase().replace(/\s+/g, "_");
}

function riskMeta(level?: string) {
    // ✅ FIX: nullish + default
    const lv = (level ?? "UNCERTAIN").toUpperCase();

    // ✅ FIX: RiskLevel artık UNCERTAIN içeriyor, bu kontrol çalışır
    const riskLevel: RiskLevel =
        lv === "HIGH" || lv === "MEDIUM" || lv === "LOW" || lv === "UNCERTAIN"
            ? (lv as RiskLevel)
            : "UNCERTAIN";

    const riskColor =
        riskLevel === "HIGH"
            ? "#B60000"
            : riskLevel === "MEDIUM"
                ? "#FF9800"
                : riskLevel === "LOW"
                    ? "#28A745"
                    : "#6C757D";

    const riskEmoji =
        riskLevel === "HIGH"
            ? "🚨"
            : riskLevel === "MEDIUM"
                ? "⚠️"
                : riskLevel === "LOW"
                    ? "✅"
                    : "❓";

    const riskTextTR =
        riskLevel === "HIGH"
            ? "YÜKSEK"
            : riskLevel === "MEDIUM"
                ? "ORTA"
                : riskLevel === "LOW"
                    ? "DÜŞÜK"
                    : "BELİRSİZ";

    const riskSubtitle =
        riskLevel === "HIGH"
            ? "Acil veteriner değerlendirmesi önerilir."
            : riskLevel === "MEDIUM"
                ? "Veteriner kontrolü önerilir."
                : riskLevel === "LOW"
                    ? "Takip edilebilir. Şüphede veterinere danış."
                    : "Görüntü net değil. Daha iyi bir fotoğrafla tekrar deneyin.";

    return { riskLevel, riskColor, riskEmoji, riskTextTR, riskSubtitle };
}

// ================= DISEASE DICTIONARY (Frontend - geçici) =================
// (Sonra backend'e taşıyacağız)

type DiseaseInfo = {
    tr: string;
    description: string;
    isContagious: boolean;
    isUrgent: boolean;
    actions: string[];
};

const DISEASE_INFO: Record<string, DiseaseInfo> = {
    scabies: {
        tr: "Uyuz (Paraziter Deri Hastalığı)",
        description:
            "Uyuz, ciltte şiddetli kaşıntı, tüy dökülmesi ve yaralara neden olabilen, parazitlerin yol açtığı bulaşıcı bir deri hastalığıdır.",
        isContagious: true,
        isUrgent: true,
        actions: [
            "En kısa sürede veterinere götür",
            "Diğer hayvanlardan izole et",
            "Eldivenle temas et ve ellerini yıka",
            "Temas ettiği yatak/örtü/zemini temizle",
        ],
    },

    ringworm: {
        tr: "Mantar (Dermatofitoz)",
        description:
            "Mantar enfeksiyonları tüy dökülmesi, kepeklenme ve dairesel lezyonlarla görülebilir. Bazı türleri insana da bulaşabilir.",
        isContagious: true,
        isUrgent: true,
        actions: [
            "Veterinerden tanı ve ilaç planı al",
            "Temas edenleri ve ortamı düzenli temizle",
            "Diğer hayvanlarla teması kısıtla",
        ],
    },

    flea_allergy: {
        tr: "Pire Alerjisi",
        description:
            "Pire ısırıklarına karşı gelişen alerjik reaksiyon; kaşıntı, kızarıklık ve tüy dökülmesi yapabilir.",
        isContagious: false,
        isUrgent: false,
        actions: [
            "Pire tedavisi uygula (damla/spreyi veterinerle seç)",
            "Yatak/halı gibi alanları temizle",
            "Kaşıntı artarsa veterinere danış",
        ],
    },

    dermatitis: {
        tr: "Dermatit (Cilt İltihabı)",
        description:
            "Alerji, tahriş, enfeksiyon gibi birçok nedene bağlı gelişebilen cilt iltihabıdır. Kızarıklık, kabuklanma ve kaşıntı görülebilir.",
        isContagious: false,
        isUrgent: false,
        actions: [
            "Tahriş edici ürünleri kullanmayı bırak",
            "Yarayı yalamayı engelle (yaka vb.)",
            "Belirti artarsa veterinere götür",
        ],
    },
};

// Hastalık adı backend’den “Scabies” gibi gelirse normalize edip yakalamak için alias
const DISEASE_ALIASES: Record<string, string> = {
    uyuz: "scabies",
    scabie: "scabies",
    scabies: "scabies",
    mantar: "ringworm",
    ringworm: "ringworm",
    dermatofitoz: "ringworm",
    pire_alerjisi: "flea_allergy",
    flea_allergy: "flea_allergy",
    dermatitis: "dermatitis",
    cilt_iltihabi: "dermatitis",
};

function getDiseaseInfo(raw?: string) {
    const key0 = normalizeKey(raw);
    const mapped = DISEASE_ALIASES[key0] || key0;
    return DISEASE_INFO[mapped] || null;
}

// ================= UI PARTS =================

function SectionCard(props: { title: string; children: React.ReactNode }) {
    return (
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>{props.title}</Text>
            {props.children}
        </View>
    );
}

function RowText({ label, value }: { label: string; value: string }) {
    return (
        <Text style={styles.text}>
            <Text style={styles.textLabel}>{label}</Text>
            {value}
        </Text>
    );
}

function Chip({
    text,
    tone,
}: {
    text: string;
    tone?: "good" | "warn" | "bad" | "neutral";
}) {
    const bg =
        tone === "good"
            ? "#E9F8EF"
            : tone === "warn"
                ? "#FFF3CD"
                : tone === "bad"
                    ? "#FDECEC"
                    : "#EEF2F7";
    const fg =
        tone === "good"
            ? "#1E7E34"
            : tone === "warn"
                ? "#856404"
                : tone === "bad"
                    ? "#B60000"
                    : "#334155";

    return (
        <View style={[styles.chip, { backgroundColor: bg }]}>
            <Text style={[styles.chipText, { color: fg }]}>{text}</Text>
        </View>
    );
}

// ================= SCREEN =================

export default function AIResultScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const { result: rawResult, photoUri } = route.params || {};

    // Envelope / inner uyumu
    const inner: AIInnerResult | null = useMemo(() => {
        if (!rawResult) return null;

        if (typeof rawResult === "object" && rawResult && "result" in rawResult) {
            const env = rawResult as AIEnvelope;
            return (env.result || null) as AIInnerResult | null;
        }

        return rawResult as AIInnerResult;
    }, [rawResult]);

    // React kuralına uygun hata yönetimi
    useEffect(() => {
        if (!inner) {
            Alert.alert("Hata", "Sonuç bulunamadı.");
            navigation.goBack();
            return;
        }

        if (inner.success === false) {
            const msg =
                inner.error ||
                (inner.stage
                    ? `${inner.stage} aşamasında hata oluştu.`
                    : "AI analizinde hata oluştu.");
            Alert.alert("Hata", msg);
            navigation.goBack();
        }
    }, [inner, navigation]);

    if (!inner) return null;
    if (inner.success === false) return null;

    const summary = inner.summary || null;
    const species = inner.species || null;
    const skin = inner.skinDisease || null;
    const yolo = Array.isArray(inner.yoloDetections) ? inner.yoloDetections : [];
    const vets = Array.isArray(inner.vets) ? inner.vets : [];

    const detectedAnimal = species?.species || summary?.animal || skin?.animal || "unknown";

    const mainConfidence =
        typeof summary?.confidence === "number"
            ? summary.confidence
            : typeof skin?.confidence === "number"
                ? skin.confidence
                : 0;

    const confidencePct = pct01(mainConfidence);

    // Hastalık bilgisi: önce skin.disease -> sonra summary.disease
    const diseaseInfo = getDiseaseInfo(skin?.disease || summary?.disease);
    const diseaseTitleTR =
        diseaseInfo?.tr || (skin?.disease || summary?.disease || "Bilinmiyor");

    // ================= RISK (BACKEND SOURCE OF TRUTH) =================
    // ✅ FIX: Backend risk yoksa LOW demek yerine UNCERTAIN
    const backendRiskRaw =
        summary?.riskLevel ??
        skin?.risk ??
        "UNCERTAIN";

    const computedRiskLevel: RiskLevel =
        backendRiskRaw === "HIGH" ||
            backendRiskRaw === "MEDIUM" ||
            backendRiskRaw === "LOW" ||
            backendRiskRaw === "UNCERTAIN"
            ? (backendRiskRaw as RiskLevel)
            : "UNCERTAIN";

    const { riskColor, riskEmoji, riskTextTR, riskSubtitle } = riskMeta(
        computedRiskLevel
    );

    // ✅ FIX: ok alanı hiç gelmeyebilir; disease varsa analiz var say
    const hasSkinAnalysis =
        !!skin &&
        (skin.ok === true || skin.ok === undefined) &&
        !!skin.disease;

    const topProbs = skin?.all_probs
        ? Object.entries(skin.all_probs)
            .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
            .slice(0, 4)
        : [];

    const openGoogleMapsSearch = async () => {
        const query = encodeURIComponent("veteriner yakınımda");
        const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
        try {
            const ok = await Linking.canOpenURL(url);
            if (ok) Linking.openURL(url);
            else Alert.alert("Hata", "Harita açılamadı.");
        } catch {
            Alert.alert("Hata", "Harita açılamadı.");
        }
    };

    const callPhone = async (phone?: string) => {
        if (!phone) return;
        const url = `tel:${phone}`;
        try {
            const ok = await Linking.canOpenURL(url);
            if (ok) Linking.openURL(url);
            else Alert.alert("Hata", "Arama başlatılamadı.");
        } catch {
            Alert.alert("Hata", "Arama başlatılamadı.");
        }
    };

    // ✅ Bu noktadan sonrası sende vardı (UI render bölümü). Aynen devam edebilirsin.
    // Eğer istersen tüm dosyanın TAMAMINI da tek parça halinde bir sonraki mesajda
    // (render kısmını da yapıştırarak) eksiksiz düzenleyip tek dosya olarak verebilirim.

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} />
                    <Text style={styles.backText}>Geri</Text>
                </TouchableOpacity>

                <Text style={styles.title}>🧠 Hurma AI Analiz Raporu</Text>

                {/* ===== DURUM KARTI (PRO) ===== */}
                <View style={[styles.heroCard, { borderColor: `${riskColor}33` }]}>
                    <View style={styles.heroTop}>
                        <Text style={styles.statusEmoji}>{riskEmoji}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.statusText, { color: riskColor }]}>
                                Risk Seviyesi: {riskTextTR}
                            </Text>
                            <Text style={styles.subText}>{riskSubtitle}</Text>
                        </View>
                    </View>

                    <View style={styles.heroRow}>
                        <Chip text={`Tür: ${animalLabel(detectedAnimal)}`} tone="neutral" />
                        <Chip
                            text={`AI Güven: %${confidencePct}`}
                            tone={
                                computedRiskLevel === "HIGH"
                                    ? "bad"
                                    : computedRiskLevel === "MEDIUM"
                                        ? "warn"
                                        : computedRiskLevel === "LOW"
                                            ? "good"
                                            : "neutral"
                            }
                        />
                    </View>

                    <View style={styles.barBg}>
                        <View
                            style={[
                                styles.barFill,
                                { width: `${confidencePct}%`, backgroundColor: riskColor },
                            ]}
                        />
                    </View>

                    <View style={{ marginTop: 10 }}>
                        <Text style={[styles.text, { textAlign: "center" }]}>
                            <Text style={styles.textLabel}>Olası Tanı:</Text> {diseaseTitleTR}
                        </Text>
                        {summary?.message ? (
                            <Text style={[styles.subText, { textAlign: "center", marginTop: 6 }]}>
                                {summary.message}
                            </Text>
                        ) : null}
                    </View>
                </View>

                {/* ===== FOTO ===== */}
                {photoUri ? <Image source={{ uri: photoUri }} style={styles.image} /> : null}

                {/* ===== HAYVAN ===== */}
                <SectionCard title="🐾 Hayvan Türü">
                    <RowText label="Tür: " value={animalLabel(detectedAnimal)} />
                    <RowText label="Güven: " value={`%${pct01(species?.confidence)}`} />

                    {species && species.ok === false && species.error ? (
                        <Text style={[styles.text, { marginTop: 6, color: "#B60000" }]}>
                            {species.error}
                        </Text>
                    ) : null}
                </SectionCard>

                {/* ===== CİLT ===== */}
                {hasSkinAnalysis ? (
                    <SectionCard title="🦠 Cilt Analizi">
                        <RowText label="Hastalık: " value={diseaseTitleTR} />
                        <RowText label="Güven: " value={`%${pct01(skin?.confidence)}`} />

                        {topProbs.length > 0 ? (
                            <View style={{ marginTop: 10 }}>
                                <Text style={[styles.text, { marginBottom: 6 }]}>
                                    <Text style={styles.textLabel}>Detay skorlar:</Text>
                                </Text>

                                {topProbs.map(([k, v]) => (
                                    <Text key={k} style={styles.text}>
                                        • {k}: %{pct01(v)}
                                    </Text>
                                ))}
                            </View>
                        ) : null}
                    </SectionCard>
                ) : (
                    <SectionCard title="ℹ️ Bilgi">
                        <Text style={styles.text}>
                            Bu hayvan türü için cilt analizi yapılamadı veya mevcut değil.
                        </Text>

                        {skin && skin.ok === false && skin.error ? (
                            <Text style={[styles.text, { marginTop: 6, color: "#B60000" }]}>
                                {skin.error}
                            </Text>
                        ) : null}
                    </SectionCard>
                )}

                {/* ===== HASTALIK NEDİR? ===== */}
                {diseaseInfo ? (
                    <SectionCard title="📖 Bu Hastalık Nedir?">
                        <Text style={styles.text}>{diseaseInfo.description}</Text>
                    </SectionCard>
                ) : (
                    <SectionCard title="📖 Bilgi">
                        <Text style={styles.text}>
                            Bu sonuç bir ön değerlendirmedir. Daha doğru öneriler için veteriner muayenesi gerekir.
                        </Text>
                    </SectionCard>
                )}

                {/* ===== CİDDİYET & UYARILAR ===== */}
                {diseaseInfo ? (
                    <SectionCard title="⚠️ Ciddiyet ve Uyarılar">
                        <View style={styles.chipRow}>
                            <Chip
                                text={`Bulaşıcı: ${diseaseInfo.isContagious ? "Evet" : "Hayır"}`}
                                tone={diseaseInfo.isContagious ? "warn" : "good"}
                            />
                            <Chip
                                text={`Acil: ${diseaseInfo.isUrgent ? "Evet" : "Hayır"}`}
                                tone={diseaseInfo.isUrgent ? "bad" : "neutral"}
                            />
                        </View>

                        {diseaseInfo.isUrgent ? (
                            <Text style={[styles.text, { color: "#B60000", marginTop: 8 }]}>
                                ❗ Bu durum geciktirilmeden veterinere gösterilmelidir.
                            </Text>
                        ) : (
                            <Text style={[styles.subText, { marginTop: 8 }]}>
                                Belirtiler artarsa veya hayvan iştahsız/bitkin görünüyorsa veteriner önerilir.
                            </Text>
                        )}

                        {diseaseInfo.isContagious ? (
                            <Text style={[styles.text, { marginTop: 8 }]}>
                                • Diğer hayvanlarla teması kısıtlayın, ortamı düzenli temizleyin.
                            </Text>
                        ) : null}
                    </SectionCard>
                ) : null}

                {/* ===== NE YAPMALISIN? ===== */}
                {diseaseInfo ? (
                    <SectionCard title="🩺 Ne Yapmalısın?">
                        {diseaseInfo.actions.map((a, i) => (
                            <Text key={i} style={styles.text}>
                                • {a}
                            </Text>
                        ))}
                    </SectionCard>
                ) : null}

                {/* ===== YOLO ===== */}
                {yolo.length > 0 ? (
                    <SectionCard title="📦 Nesne Tespiti">
                        {yolo.map((d: any, i: number) => (
                            <Text key={i} style={styles.text}>
                                • {d?.class || "unknown"} (%{pct01(d?.confidence)})
                            </Text>
                        ))}
                    </SectionCard>
                ) : null}

                {/* ===== VETERİNERLER (Backend gönderirse) ===== */}
                <SectionCard title="🏥 Veteriner Önerileri">
                    {vets.length > 0 ? (
                        <>
                            <Text style={[styles.subText, { marginBottom: 8 }]}>
                                Yakınınızdaki seçenekler (backend sağladığında daha iyi sıralanır).
                            </Text>

                            {vets.slice(0, 3).map((v, idx) => (
                                <View key={String(v.id ?? idx)} style={styles.vetItem}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.vetName}>{v.name || "Veteriner"}</Text>
                                        {v.distanceKm != null ? (
                                            <Text style={styles.subText}>
                                                Mesafe: {v.distanceKm.toFixed(1)} km
                                            </Text>
                                        ) : null}
                                        {v.address ? <Text style={styles.subText}>{v.address}</Text> : null}
                                    </View>

                                    {v.phone ? (
                                        <TouchableOpacity
                                            onPress={() => callPhone(v.phone)}
                                            style={styles.vetCallBtn}
                                        >
                                            <Ionicons name="call" size={18} color="#fff" />
                                        </TouchableOpacity>
                                    ) : null}
                                </View>
                            ))}
                        </>
                    ) : (
                        <Text style={styles.text}>
                            Konum izni ve veteriner listesi backend entegrasyonuyla gösterilecek. Şimdilik haritada
                            arama yapabilirsin.
                        </Text>
                    )}

                    <TouchableOpacity style={styles.primaryBtn} onPress={openGoogleMapsSearch}>
                        <Text style={styles.primaryBtnText}>🗺️ En Yakın Veterinerleri Haritada Göster</Text>
                    </TouchableOpacity>
                </SectionCard>

                {/* ===== GLOBAL UYARI ===== */}
                <View style={styles.warningCard}>
                    <Ionicons name="warning-outline" size={20} color="#FF9800" />
                    <Text style={styles.warningText}>
                        Bu AI sonucu sadece ön değerlendirmedir. Kesin teşhis ve tedavi için mutlaka veteriner
                        hekim muayenesi gereklidir.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ================= STYLES =================

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    backBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
    backText: { fontWeight: "800" },

    title: {
        fontSize: 22,
        fontWeight: "900",
        textAlign: "center",
        marginVertical: 10,
    },

    heroCard: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
    },

    heroTop: {
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
    },

    heroRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        justifyContent: "center",
        marginTop: 10,
    },

    image: {
        width: "100%",
        height: 260,
        borderRadius: 20,
        marginBottom: 16,
        backgroundColor: "#eee",
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
    },

    statusEmoji: { fontSize: 40, textAlign: "center" },
    statusText: { fontSize: 20, fontWeight: "900" },

    subText: { color: "#667085", marginTop: 2, lineHeight: 18 },

    barBg: {
        height: 12,
        backgroundColor: "#eee",
        borderRadius: 999,
        marginTop: 12,
        overflow: "hidden",
    },
    barFill: { height: "100%", borderRadius: 999 },

    sectionTitle: { fontSize: 16, fontWeight: "900", marginBottom: 10 },

    text: { color: "#444", lineHeight: 20 },
    textLabel: { fontWeight: "900", color: "#222" },

    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 6,
    },

    chip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
    },
    chipText: {
        fontWeight: "800",
        fontSize: 12,
    },

    primaryBtn: {
        backgroundColor: "#ff7a00",
        marginTop: 12,
        padding: 14,
        borderRadius: 14,
        alignItems: "center",
    },
    primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "900" },

    vetItem: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.06)",
    },
    vetName: { fontSize: 15, fontWeight: "900", color: "#111827" },

    vetCallBtn: {
        backgroundColor: "#28A745",
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },

    warningCard: {
        flexDirection: "row",
        gap: 10,
        backgroundColor: "#FFF3CD",
        borderRadius: 12,
        padding: 12,
        marginTop: 10,
        marginBottom: 30,
    },
    warningText: { color: "#856404", flex: 1 },
});
