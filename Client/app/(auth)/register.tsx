import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import { GradientButton } from '../../components/GradientButton';
import { COLORS } from '../../config/constants';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { register } = useAuth();

  const handleRegister = async () => {
    try {
      await register(email, username, password, phoneNumber);
    } catch (error) {
      Alert.alert('Error', 'Failed to register. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      <GradientButton title="Register" onPress={handleRegister} />
      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.linkText}>
          Already have an account? <Text style={styles.linkAction}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: COLORS.WHITE,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: COLORS.BLACK,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.LIGHT,
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: COLORS.WHITE,
  },
  linkText: {
    color: COLORS.BLACK,
    textAlign: 'center',
    marginTop: 15,
  },
  linkAction: {
    color: COLORS.MAIN,
    fontWeight: '600',
  },
}); 