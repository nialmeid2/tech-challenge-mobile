import { SafeAreaView } from "react-native-safe-area-context";
import UserProvider from "./src/context/UserContext";
import { useColorScheme } from "react-native";
import React from "react";
import RoutesNavigation from "@src/views/Routes";




function App() {


    const isDarkMode = useColorScheme() == 'dark';

    return <SafeAreaView style={{flex: 1, minHeight: '100%' }}>        
        <UserProvider>
            <RoutesNavigation />
        </UserProvider>
    </SafeAreaView>

}


export default App;
