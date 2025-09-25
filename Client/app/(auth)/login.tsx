import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { router } from "expo-router";
import { GradientButton } from "@components/basic/gradientButton/gradientButton";
import { FormField } from "../../components/basic/FormField";
import useStyles from "./styles/loginStyles";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const styles = useStyles();

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch {
      Alert.alert("Error", "Failed to login. Please check your credentials.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Log in to your account</Text>
        <Text style={styles.headerSubtitle}>Welcome back! Please enter your details.</Text>
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
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secureTextEntry
        icon="lock"
      />
      <GradientButton title="Login" onPress={handleLogin} />
      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text style={styles.linkText}>
          Don&apos;t have an account? <Text style={styles.linkAction}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

