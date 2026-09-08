import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  LayoutDashboard,
  ShoppingBag,
  Inbox,
  Sliders,
  Receipt,
} from 'lucide-react-native';
import { colors, typography } from '../theme';
import type { BuyerTabParamList, BuyerStackParamList } from '../types/navigation';

// Buyer Screens
import { BuyerDashboardScreen } from '../screens/buyer/BuyerDashboardScreen';
import { DemandManagementScreen } from '../screens/buyer/DemandManagementScreen';
import { CreateDemandScreen } from '../screens/buyer/CreateDemandScreen';
import { IncomingLotsScreen } from '../screens/buyer/IncomingLotsScreen';
import { BuyerLotDetailsScreen } from '../screens/buyer/BuyerLotDetailsScreen';
import { QueueControlPanelScreen } from '../screens/buyer/QueueControlPanelScreen';
import { PhysicalInspectionStationScreen } from '../screens/buyer/PhysicalInspectionStationScreen';
import { WeighbridgeStationScreen } from '../screens/buyer/WeighbridgeStationScreen';
import { BuyerOfferCreationScreen } from '../screens/buyer/BuyerOfferCreationScreen';
import { BuyerTransactionsScreen } from '../screens/buyer/BuyerTransactionsScreen';
import { BuyerAnalyticsScreen } from '../screens/buyer/BuyerAnalyticsScreen';
import { BuyerProfileScreen } from '../screens/buyer/BuyerProfileScreen';
import { NotificationsScreen } from '../screens/shared/NotificationsScreen';

const Tab = createBottomTabNavigator<BuyerTabParamList>();
const Stack = createNativeStackNavigator<BuyerStackParamList>();

const BuyerQueueTabScreen = () => <QueueControlPanelScreen showBack={false} />;

const BuyerTabs: React.FC = () => {
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
          height: Platform.OS === 'ios' ? 92 : 72,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: typography.fontFamilies.medium,
        },
        tabBarItemStyle: {
          minWidth: 0,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="BuyerDashboardTab"
        component={BuyerDashboardScreen}
        options={{
          tabBarLabel: 'Operations',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="BuyerDemandTab"
        component={DemandManagementScreen}
        options={{
          tabBarLabel: 'Buying',
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="BuyerIncomingLotsTab"
        component={IncomingLotsScreen}
        options={{
          tabBarLabel: 'Lots',
          tabBarIcon: ({ color, size }) => <Inbox size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="BuyerQueueTab"
        component={BuyerQueueTabScreen}
        options={{
          tabBarLabel: 'Queue',
          tabBarIcon: ({ color, size }) => <Sliders size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="BuyerTransactionsTab"
        component={BuyerTransactionsScreen}
        options={{
          tabBarLabel: 'Payments',
          tabBarIcon: ({ color, size }) => <Receipt size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const BuyerNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BuyerDashboard" component={BuyerTabs} />
      <Stack.Screen name="DemandManagement" component={DemandManagementScreen} />
      <Stack.Screen name="CreateDemand" component={CreateDemandScreen} />
      <Stack.Screen name="IncomingLots" component={IncomingLotsScreen} />
      <Stack.Screen name="BuyerLotDetails" component={BuyerLotDetailsScreen} />
      <Stack.Screen name="QueueControlPanel" component={QueueControlPanelScreen} />
      <Stack.Screen name="PhysicalInspectionStation" component={PhysicalInspectionStationScreen} />
      <Stack.Screen name="WeighbridgeStation" component={WeighbridgeStationScreen} />
      <Stack.Screen name="BuyerOfferCreation" component={BuyerOfferCreationScreen} />
      <Stack.Screen name="BuyerTransactions" component={BuyerTransactionsScreen} />
      <Stack.Screen name="BuyerAnalytics" component={BuyerAnalyticsScreen} />
      <Stack.Screen name="BuyerNotifications" component={NotificationsScreen} />
      <Stack.Screen name="BuyerProfile" component={BuyerProfileScreen} />
    </Stack.Navigator>
  );
};
