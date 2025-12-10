import { StackActions, useNavigation } from "@react-navigation/native";
import { UserContext } from "@src/context/UserContext";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Animated, Easing, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { styleValues } from "../styles/StylesCommons";
import Header from "@src/components/Header";
import DatePicker from 'react-native-date-picker'
import { TransactionOptionItems } from "@src/model/enums/Transaction";
import { addDays, Transaction } from "@src/model/Transaction";
import Loading from "@src/components/Loading";
import { initCapSentence, toMoney } from "@src/model/utils/str";


export default function TransactionsScreen() {

    const { user, token, setIsLoading } = useContext(UserContext);

    const [type, setType] = useState('');
    const [startDate, setStartDate] = useState<Date>(addDays(new Date(), -5));
    const [startOpen, setStartOpen] = useState(false);
    const [endOpen, setEndOpen] = useState(false);
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [errors, setErrors] = useState('');
    const [canLoadMore, setCanLoadMore] = useState(false);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const fadeAnim = useRef(new Animated.Value(1)).current;


    const navigation = useNavigation();
    const isDarkMode = useColorScheme() == 'dark';
    const style = styleFunc(isDarkMode);

    async function submitSearch(isNextPage = false) {
        setIsLoading(true);
        Animated.timing(fadeAnim, {
            toValue: .6,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease)
        }).start()
        setErrors('');
        try {

            const limit = 10;
            const theLink = `${process.env.BACKEND_URL}transaction/search?from=${startDate.toISOString()}&to=${endDate.toISOString()}&type=${type}&perPage=${limit}`
                + `${isNextPage ? `&pick=${filteredTransactions[filteredTransactions.length - 1].id}` : ''}`

            console.log(theLink)

            const transactionList: Transaction[] = await fetch(`${theLink}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }).then(res => res.json())

            if (transactionList.length < limit)
                setCanLoadMore(false);
            else
                setCanLoadMore(true);

            if (!isNextPage)
                setFilteredTransactions(transactionList);
            else
                setFilteredTransactions(filteredTransactions.concat(transactionList));

            setIsLoading(false);


        } catch (err: any) {
            console.log(err);
            setIsLoading(false);
            setErrors(err.message || 'Erro buscando transações');
        } finally {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.ease)
            }).start()
        }
    }

    useEffect(() => {
        if (!user)
            navigation.dispatch(StackActions.replace('Login'))
    }, [user]);


    return <>

        <Loading />

        <ScrollView style={[style.body]} >



            <Header />

            <Animated.View style={[style.filterTransactions, {opacity: fadeAnim}]}>
                <Text style={style.title}>Filtrar Transações</Text>

                <View style={style.fieldDiv}>
                    <Text style={style.label}>Intervalo de Data</Text>

                    <View style={style.dateField}>
                        <TouchableOpacity style={style.field} onPress={() => setStartOpen(true)}>
                            <DatePicker date={startDate} open={startOpen} mode="date"
                                onCancel={() => setStartOpen(false)} modal={true} onConfirm={(date) => {
                                    setStartOpen(false);

                                    if (date > endDate) {
                                        setStartDate(endDate);
                                        setEndDate(date);
                                        return;
                                    }

                                    setStartDate(date);
                                }} />
                            <Text>{startDate.toLocaleDateString(['pt-br', 'en-us'], { dateStyle: 'short' })}</Text>
                        </TouchableOpacity>
                        <Text style={style.label}> - </Text>
                        <TouchableOpacity style={style.field} onPress={() => setEndOpen(true)}>
                            <DatePicker date={endDate} open={endOpen} mode="date" style={style.field}
                                onCancel={() => setEndOpen(false)} modal={true} onConfirm={(date) => {
                                    setEndOpen(false);
                                    if (date < startDate) {
                                        setStartDate(date);
                                        setEndDate(startDate);
                                        return;
                                    }
                                    setEndDate(date);
                                }} />
                            <Text>{endDate.toLocaleDateString(['pt-br', 'en-us'], { dateStyle: 'short' })}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={style.fieldDiv}>
                    <Text style={style.label}>Tipo de transação</Text>
                    <TransactionOptionItems setVal={setType} style={style.comboBox} val={type} />
                </View>

                {errors ? <Text style={style.errorText}>{errors}</Text> : <></>}

                <TouchableOpacity style={style.submit} onPress={() => submitSearch(false)} disabled={!user?.name || !token}>
                    <Text style={style.submitLabel}>Buscar</Text>
                </TouchableOpacity>

                {filteredTransactions?.length ? <View style={style.transactionsList}>
                    {filteredTransactions.map((item) => <View key={item.id} style={style.entry}>
                        <View style={style.operationInfo}>
                            <Text style={style.operationInfoMonth}>{initCapSentence(new Date(item.createdAt).toLocaleDateString(['pt-br', 'en-us'], { month: 'long' }))}</Text>
                            <Text style={style.operationInfoType}>{item.type}</Text>
                            <Text style={style.operationInfoValue}>{toMoney(item.value)}</Text>
                            <Text style={style.operationDate}>{new Date(item.createdAt).toLocaleDateString(['pt-br', 'en-us'], { dateStyle: 'short' })}</Text>
                        </View>
                        
                    </View>)}

                    {canLoadMore ? <TouchableOpacity style={[style.submit, { marginTop: 16 }]} onPress={() => submitSearch(true)} disabled={!user?.name || !token}>
                        <Text style={style.submitLabel}>Carregar mais</Text>
                    </TouchableOpacity> : <></>}

                </View> : <></>}

            </Animated.View>

        </ScrollView>
    </>

}

const styleFunc = (isDarkMode: boolean) => {

    const styleValuesForMode = styleValues(isDarkMode);
    return StyleSheet.create({
        body: {
            flex: 1,
            backgroundColor: styleValuesForMode.backgroundColor
        },
        filterTransactions: {
            backgroundColor: isDarkMode ? '#444' : '#ccc',
            margin: 16,
            padding: 16,
            borderRadius: 8
        },
        transactionsList: {
            marginVertical: 16,
        },
        fieldDiv: {
            marginVertical: 12
        },
        title: styleValuesForMode.titleText,
        label: styleValuesForMode.labelText,
        comboBox: styleValuesForMode.comboBox,
        dateField: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        field: { ...styleValuesForMode.fieldStyle, backgroundColor: 'white', paddingHorizontal: 8, paddingVertical: 16, borderBottomWidth: 0, flex: 1, color: 'black' },
        submit: { ...styleValuesForMode.submitStyle, marginTop: 24 },
        submitLabel: { ...styleValuesForMode.submitTextStyle, fontSize: 20 },
        errorText: {
            fontSize: 12,
            marginVertical: 4,
            color: styleValuesForMode.errorText,
        },
        entry: {
            flexDirection: 'row',
            marginVertical: 8,
            alignItems: 'center'
        },
        operationInfo: {
            flex: 1,
            marginRight: 8,
            paddingVertical: 8

        },
        operationInfoMonth: {
            color: isDarkMode ? '#57b847' : '#2b6222',
            fontWeight: 'bold',
            fontSize: 16
        },
        operationInfoType: {
            color: styleValuesForMode.textColor,
            fontSize: 16
        },
        operationInfoValue: {
            color: styleValuesForMode.textColor,
            fontWeight: 'bold',
            fontSize: 18
        },
        operationDate: {
            fontSize: 12,
            color: styleValuesForMode.textColor
        }
    })
}