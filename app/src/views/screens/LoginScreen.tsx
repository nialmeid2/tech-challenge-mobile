import { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";
import { StackActions, useNavigation } from '@react-navigation/native';

import BoyOnAPhone from "@src/assets/boy_on_a_phone.svg";
import Brand from '@src/assets/brand.svg';
import Loading from "@src/components/Loading";
import { UserContext } from "@src/context/UserContext";
import { User } from "@src/model/User";
import * as Keychain from 'react-native-keychain';
import { AppConstants } from "@src/model/Constants";
import { styleValues } from "../styles/StylesCommons";

interface LoginResponse {
    user: User,
    token: string
}

export default function LoginScreen() {

    const { user, setUser, setIsLoading, setToken, token } = useContext(UserContext);

    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [emailErrors, setEmailErrors] = useState('');
    const [passwordErrors, setPasswordErrors] = useState('');
    const navigation = useNavigation();
    const mode = useColorScheme();
    const placeHolderColor = mode == 'dark' ? 'rgba(255, 255, 255, .5)' : 'rgba(0, 0, 0, .5)';
    const style = styleFunc(mode == 'dark');



    function attemptLogin() {

        const theErrors = { email: '', pass: '' }
        if (!email.trim())
            theErrors.email = 'O e-mail é obrigatório';
        else if (!/.+@.+\..+/gi.test(email) || [...email].filter(c => c === "@").length > 1)
            theErrors.email = "O e-mail deve ter um formato válido";

        if (!pass)
            theErrors.pass = 'A senha é obrigatória';
        else if (pass.length < 8 || !(/[a-z]/.test(pass) && /[A-Z]/.test(pass) && /[\d]/.test(pass) && /[^\da-zA-Z]/.test(pass)))
            theErrors.pass = "A senha deve ter 8 caracteres ou mais e conter uma letra maiúscula, uma minúscula, um número e um caracter especial"

        setEmailErrors(theErrors.email);
        setPasswordErrors(theErrors.pass);

        if (theErrors.email || theErrors.pass)
            return;

        setIsLoading(true);

        requestLogin();

    }

    async function requestLogin() {

        try {
            const response: LoginResponse = await fetch(`${process.env.BACKEND_URL}user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',                    
                },
                body: JSON.stringify({
                    email, password: pass
                })
            }).then(res => res.json());

            function grantAcess() {
                setIsLoading(false);
                response.user.name = '';
                setUser(response.user);
                setToken(response.token);
            }

            const keyChainResult = await Keychain.setGenericPassword(response.user.email, response.token, {
                securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
                storage: Keychain.STORAGE_TYPE.AES_GCM,
                service: AppConstants.APP_STORAGE_KEY,
                accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY

            }).catch((err) => {
                if (err.message.includes('Biometric')) // no biometric hardware returns code: 12, msg: Biometric hardware unavailable                
                    grantAcess(); // No Biometrics, but access still granted (will have to relogin if app is closed)
                else
                    throw err;
            });
            

            if (keyChainResult) {
                grantAcess();
            }


        } catch (err) {
            console.log(err);
            setIsLoading(false);

            if ((err as any)?.message?.includes('msg: Cancel')) { // KeyChain can tell when the error is canceled by user or something else
                setEmailErrors('Biometria cancelada pelo usuário, faça login novamente');
                setPasswordErrors('Biometria cancelada pelo usuário, faça login novamente');
            } else {
                setEmailErrors('Usuário ou senha incorretos');
                setPasswordErrors('Usuário ou senha incorretos');                
            }

        } 
        
    }

    useEffect(() => {
        if (token) {
            setIsLoading(true);
            navigation.dispatch(StackActions.replace('Dashboard', { token, user }))
        }
    }, [token])

    return <View style={style.wholeView}>

        <Loading />


        <View style={style.background}>
            <BoyOnAPhone height={'50%'} width={'80%'} opacity={.2} />
        </View>


        <View style={style.fieldSet}>
            <Brand height={32} style={style.brandImage} />
            <View style={style.fieldGroup}>

                <TextInput style={style.field} secureTextEntry={false} placeholder="Digite seu e-mail" keyboardType="email-address" autoCapitalize="none"
                    placeholderTextColor={placeHolderColor} value={email} onChange={(v) => setEmail(v.nativeEvent.text)} />
                {emailErrors ? <Text style={style.errorText}>{emailErrors}</Text> : <></>}
            </View>
            <View style={style.fieldGroup}>
                <TextInput style={style.field} secureTextEntry={true} placeholder="Digite sua senha" autoCorrect={false} autoCapitalize="none"
                    placeholderTextColor={placeHolderColor} value={pass} onChange={(v) => setPass(v.nativeEvent.text)} />
                {passwordErrors ? <Text style={style.errorText}>{passwordErrors}</Text> : <></>}
            </View>

            <TouchableOpacity style={style.submit} onPress={() => attemptLogin()}>
                <Text style={style.submitLabel}>Login</Text>
            </TouchableOpacity>

        </View>
    </View>
}


const styleFunc = (isDarkMode: boolean) => {
    const styleValuesForMode = styleValues(isDarkMode);
    return StyleSheet.create({
        wholeView: {
            flex: 1,
            justifyContent: "center",
            alignItems: 'center',
            position: 'relative',
            flexDirection: 'row',
            padding: 16,
            backgroundColor: styleValuesForMode.backgroundColor
        },
        loading: {
            color: styleValuesForMode.textColor,
        },
        brandImage: {
            alignSelf: 'center',
            marginBottom: 16,

        },
        background: styleValuesForMode.backgroundImage,
        fieldSet: {
            borderWidth: 0,
            borderColor: isDarkMode ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.5)',
            flex: 1,
            padding: 8
        },
        fieldGroup: {
            margin: 16,
            marginBottom: 32
        },
        field: styleValuesForMode.fieldStyle,
        submit: styleValuesForMode.submitStyle,
        submitLabel: styleValuesForMode.submitTextStyle,
        errorText: {
            fontSize: 12,
            color: styleValuesForMode.errorText,
        }
    })
}