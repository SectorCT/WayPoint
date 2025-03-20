import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

interface ManagerToggleProps {
  isManager: boolean;
  onToggle: (value: boolean) => void;
}

export const ManagerToggle: React.FC<ManagerToggleProps> = ({
  isManager,
  onToggle,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.option, styles.leftOption, !isManager && styles.selected]}
        onPress={() => onToggle(false)}
      >
        {!isManager ? (
          <LinearGradient
            colors={[theme.color.mediumPrimary, theme.color.darkPrimary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient, styles.leftGradient]}
          >
            <View style={styles.contentContainer}>
              <MaterialIcons name="local-shipping" size={20} color="#FFFFFF" style={styles.icon} />
              <Text style={[styles.text, styles.selectedText]}>Trucker</Text>
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.contentContainer}>
            <MaterialIcons name="local-shipping" size={20} color="rgba(0, 0, 0, 0.54)" style={styles.icon} />
            <Text style={styles.text}>Trucker</Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.option, styles.rightOption, isManager && styles.selected]}
        onPress={() => onToggle(true)}
      >
        {isManager ? (
          <LinearGradient
            colors={[theme.color.mediumPrimary, theme.color.darkPrimary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient, styles.rightGradient]}
          >
            <View style={styles.contentContainer}>
              <MaterialIcons name="business" size={20} color="#FFFFFF" style={styles.icon} />
              <Text style={[styles.text, styles.selectedText]}>Manager</Text>
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.contentContainer}>
            <MaterialIcons name="business" size={20} color="rgba(0, 0, 0, 0.54)" style={styles.icon} />
            <Text style={styles.text}>Manager</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  option: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftOption: {
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  rightOption: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  selected: {
    borderWidth: 0,
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftGradient: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  rightGradient: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.87)',
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
}); 