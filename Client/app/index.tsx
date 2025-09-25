import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { isAuthenticated } = useAuth();

  // If user is authenticated, redirect to home
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
