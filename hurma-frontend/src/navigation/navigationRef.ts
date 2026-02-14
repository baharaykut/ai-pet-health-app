import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

export function navigate(name: never, params?: never) {
    if (navigationRef.isReady()) {
        // @ts-ignore
        navigationRef.navigate(name, params);
    } else {
        console.warn("[NAV] Navigation is not ready yet:", name);
    }
}

export function getCurrentRouteName() {
    if (!navigationRef.isReady()) return null;
    return navigationRef.getCurrentRoute()?.name ?? null;
}


