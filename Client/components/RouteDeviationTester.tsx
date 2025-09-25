import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Modal } from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "@context/ThemeContext";
import { runTestScenario, runAllTests, getTestScenarios } from '../scripts/testRouteDeviation';

interface RouteDeviationTesterProps {
  isVisible: boolean;
  onClose: () => void;
}

const RouteDeviationTester: React.FC<RouteDeviationTesterProps> = ({ isVisible, onClose }) => {
  const { theme } = useTheme();
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);

  const testScenarios = getTestScenarios();

  const handleRunTest = (scenarioIndex: number) => {
    setSelectedScenario(scenarioIndex);
    runTestScenario(scenarioIndex);
  };

  const handleRunAllTests = () => {
    runAllTests();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.color.white }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.color.black }]}>
            Route Deviation Tester
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={theme.color.darkPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
          <Text style={[styles.description, { color: theme.color.lightGrey }]}>
            Test different deviation scenarios without going outside. Select a scenario to test the deviation detection system.
          </Text>

          <View style={styles.scenariosContainer}>
            {testScenarios.map((scenario, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.scenarioItem,
                  { 
                    borderColor: selectedScenario === index ? theme.color.darkPrimary : '#eee',
                    backgroundColor: selectedScenario === index ? theme.color.lightPrimary : '#f5f5f5'
                  }
                ]}
                onPress={() => handleRunTest(index)}
              >
                <View style={styles.scenarioHeader}>
                  <Text style={[styles.scenarioName, { color: theme.color.black }]}>
                    {scenario.name}
                  </Text>
                  <View style={[styles.testButton, { backgroundColor: theme.color.darkPrimary }]}>
                    <MaterialIcons name="play-arrow" size={16} color="#FFFFFF" />
                  </View>
                </View>
                <Text style={[styles.scenarioDescription, { color: theme.color.lightGrey }]}>
                  {scenario.description}
                </Text>
                <Text style={[styles.expectedBehavior, { color: theme.color.darkPrimary }]}>
                  Expected: {scenario.expectedBehavior}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.runAllButton, { backgroundColor: theme.color.darkPrimary }]}
            onPress={handleRunAllTests}
          >
            <MaterialIcons name="list" size={20} color="#FFFFFF" />
            <Text style={styles.runAllButtonText}>Run All Tests</Text>
          </TouchableOpacity>

          <View style={styles.infoContainer}>
            <Text style={[styles.infoTitle, { color: theme.color.black }]}>
              How to Use:
            </Text>
            <Text style={[styles.infoText, { color: theme.color.lightGrey }]}>
              1. Select a test scenario above{'\n'}
              2. The test will show you the expected behavior{'\n'}
              3. Compare with actual app behavior{'\n'}
              4. Use &quot;Run All Tests&quot; to see all results at once
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    marginLeft: 10,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  scenariosContainer: {
    marginBottom: 20,
  },
  scenarioItem: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    marginBottom: 10,
  },
  scenarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scenarioName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  testButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scenarioDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  expectedBehavior: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  runAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    gap: 8,
  },
  runAllButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default RouteDeviationTester; 