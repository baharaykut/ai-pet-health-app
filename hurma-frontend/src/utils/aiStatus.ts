import colors from "../theme/colors";

export function getAIStatusColor(status: string) {
    switch (status) {
        case "healthy":
            return colors.success;

        case "warning":
            return colors.warning;

        case "critical":
            return colors.danger;

        default:
            return colors.primary;
    }
}
