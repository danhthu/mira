import { LinearGradient } from "expo-linear-gradient";

export const Section = ({ colors, children }) => {
    return <LinearGradient colors={colors || ['#ffffff', '#dddddd']} style={{
        flex: 1,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        marginTop: 16,
        padding: 5,
    }}>
        {children}
    </LinearGradient>;
};