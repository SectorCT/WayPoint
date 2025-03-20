import React, { useState } from "react";
import { View, TouchableOpacity, Text, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { router } from "expo-router";
import { GradientButton } from "@components/basic/gradientButton/gradientButton";
import { FormField } from "../../components/basic/FormField";
import { ManagerToggle } from "../../components/basic/ManagerToggle";
import useStyles from "./styles/registerStyles";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isManager, setIsManager] = useState(false);
  const { register } = useAuth();
  const styles = useStyles();

  const handleRegister = async () => {
    try {
      await register(email, username, password, phoneNumber, isManager);
    } catch (error) {
      Alert.alert("Error", "Failed to register. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Create an Account</Text>
        <Text style={styles.headerSubtitle}>
          Transform Your Fleet, Transform Your Business!
        </Text>
      </View>
      <FormField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
        icon="email"
      />
      <FormField
        label="Username"
        value={username}
        onChangeText={setUsername}
        placeholder="Choose a username"
        icon="person"
      />
      <FormField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Create a password"
        secureTextEntry
        icon="lock"
      />
      <FormField
        label="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
        icon="phone"
      />
      <Text style={[styles.label, { marginBottom: 8 }]}>Account Type</Text>
      <ManagerToggle isManager={isManager} onToggle={setIsManager} />
      <GradientButton title="Register" onPress={handleRegister} />
      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.linkText}>
          Already have an account? <Text style={styles.linkAction}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
