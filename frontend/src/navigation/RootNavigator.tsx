import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { useAppStore } from '../store';

// Screens & Navigators
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { RoleSelectionScreen } from '../screens/auth/RoleSelectionScreen';
import { LoginOTPScreen } from '../screens/auth/LoginOTPScreen';
import { FarmerOnboardingScreen } from '../screens/auth/FarmerOnboardingScreen';
import { FarmerNavigator } from './FarmerNavigator';
import { BuyerNavigator } from './BuyerNavigator';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const [state] = useAppStore();

  // Whenever role is changed via DemoToolbar or screen action,
  // route to the appropriate portal root if already past auth
  useEffect(() => {
    if (navigationRef.isReady()) {
      const currentRoute = navigationRef.getCurrentRoute()?.name;
      if (currentRoute === 'FarmerRoot' && state.currentRole === 'BUYER') {
        navigationRef.navigate('BuyerRoot');
      } else if (currentRoute === 'BuyerRoot' && state.currentRole === 'FARMER') {
        navigationRef.navigate('FarmerRoot');
      }
    }
  }, [state.currentRole]);

  return (
    <View style={styles.container}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
          <Stack.Screen name="LoginOTP" component={LoginOTPScreen} />
          <Stack.Screen name="FarmerOnboarding" component={FarmerOnboardingScreen} />
          <Stack.Screen name="FarmerRoot" component={FarmerNavigator} />
          <Stack.Screen name="BuyerRoot" component={BuyerNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});
