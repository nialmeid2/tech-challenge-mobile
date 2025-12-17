import { useContext, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, Platform, StyleSheet, Text, TextInput, TouchableOpacity, UIManager, useColorScheme, View } from "react-native";
import { StackActions, useNavigation } from '@react-navigation/native';

import BoyOnAPhone from "@src/assets/boy_on_a_phone.svg";
import Brand from '@src/assets/brand.svg';
import Loading from "@src/components/Loading";
import FingerPrint from '@src/assets/fingerprint.svg';
import { UserContext } from "@src/context/UserContext";
import { User } from "@src/model/User";
import * as Keychain from 'react-native-keychain';
import { AppConstants } from "@src/model/Constants";
import { styleValues } from "../styles/StylesCommons";

interface LoginResponse {
    user: User,
    token: string
}

interface RegisterResponse extends LoginResponse {
    statusCode?: number,
    message?: string
}

export default function LoginScreen() {

    const { user, setUser, setIsLoading, setToken, token, isBiometricsAvailable, setIsBiometricsAvailable, retryFingerPrint } = useContext(UserContext);

    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [emailErrors, setEmailErrors] = useState('');
    const [passwordErrors, setPasswordErrors] = useState('');

    const [name, setName] = useState('');
    const [nameErrors, setNameErrors] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPass, setNewPass] = useState('');
    const [newEmailErrors, setNewEmailErrors] = useState('');
    const [newPasswordErrors, setNewPasswordErrors] = useState('');
    const [isShowingModal, setIsShowingModal] = useState(false);


    const navigation = useNavigation();
    const mode = useColorScheme();
    const placeHolderColor = mode == 'dark' ? 'rgba(255, 255, 255, .5)' : 'rgba(0, 0, 0, .5)';
    const style = styleFunc(mode == 'dark');
    const slideAnim = useRef(new Animated.Value(Dimensions.get('screen').height + 50)).current;

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
            setIsBiometricsAvailable(false);
            const response: LoginResponse = await fetch(`${process.env.BACKEND_URL}user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(), password: pass
                })
            }).then(res => res.json());

            function grantAcess() {
                setIsLoading(false);
                response.user.name = ''; // To force statement to be loaded next screen
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

            console.log(process.env.BACKEND_URL);
            console.log(err);
            setIsLoading(false);

            if ((err as any)?.message?.includes('msg: Cancel')) { // KeyChain can tell when the error is canceled by user or something else
                setEmailErrors('Biometria cancelada pelo usuário, faça login novamente');
                setPasswordErrors('Biometria cancelada pelo usuário, faça login novamente');
                setIsBiometricsAvailable(false);
            } else {
                setEmailErrors('Usuário ou senha incorretos');
                setPasswordErrors('Usuário ou senha incorretos');
            }

        }

    }


    async function requestRegister() {

        try {
            setIsBiometricsAvailable(false);

            const response: RegisterResponse = await fetch(`${process.env.BACKEND_URL}user/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: newEmail.trim(), password: newPass, name: name.trim()
                })
            }).then(res => res.json());

            console.log(response)

            function grantAcess() {
                setIsLoading(false);
                response.user.name = ''; // To force statement to be loaded next screen
                setUser(response.user);
                setToken(response.token);
            }

            if (response.statusCode != 500) {

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
            } else {
                throw new Error(response.message);
            }


        } catch (err) {

            console.log(process.env.BACKEND_URL);
            console.log(err);
            setIsLoading(false);

            if ((err as any)?.message?.includes('msg: Cancel')) { // KeyChain can tell when the error is canceled by user or something else
                setEmailErrors('Biometria cancelada pelo usuário, faça login novamente');
                setPasswordErrors('Biometria cancelada pelo usuário, faça login novamente');
                setIsBiometricsAvailable(false);
            } else {
                setNameErrors((err as any).message);
                setNewEmailErrors((err as any).message);
                setNewPasswordErrors((err as any).message);
            }

        }

    }

    async function registerUser() {
        const theErrors = { email: '', pass: '', name: '' }
        if (!newEmail.trim())
            theErrors.email = 'O e-mail é obrigatório';
        else if (!/.+@.+\..+/gi.test(newEmail) || [...newEmail].filter(c => c === "@").length > 1)
            theErrors.email = "O e-mail deve ter um formato válido";

        if (!newPass)
            theErrors.pass = 'A senha é obrigatória';
        else if (newPass.length < 8 || !(/[a-z]/.test(newPass) && /[A-Z]/.test(newPass) && /[\d]/.test(newPass) && /[^\da-zA-Z]/.test(newPass)))
            theErrors.pass = "A senha deve ter 8 caracteres ou mais e conter uma letra maiúscula, uma minúscula, um número e um caracter especial";

        if (!name.trim())
            theErrors.name = 'O nome é obrigatório'
        else if (name.length < 10)
            theErrors.name = 'Informe seu nome completo'

        setNameErrors(theErrors.name);
        setNewEmailErrors(theErrors.email);
        setNewPasswordErrors(theErrors.pass);

        if (theErrors.email || theErrors.pass || theErrors.name)
            return;

        setIsLoading(true);
        requestRegister();

    }

    function showModal() {
        Animated.timing(slideAnim, {
            toValue: Dimensions.get('screen').height * .15,
            duration: 300,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.ease)
        }).start();
        setIsShowingModal(true);
    }

    function hideModal() {
        Animated.timing(slideAnim, {
            toValue: Dimensions.get('screen').height + 50,
            duration: 300,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.ease)
        }).start();
        setIsShowingModal(false)
    }

    useEffect(() => {
        if (token) {
            setIsLoading(true);
            navigation.dispatch(StackActions.replace('Dashboard', { token, user }))
        }
    }, [token])

    return <View style={style.wholeView}>

        <Loading />
        {
            isBiometricsAvailable ? <TouchableOpacity style={style.fingerPrint} onPress={() => retryFingerPrint()}>
                <FingerPrint height={style.fingerPrint.fontSize} width={style.fingerPrint.fontSize} color={styleValues(mode == 'dark').textColor} />
            </TouchableOpacity> : <></>

        }

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
                <TouchableOpacity />
                {passwordErrors ? <Text style={style.errorText}>{passwordErrors}</Text> : <></>}
            </View>

            <TouchableOpacity style={style.submit} onPress={() => attemptLogin()}>
                <Text style={style.submitLabel}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[style.submit, { backgroundColor: 'transparent', borderWidth: 2, borderRadius: 4, borderColor: mode == 'dark' ? 'white' : 'black' }]} onPress={() => showModal()}>
                <Text style={[style.submitLabel, { color: mode == 'dark' ? 'white' : 'black' }]}>Novo Usuário</Text>
            </TouchableOpacity>

        </View>

        <TouchableOpacity style={[style.modalBackground, { display: isShowingModal ? 'flex' : 'none' }]} onPress={() => hideModal()}>
        </TouchableOpacity>

        <Animated.View style={[style.newUserModal, { top: slideAnim }]}>

            <TouchableOpacity style={{ position: 'absolute', top: 0, right: 0, paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center', backgroundColor: mode == 'dark' ? 'rgba(0, 0, 0, .7)' : 'rgba(255, 255, 255, .7)' }} onPress={() => hideModal()}>
                <Text style={{ color: mode == 'dark' ? 'white' : 'black', fontSize: 28, fontWeight: 'bold' }}>X</Text>
            </TouchableOpacity>

            <View style={style.fieldSet}>

                <View style={style.fieldGroup}>
                    <TextInput style={style.field} secureTextEntry={false} placeholder="Digite seu nome"
                        placeholderTextColor={placeHolderColor} value={name} onChange={(v) => setName(v.nativeEvent.text)} />
                    {nameErrors ? <Text style={style.errorText}>{nameErrors}</Text> : <></>}
                </View>
                <View style={style.fieldGroup}>
                    <TextInput style={style.field} secureTextEntry={false} placeholder="Digite seu e-mail" keyboardType="email-address" autoCapitalize="none"
                        placeholderTextColor={placeHolderColor} value={newEmail} onChange={(v) => setNewEmail(v.nativeEvent.text)} />
                    {newEmailErrors ? <Text style={style.errorText}>{newEmailErrors}</Text> : <></>}
                </View>
                <View style={style.fieldGroup}>
                    <TextInput style={style.field} secureTextEntry={true} placeholder="Digite sua senha" autoCorrect={false} autoCapitalize="none"
                        placeholderTextColor={placeHolderColor} value={newPass} onChange={(v) => setNewPass(v.nativeEvent.text)} />
                    <TouchableOpacity />
                    {newPasswordErrors ? <Text style={style.errorText}>{newPasswordErrors}</Text> : <></>}
                </View>

                <TouchableOpacity style={style.submit} onPress={() => registerUser()}>
                    <Text style={style.submitLabel}>Salvar</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
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
            backgroundColor: styleValuesForMode.backgroundColor,

        },
        fingerPrint: {
            position: 'absolute',
            bottom: 16,
            right: 16,
            fontSize: 60
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
            marginBottom: 32,
            position: 'relative'
        },
        field: styleValuesForMode.fieldStyle,
        submit: styleValuesForMode.submitStyle,
        submitLabel: styleValuesForMode.submitTextStyle,
        errorText: {
            fontSize: 12,
            color: styleValuesForMode.errorText,
        },
        newUserModal: {
            position: 'absolute',
            padding: 16,
            paddingVertical: 48,
            width: '100%',
            borderRadius: 4,
            backgroundColor: isDarkMode ? '#232323' : '#f0f0f0',
            zIndex: 10
        },
        modalBackground: {
            position: 'absolute',
            zIndex: 9,
            backgroundColor: 'rgba(0, 0, 0, .5)',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        }
    })
}