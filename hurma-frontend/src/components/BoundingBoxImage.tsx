import React from "react";
import { Dimensions, Image, Text, View } from "react-native";

export default function BoundingBoxImage({ uri, detections }: any) {
    const screenWidth = Dimensions.get("window").width - 40;
    const imageHeight = 220;

    return (
        <View style={{ width: screenWidth, height: imageHeight, borderRadius: 16, overflow: "hidden" }}>
            <Image
                source={{ uri }}
                style={{ width: screenWidth, height: imageHeight }}
                resizeMode="cover"
            />

            {detections?.map((det: any, i: number) => {
                if (!det.bbox) return null;

                const [x1, y1, x2, y2] = det.bbox;

                return (
                    <View
                        key={i}
                        style={{
                            position: "absolute",
                            left: x1,
                            top: y1,
                            width: x2 - x1,
                            height: y2 - y1,
                            borderWidth: 2,
                            borderColor: "red",
                            borderRadius: 6,
                        }}
                    >
                        <Text
                            style={{
                                backgroundColor: "red",
                                color: "white",
                                fontSize: 10,
                                paddingHorizontal: 4,
                            }}
                        >
                            {det.label}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}
