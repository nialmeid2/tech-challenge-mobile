import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardIcon from "@src/assets/withdraw.svg";
import TransactionsIcon from "@src/assets/graph_banner.svg";
import InvestmentsIcon from "@src/assets/pig_safe.svg";
import OtherPerationsIcon from "@src/assets/Adjustments.svg";
import DashboardScreen from "./screens/DashboardScreen";
import React from 'react'
import TransactionsScreen from "./screens/TransactionsScreen";
import InvestmentScreen from "./screens/InvestmentScreen";

const Tabs = createBottomTabNavigator();

export default function TabsRoutes() {
    return <Tabs.Navigator screenOptions={{
        animation: 'shift',
        headerShown: false,
        tabBarActiveBackgroundColor: '#352eff',
        tabBarInactiveBackgroundColor: '#a5a6c0',
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: '#dedede',
        tabBarStyle: {
            height: 65,
            borderTopWidth: 0, // Remove border
            elevation: 0, // Remove shadow on Android
            shadowOpacity: 0, // Remove shadow on iOS
        },
        tabBarLabelStyle: {
            fontSize: 16,
            width: '100%',            
        },
        tabBarHideOnKeyboard: true,
        tabBarIconStyle: {
            flex: 1,
            width: '100%',            
        }
    }}>
        <Tabs.Screen name="Início" component={DashboardScreen} options={{ tabBarIcon: () => <DashboardIcon fill={'white'} color="white" stroke="white" /> }} />
        <Tabs.Screen name="Transações" component={TransactionsScreen} options={{ tabBarIcon: () => <TransactionsIcon /> }} />
        <Tabs.Screen name="Investimentos" component={InvestmentScreen} options={{ tabBarIcon: () => <InvestmentsIcon /> }} />
        
    </Tabs.Navigator>

}