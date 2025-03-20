import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  icon?: keyof typeof MaterialIcons.glyphMap;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  icon,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: 'rgba(0, 0, 0, 0.6)' }]}>{label}</Text>
      <View style={styles.inputContainer}>
        {icon && (
          <View style={styles.iconContainer}>
            <MaterialIcons name={icon} size={20} color="rgba(0, 0, 0, 0.54)" />
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.color.white,
              borderColor: theme.color.lightPrimary,
              color: 'rgba(0, 0, 0, 0.87)',
            },
            icon ? styles.inputWithIcon : null,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(0, 0, 0, 0.38)"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputWithIcon: {
    paddingLeft: 44, // Make space for the icon
  },
  iconContainer: {
    position: 'absolute',
    left: 12,
    height: '100%',
    justifyContent: 'center',
    zIndex: 1,
  },
}); 