import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../config/constants';

interface GradientButtonProps {
    onPress: () => void;
    title: string;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
    onPress,
    title,
    style,
    textStyle,
}) => {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.buttonContainer, style]}>
            <LinearGradient
                colors={[COLORS.MEDIUM, COLORS.MAIN]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                <Text style={[styles.text, textStyle]}>{title}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        width: '100%',
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: COLORS.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    gradient: {
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: COLORS.WHITE,
        fontSize: 16,
        fontWeight: '600',
    },
}); 