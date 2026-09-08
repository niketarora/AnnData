import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { useAppStore } from '../store';
import { DemoToolbar } from '../components/demo/DemoToolbar';

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
    if (!navigationRef.isReady()) return;
    const currentRoute = navigationRef.getCurrentRoute()?.name;
    const authScreens = ['Welcome', 'RoleSelection', 'LoginOTP', 'FarmerOnboarding'];
    
    // Don't auto-redirect if user is still on onboarding/welcome screens
    if (currentRoute && authScreens.includes(currentRoute)) {
      return;
    }

    if (state.currentRole === 'BUYER') {
      navigationRef.navigate('BuyerRoot');
    } else if (state.currentRole === 'FARMER') {
      navigationRef.navigate('FarmerRoot');
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

      {/* Persistent floating demo control bar for reviewer evaluation */}
      <DemoToolbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});
