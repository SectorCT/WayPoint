import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Platform,
} from "react-native";
import { useTheme } from "@context/ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { makeAuthenticatedRequest } from "../../utils/api";
import useStyles from "./styles/packageStyles";
import { router, useLocalSearchParams } from "expo-router";
import { GradientButton } from "@components/basic/gradientButton/gradientButton";

interface Office {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  company: number;
}

export default function OfficesScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newOffice, setNewOffice] = useState({ name: '', address: '', latitude: '', longitude: '' });
  const [adding, setAdding] = useState(false);
  const styles = useStyles();

  // If returning from map picker, update form state
  useEffect(() => {
    if (params.returnScreen === "offices" && (params.latitude || params.longitude)) {
      setNewOffice((prev) => ({
        ...prev,
        latitude: params.latitude as string || prev.latitude,
        longitude: params.longitude as string || prev.longitude,
        address: params.address as string || prev.address,
      }));
      // Remove params from URL after using them
      router.replace("/(tabs)/offices");
    }
  }, [params]);

  useEffect(() => {
    fetchOffices();
  }, []);

  const fetchOffices = async () => {
    setLoading(true);
    try {
      const res = await makeAuthenticatedRequest('/delivery/offices/', { method: 'GET' });
      const data = await res.json();
      setOffices(Array.isArray(data) ? data : []);
    } catch (e) {
      setOffices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUndeliveredCount = async (officeId: number): Promise<number> => {
    try {
      const res = await makeAuthenticatedRequest(`/delivery/offices/${officeId}/undelivered/`, { method: 'GET' });
      const data = await res.json();
      return Array.isArray(data) ? data.length : 0;
    } catch {
      return 0;
    }
  };

  const handleAddOffice = async () => {
    setAdding(true);
    try {
      await makeAuthenticatedRequest('/delivery/offices/', {
        method: 'POST',
        body: JSON.stringify({
          ...newOffice,
          latitude: parseFloat(newOffice.latitude),
          longitude: parseFloat(newOffice.longitude),
          company: 1, // TODO: Replace with actual company ID from context/auth
        }),
      });
      setModalVisible(false);
      setNewOffice({ name: '', address: '', latitude: '', longitude: '' });
      fetchOffices();
    } catch (e) {
      // handle error
    } finally {
      setAdding(false);
    }
  };

  const handlePickLocation = () => {
    router.replace({
      pathname: "/pickLocationFromMap",
      params: {
        ...newOffice,
        returnScreen: "offices",
      },
    });
  };

  function OfficeCard({ office, fetchUndeliveredCount }: { office: Office, fetchUndeliveredCount: (id: number) => Promise<number> }) {
    const [undeliveredCount, setUndeliveredCount] = useState<number | null>(null);
    useEffect(() => {
      fetchUndeliveredCount(office.id).then(setUndeliveredCount);
    }, [office.id]);
    return (
      <View style={localStyles.officeCard}>
        <Text style={localStyles.officeName}>{office.name}</Text>
        <Text style={localStyles.officeAddress}>{office.address}</Text>
        <Text style={localStyles.officeCoords}>Lat: {office.latitude}, Lng: {office.longitude}</Text>
        <Text style={localStyles.officePackages}>Undelivered packages: {undeliveredCount === null ? '...' : undeliveredCount}</Text>
      </View>
    );
  }

  return (
    <View style={styles.outer}>
      <View style={styles.topFill} />
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <View style={[styles.headerContainer, Platform.OS === 'android' && { paddingTop: 30 }]}>
            <Text style={styles.title}>Offices</Text>
            <TouchableOpacity onPress={() => router.push('/addOffice')}>
              <MaterialIcons name="add-business" size={28} color={theme.color.darkPrimary} />
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color={theme.color.mediumPrimary} />
          ) : (
            <FlatList
              data={offices}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <OfficeCard office={item} fetchUndeliveredCount={fetchUndeliveredCount} />}
              contentContainerStyle={{ paddingBottom: 20, gap: 12, paddingTop: 14 }}
              style={{ paddingHorizontal: 20, height: "100%" }}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  officeCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
  },
  officeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  officeAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  officeCoords: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  officePackages: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  cancelButton: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#eee',
    minWidth: 80,
    alignItems: 'center',
  },
  pickLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#eee',
    marginBottom: 10,
    marginTop: 4,
  },
}); 