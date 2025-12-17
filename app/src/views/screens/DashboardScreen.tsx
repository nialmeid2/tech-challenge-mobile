
import PersonalInfo from "@src/components/PersonalInfo";
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";
import { styleValues } from "../styles/StylesCommons";
import { StackActions, useNavigation } from '@react-navigation/native';
import { SubtractiveTransactions, TransactionOptionItems, TransactionTypes } from "@src/model/enums/Transaction";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@src/context/UserContext";
import { toMoney } from "@src/model/utils/str";
import Statement from "@src/components/Statement";
import Header from "@src/components/Header";
import Loading from "@src/components/Loading";
import { DocumentPickerResponse, keepLocalCopy, pick, types } from "@react-native-documents/picker";
import RNFS from 'react-native-fs';


interface AddTransactionResponse {
    message: string;
    status: number;
}

export default function DashboardScreen() {

    const { user, token, setIsLoading, updateStatement, refreshStatement: refreshData, isRefreshing } = useContext(UserContext);
    const isDarkMode = useColorScheme() == 'dark';
    const [type, setType] = useState<'' | TransactionTypes>('');
    const [value, setValue] = useState<string>('');
    const placeHolderColor = isDarkMode ? 'rgba(255, 255, 255, .5)' : 'rgba(0, 0, 0, .5)';
    const [typeErrors, setTypeErrors] = useState('');
    const [valueErrors, setValueErrors] = useState('');
    const [receitErrors, setReceitErrors] = useState('');
    const [receit, setReceit] = useState<DocumentPickerResponse>();

    const navigation = useNavigation();
    const style = styleFunc(isDarkMode);

    async function submitTransaction() {

        if (!user?.name || !token)
            return;

        let isValid = true;
        setTypeErrors('');
        setValueErrors('');
        setReceitErrors('')

        if (!type) {
            setTypeErrors("O tipo de transação é obrigatório");
            isValid = false;
        }

        if (!value) {
            setValueErrors("O valor da transação é obrigatório");
            isValid = false;
        }
        else {
            if (isNaN(+value)) {
                setValueErrors("O valor informado é inválido")
                isValid = false
            }
            else if (+value <= 0) {
                setValueErrors("O valor da transação deve ser maior que zero")
                isValid = false;
            }
        }

        if (!isValid)
            return;

        const valNumber = +value;

        if (SubtractiveTransactions.find(t => t == type) && user.balance < valNumber) {
            setValueErrors("Não há saldo o suficiente para concluir essa transação.");
            return;
        }

        setIsLoading(true);

        const formData = new FormData();

        formData.append('type', type);
        formData.append('amount', value);

        if (receit)
            formData.append('img', {
                uri: receit.uri,
                name: receit.name || 'file',
                type: receit.type || 'application/octet-stream',
            });


        try {
            let res: any;

            const { message, status } = await fetch(`${process.env.BACKEND_URL}transaction/statement`, {
                method: 'POST',
                headers: {
                    // 'Content-Type': 'application/json',
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
                body: formData
                // body: JSON.stringify({
                //     amount: valNumber, type
                // })
            }).then(res => res.json())


            setType('');
            setValue('');
            setReceit(undefined);


            if (status != 201) {
                setValueErrors(message)
                setTypeErrors(message)
            }

            await updateStatement();
            setIsLoading(false);


        } catch (err: any) {
            console.log(process.env.BACKEND_URL);
            console.log(err);
            setIsLoading(false);
            setTypeErrors(err.message);
            setValueErrors(err.message);
        }
    }

    async function pickReceit() {

        setReceitErrors('');


        try {
            const res = await pick({
                allowMultiSelection: false,
                type: [types.images],
            })
            const allFilesAreImages = res?.every((file) => file.hasRequestedType)
            if (!allFilesAreImages || !res.length) {
                setReceitErrors('Selecione uma imagem');
                return;
            }

            

            setReceit(res[0])

        } catch (err: any) {

            if (err?.message?.includes('canceled')) {
                setReceit(undefined)
                return;
            }

            setReceitErrors(err.message || "Erro selecionando imagem")

        }




    }

    useEffect(() => {
        if (!user)
            navigation.dispatch(StackActions.replace('Login'))
    }, [user]);



    return <>

        <Loading />

        <ScrollView style={style.body} refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => refreshData()} />
        }>

            <Header />

            <PersonalInfo />

            <View style={style.addTransaction}>
                <Text style={style.title}>Nova transação</Text>
                <View style={style.fieldDiv}>
                    <Text style={style.label}>Tipo de transação *</Text>
                    <TransactionOptionItems setVal={setType} style={style.comboBox} val={type} />
                    {typeErrors ? <Text style={style.errorText}>{typeErrors}</Text> : <></>}
                </View>

                <View style={style.fieldDiv}>
                    <Text style={style.label}>Valor *</Text>
                    <TextInput style={style.field} placeholder="Digite o valor da transação" keyboardType="decimal-pad" autoCapitalize="none"
                        placeholderTextColor={placeHolderColor} value={value}
                        onChange={(v) => { v.persist(); !isNaN(Number(v.nativeEvent.text)) && !/\.\d{3,}/g.test(v.nativeEvent.text) ? setValue(v.nativeEvent.text) : setValue(value) }} />
                    {value ? <Text style={style.showMoney}>{toMoney(+value)}</Text> : <></>}
                    {valueErrors ? <Text style={style.errorText}>{valueErrors}</Text> : <></>}
                </View>

                <View style={style.fieldDiv}>
                    <Text style={style.label}>Recibo</Text>
                    <TouchableOpacity style={[style.field, style.fileField]} onPress={() => pickReceit()}>
                        <Text>{!receit ? 'Escolha um recibo (opcional)' : receit.name}</Text>
                    </TouchableOpacity>
                    {receitErrors ? <Text style={style.errorText}>{receitErrors}</Text> : <></>}

                    {receit ? <Image style={style.preview} source={{ uri: receit.uri }} width={200} height={200} /> : <></>}
                </View>

                <TouchableOpacity style={style.submit} onPress={() => submitTransaction()} disabled={!user?.name || !token}>
                    <Text style={style.submitLabel}>Concluir Transação</Text>
                </TouchableOpacity>
            </View>

            <Statement />

        </ScrollView>
    </>
}


