import { StyleSheet } from 'react-native';
import { useTheme } from '@context/ThemeContext';

export default function useStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
      backgroundColor: theme.color.white,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 32,
      textAlign: 'center',
      color: theme.color.black,
    },
    input: {
      height: 48,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 16,
      marginBottom: 16,
      fontSize: 16,
      borderColor: theme.color.lightPrimary,
      color: theme.color.black,
    },
    label: {
      fontSize: 16,
      marginBottom: 8,
      fontWeight: '500',
      color: 'rgba(0, 0, 0, 0.6)',
    },
    linkText: {
      marginTop: 16,
      textAlign: 'center',
      color: theme.color.black,
    },
    linkAction: {
      color: theme.color.darkPrimary,
      fontWeight: '500',
    },
  });
} 