import { StyleSheet, Dimensions } from "react-native";

export default function useStyles() {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
      width: Dimensions.get('screen').width,
      height: Dimensions.get('screen').height,
    },
    markerContainer: {
      backgroundColor: 'white',
      borderRadius: 15,
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#000',
    },
    markerContainerDelivered: {
      borderColor: '#4CAF50',
      backgroundColor: '#E8F5E9',
    },
    markerText: {
      color: '#000',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
} 