const styleFunc = (isDarkMode: boolean) => {

    const styleValuesForMode = styleValues(isDarkMode);
    return StyleSheet.create({
        body: {
            flex: 1,
            backgroundColor: styleValuesForMode.backgroundColor,

        },
        
        addTransaction: {
            backgroundColor: isDarkMode ? '#161' : '#ccc',
            padding: 16,
            margin: 16,
            borderRadius: 8,
            elevation: 5,
        },
        showMoney: {
            fontSize: 12,
            color: styleValuesForMode.textColor,
            marginTop: 4
        },
        title: styleValuesForMode.titleText,
        fieldDiv: {
            marginVertical: 12
        },
        label: {
            fontSize: 16,
            marginBottom: 8,
            color: styleValuesForMode.textColor
        },
        comboBox: styleValuesForMode.comboBox,
        field: { ...styleValuesForMode.fieldStyle, backgroundColor: 'white', paddingHorizontal: 8, paddingVertical: 16, borderBottomWidth: 0, color: 'black' },
        fileField: {
            backgroundColor: '#f0f0f0',
            alignItems: 'center',
            borderStyle: 'dashed',
            borderColor: isDarkMode ? '#00aaff' : '#161',
            borderWidth: 3,
            borderBottomWidth: 3,
            borderBottomColor: isDarkMode ? '#00aaff' : '#161'
        },
        errorText: {
            fontSize: 12,
            marginTop: 4,
            color: styleValuesForMode.errorText,
        },
        submit: { ...styleValuesForMode.submitStyle, marginTop: 24 },
        submitLabel: { ...styleValuesForMode.submitTextStyle, fontSize: 20 },
        preview: {
            objectFit: 'contain',
            alignSelf: 'center',
            marginTop: 16

        },
    })

}