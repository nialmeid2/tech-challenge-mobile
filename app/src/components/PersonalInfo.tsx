import { UserContext } from "@src/context/UserContext";
import { useContext, useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, useColorScheme, View } from "react-native";

import Loading from "@src/components/Loading";
import { initCapSentence, toMoney } from "@src/model/utils/str";
import { styleValues } from "@src/views/styles/StylesCommons";


export default function PersonalInfo() {

    const { user, setIsLoading, statement, updateStatement } = useContext(UserContext);

    const isDarkMode = useColorScheme() == 'dark'
    const style = styleFunc(isDarkMode);

    const heightAnim = useRef(new Animated.Value(60)).current

    useEffect(() => {
        setIsLoading(false)
        if (!user?.name) {
            setIsLoading(true);
            updateStatement()
                .catch((err) => { console.log(err); setIsLoading(false); })
                .finally(() => {
                    setIsLoading(false);
                    Animated.parallel([

                        Animated.timing(heightAnim, {
                            toValue: 600,
                            duration: 1500,
                            useNativeDriver: false,
                            easing: Easing.inOut(Easing.ease),

                        })
                    ]).start();
                });
        }
    }, [statement]);

    if (!user) {
        //navigation.dispatch(StackActions.replace('Login'))
        return;
    }

    return <>



        <Animated.View style={[style.personalInfo, { maxHeight: heightAnim }]}>
            <Text style={[style.texts, style.personalInfoText]}>Olá, {user?.name ? user.name : user.email}</Text>
            {user.name ?
                <>
                    <Text style={[style.texts, style.todayDate]}>{initCapSentence(new Date().toLocaleDateString(['pt-br', 'en-us'], { dateStyle: "full" }))}</Text>
                    <Text style={[style.texts, style.balance]}>Saldo</Text>
                    <Text style={[style.texts, style.balanceValue]}>{toMoney(user.balance)}</Text>
                </> : <></>}
        </Animated.View>
    </>
}

const styleFunc = (isDarkMode: boolean) => {

    const styleValuesForMode = styleValues(isDarkMode);

    return StyleSheet.create({

        texts: {
            color: styleValuesForMode.textColor,
            fontSize: 16
        },
        todayDate: {
            marginTop: 8,
            color: 'white',
            marginBottom: 40
        },
        balance: {
            textAlign: 'right',
            padding: 8,
            borderBottomWidth: 4,
            color: 'white',
            fontSize: 32,
            borderBottomColor: isDarkMode ? '#ff8e7a' : '#7d372b'
        },
        balanceValue: {
            textAlign: 'right',
            padding: 8,
            fontSize: 32,
            color: 'white',
        },
        personalInfo: {
            backgroundColor: '#004D61',
            borderRadius: 8,
            padding: 16,
            margin: 16,
            overflow: 'hidden'
        },
        personalInfoText: {
            fontSize: 20,
            color: 'white'
        }
    })
}