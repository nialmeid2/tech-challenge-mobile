
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from '@react-navigation/native';

import React from "react";
import LoginScreen from "./screens/LoginScreen";
import TabsRoutes from "./Tabs";

const Stack = createStackNavigator();

export default function RoutesNavigation() {

    return <NavigationContainer >
        <Stack.Navigator screenOptions={{header: () => <></>}}>
            <Stack.Screen name="Login"  component={LoginScreen} />
            <Stack.Screen name="Dashboard"  component={TabsRoutes}  />
        </Stack.Navigator>
    </NavigationContainer>
}