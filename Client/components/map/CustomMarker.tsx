import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import useStyles from './styles';

interface CustomMarkerProps {
  number: number;
  isDelivered: boolean;
}

export default function CustomMarker({ number, isDelivered }: CustomMarkerProps) {
  const styles = useStyles();
  
  return (
    <View style={[
      styles.markerContainer,
      isDelivered && styles.markerContainerDelivered
    ]}>
      {isDelivered ? (
        <MaterialIcons name="check" size={20} color="#4CAF50" />
      ) : (
        <Text style={styles.markerText}>{number}</Text>
      )}
    </View>
  );
} 