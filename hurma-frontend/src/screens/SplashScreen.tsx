import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";
import colors from "../theme/colors";

export default function SplashScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    }, [fadeAnim]);

    return (
        <View style={styles.container}>
            <Animated.View style={{ opacity: fadeAnim }}>
                <Image source={require("../../assets/splash.png")} style={styles.logo} />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
    logo: { width: 220, height: 220, resizeMode: "contain" },
});


