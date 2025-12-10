import { UserContext } from "@src/context/UserContext";
import { styleValues } from "@src/views/styles/StylesCommons";
import { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";


export default function Header() {

    const { logout } = useContext(UserContext);
    const isDarkMode = useColorScheme() == 'dark';
    const style = styleFunc(isDarkMode);

    

    return <View style={style.header}>
        <TouchableOpacity onPress={() => logout()}>
            <Text style={style.logoutText}>Encerrar Sessão</Text>
        </TouchableOpacity>
    </View>

}


const styleFunc = (isDarkMode: boolean) => {

    return StyleSheet.create({
        header: {
            backgroundColor: isDarkMode ? '#570d00' : '#ff684d',
            padding: 20,
            paddingTop: 24,
            marginBottom: 8,
            position: 'relative',
            top: -10,
            justifyContent: 'flex-end'
        },
        logoutText: {
            color: styleValues(isDarkMode).textColor,
            textAlign: 'right',
            textDecorationLine: 'underline',
            fontSize: 18,
            fontWeight: 'bold'
        }
    })
}