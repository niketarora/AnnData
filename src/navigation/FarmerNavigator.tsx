import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Home,
  TrendingUp,
  PlusCircle,
  Clock,
  User,
  Bell,
} from 'lucide-react-native';
import { colors, typography, spacing } from '../theme';
import type { FarmerTabParamList, FarmerStackParamList } from '../types/navigation';

// Farmer Screens
import { FarmerHomeScreen } from '../screens/farmer/FarmerHomeScreen';
import { CropLotsListScreen } from '../screens/farmer/CropLotsListScreen';
import { CreateCropLotScreen } from '../screens/farmer/CreateCropLotScreen';
import { CropQualityResultScreen } from '../screens/farmer/CropQualityResultScreen';
import { BestPlacesToSellScreen } from '../screens/farmer/BestPlacesToSellScreen';
import { MarketDetailsScreen } from '../screens/farmer/MarketDetailsScreen';
import { BookSlotScreen } from '../screens/farmer/BookSlotScreen';
import { BookingConfirmationScreen } from '../screens/farmer/BookingConfirmationScreen';
import { LiveMandiQueueScreen } from '../screens/farmer/LiveMandiQueueScreen';
import { TransitNavigationScreen } from '../screens/farmer/TransitNavigationScreen';
import { FarmerCheckInScreen } from '../screens/farmer/FarmerCheckInScreen';
import { PhysicalInspectionResultScreen } from '../screens/farmer/PhysicalInspectionResultScreen';
import { WeighmentResultScreen } from '../screens/farmer/WeighmentResultScreen';
import { FarmerOfferDecisionScreen } from '../screens/farmer/FarmerOfferDecisionScreen';
import { PaymentStatusScreen } from '../screens/farmer/PaymentStatusScreen';
import { DigitalReceiptScreen } from '../screens/farmer/DigitalReceiptScreen';
import { SalesHistoryScreen } from '../screens/farmer/SalesHistoryScreen';
import { FarmerProfileScreen } from '../screens/farmer/FarmerProfileScreen';
import { NotificationsScreen } from '../screens/shared/NotificationsScreen';

const Tab = createBottomTabNavigator<FarmerTabParamList>();
const Stack = createNativeStackNavigator<FarmerStackParamList>();

const FarmerTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: typography.fontFamilies.medium,
        },
      }}
    >
      <Tab.Screen
        name="FarmerHomeTab"
        component={FarmerHomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="FarmerMarketsTab"
        component={BestPlacesToSellScreen}
        options={{
          tabBarLabel: 'Best Mandis',
          tabBarIcon: ({ color, size }) => <TrendingUp size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="FarmerSellTab"
        component={CreateCropLotScreen}
        options={{
          tabBarLabel: 'AI Scan',
          tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="FarmerBookingsTab"
        component={LiveMandiQueueScreen}
        options={{
          tabBarLabel: 'Live Queue',
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="FarmerProfileTab"
        component={FarmerProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const FarmerNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FarmerHome" component={FarmerTabs} />
      <Stack.Screen name="CropLotsList" component={CropLotsListScreen} />
      <Stack.Screen name="CropDetails" component={CropQualityResultScreen as any} />
      <Stack.Screen name="CreateCropLot" component={CreateCropLotScreen} />
      <Stack.Screen name="CropQualityResult" component={CropQualityResultScreen} />
      <Stack.Screen name="MarketIntelligence" component={BestPlacesToSellScreen} />
      <Stack.Screen name="BestPlacesToSell" component={BestPlacesToSellScreen} />
      <Stack.Screen name="MarketDetails" component={MarketDetailsScreen} />
      <Stack.Screen name="BookSlot" component={BookSlotScreen} />
      <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
      <Stack.Screen name="LiveMandiQueue" component={LiveMandiQueueScreen} />
      <Stack.Screen name="TransitNavigation" component={TransitNavigationScreen} />
      <Stack.Screen name="FarmerCheckIn" component={FarmerCheckInScreen} />
      <Stack.Screen name="PhysicalInspectionResult" component={PhysicalInspectionResultScreen} />
      <Stack.Screen name="WeighmentResult" component={WeighmentResultScreen} />
      <Stack.Screen name="FarmerOfferDecision" component={FarmerOfferDecisionScreen} />
      <Stack.Screen name="PaymentStatus" component={PaymentStatusScreen} />
      <Stack.Screen name="DigitalReceipt" component={DigitalReceiptScreen} />
      <Stack.Screen name="SalesHistory" component={SalesHistoryScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="FarmerProfile" component={FarmerProfileScreen} />
    </Stack.Navigator>
  );
};
