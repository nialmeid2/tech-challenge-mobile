import { TextStyle, ViewStyle } from "react-native";

export const styleValues = (isDarkMode: boolean) => {

    const textColor = isDarkMode ? 'white' : 'black'

    return {
        backgroundColor: isDarkMode ? /*"#1f311c"*/ '#465c42' : "#e4ede3",
        textColor,
        errorText: isDarkMode ? '#fbadad' : '#8d1b1b',
        backgroundImage: {
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0
        } as ViewStyle,
        fieldStyle: {
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#f8f8f8' : '#212121',
            fontSize: 18,
            color: textColor,
            padding: 10,
            paddingHorizontal: 0

        },
        submitStyle: {
            backgroundColor: '#004D61',
            alignSelf: 'center',
            paddingHorizontal: 24,
            paddingVertical: 12,
            marginTop: 16,
            minWidth: 200,
            borderRadius: 4
        } as ViewStyle,
        submitTextStyle: {
            color: 'white',
            fontSize: 24,
            textAlign: 'center'
        } as ViewStyle,
        titleText: {
            marginBottom: 8,
            fontSize: 24,
            fontWeight: 'bold',
            color: textColor
        } as TextStyle,
        labelText: {
            fontSize: 16,
            marginBottom: 8,
            color: textColor
        } as TextStyle,
        comboBox: {
            backgroundColor: 'white',
            color: 'black',
            marginBottom: 4,
        },
    }
}

