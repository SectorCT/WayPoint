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
    headerContainer: {
      marginBottom: 32,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.color.black,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 16,
      color: 'rgba(0, 0, 0, 0.6)',
      lineHeight: 24,
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