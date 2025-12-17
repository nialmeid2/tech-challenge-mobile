import { StackActions, useNavigation } from "@react-navigation/native";
import { UserContext } from "@src/context/UserContext";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Alert, Animated, Dimensions, Easing, LayoutAnimation, LayoutAnimationConfig, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, UIManager, useColorScheme, View } from "react-native";
import { styleValues } from "../styles/StylesCommons";
import Header from "@src/components/Header";
import DatePicker from 'react-native-date-picker'
import { TransactionOptionItems } from "@src/model/enums/Transaction";
import { addDays, Transaction } from "@src/model/Transaction";
import Loading from "@src/components/Loading";
import { initCapSentence, toMoney } from "@src/model/utils/str";
import { Image } from 'react-native';




export default function TransactionsScreen() {

    const { user, token, setIsLoading, updateStatement } = useContext(UserContext);

    const [type, setType] = useState('');
    const [startDate, setStartDate] = useState<Date>(addDays(new Date(), -5));
    const [startOpen, setStartOpen] = useState(false);
    const [endOpen, setEndOpen] = useState(false);
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [errors, setErrors] = useState('');
    const [canLoadMore, setCanLoadMore] = useState(false);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const [isEditingTransaction, setIsEditingTransaction] = useState({} as Record<string, boolean>);
    const [isImageGrown, setIsImageGrown] = useState({} as Record<string, boolean>);
    const [transactionError, setTransactionError] = useState({} as Record<string, string>);
    const [transactionMsg, setTransactionMsg] = useState({} as Record<string, string>);
    const [edittedValue, setEdittedValue] = useState({} as Record<string, string>)

    const fadeAnim = useRef(new Animated.Value(1)).current;

    if (Platform.OS === 'android') {
        if (UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }

    const navigation = useNavigation();
    const isDarkMode = useColorScheme() == 'dark';
    const placeHolderColor = isDarkMode ? 'rgba(255, 255, 255, .5)' : 'rgba(0, 0, 0, .5)';
    const style = styleFunc(isDarkMode);

    async function submitSearch(isNextPage = false) {

        startAnimation();

        try {

            const limit = 10;
            const theLink = `${process.env.BACKEND_URL}transaction/search?from=${startDate.toISOString()}&to=${endDate.toISOString()}&type=${type}&perPage=${limit}`
                + `${isNextPage ? `&pick=${filteredTransactions[filteredTransactions.length - 1].id}` : ''}`



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

            finishAnimation();


        } catch (err: any) {
            console.log(process.env.BACKEND_URL);
            console.log(err);
            finishAnimation();
            setErrors(err.message || 'Erro buscando transações');
        }

    }

    function startAnimation() {
        setIsLoading(true);
        setErrors('');
        setTransactionError({} as Record<string, string>);
        setTransactionMsg({} as Record<string, string>)
        setIsEditingTransaction({} as Record<string, boolean>);
        setEdittedValue({} as Record<string, string>);
        Animated.timing(fadeAnim, {
            toValue: .6,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease)
        }).start();
    }

    function finishAnimation() {

        setIsLoading(false);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease)
        }).start();

    }

    async function deleteTransaction(id: string) {

        startAnimation();

        try {

            const theLink = `${process.env.BACKEND_URL}transaction/${id}`

            const { message, status }: { message: string, status: number } = await fetch(`${theLink}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }).then(res => res.json());



            if (status == 200) {

                await updateStatement();
                finishAnimation();

                const newTransactions = filteredTransactions.filter((f) => f.id != id);
                setFilteredTransactions(newTransactions);
                Alert.alert(message)
            } else {
                setTransactionError({ [id]: message });
                finishAnimation();
            }


        } catch (err: any) {
            console.log(process.env.BACKEND_URL);
            console.log(err);
            finishAnimation();
            setTransactionError({ [id]: err.message || 'Erro deletando transação' })

        }

    }

    function startEditing(item: Transaction) {
        setIsEditingTransaction(() => ({ ...isEditingTransaction, [item.id]: !isEditingTransaction[item.id] }));
        setEdittedValue(() => ({ ...edittedValue, [item.id]: Math.abs(item.value).toFixed(2) }))
    }

    async function editTransaction(id: string, value: string) {

        startAnimation();

        if (isNaN(+value) || !+value || +value < 0) {
            setTransactionError(() => ({ ...transactionError, [id]: 'O valor informado deve ser válido e maior que zero' }))
            finishAnimation();
            return;
        }

        const numValue = +value;



        try {

            const theLink = `${process.env.BACKEND_URL}transaction/${id}/${numValue}`

            const { message, status }: { message: string, status: number } = await fetch(`${theLink}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }).then(res => res.json());



            if (status == 200) {

                await updateStatement();
                finishAnimation();

                const newTransactions = filteredTransactions.map((t) => {
                    if (t.id == id) {
                        t.value = numValue;
                    }
                    return t;
                });
                setFilteredTransactions(newTransactions);
                setTransactionMsg(() => ({ ...transactionMsg, [id]: message }));
            } else {
                setTransactionError({ [id]: message })
                finishAnimation();
            }


        } catch (err: any) {
            console.log(process.env.BACKEND_URL);
            console.log(err);
            finishAnimation();
            setTransactionError({ [id]: err.message || 'Erro alterando transação' })

        }
    }

    useEffect(() => {
        if (!user)
            navigation.dispatch(StackActions.replace('Login'))
    }, [user]);

    LayoutAnimation.linear()


    return <>

        <Loading />

        <ScrollView style={[style.body]} >



            <Header />

            <Animated.View style={[style.filterTransactions, { opacity: fadeAnim }]}>
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
                            {!isEditingTransaction[item.id] ? <Text style={style.operationInfoValue}>{toMoney(item.value)}</Text> :
                                <TextInput style={style.field} placeholder="Digite o valor da transação" keyboardType="decimal-pad" autoCapitalize="none"
                                    placeholderTextColor={placeHolderColor} value={edittedValue[item.id]}
                                    onChange={(v) => {
                                        v.persist(); !isNaN(Number(v.nativeEvent?.text ?? '')) && !/\.\d{3,}/g.test(v.nativeEvent?.text ?? '') ?
                                            setEdittedValue(() => ({ ...edittedValue, [item.id]: v.nativeEvent?.text ?? edittedValue[item.id] })) : setEdittedValue(() => ({ ...edittedValue, [item.id]: edittedValue[item.id] }))
                                    }} />}
                            <Text style={style.operationDate}>{new Date(item.createdAt).toLocaleString(['pt-br', 'en-us'], { dateStyle: 'short', timeStyle: 'medium' })}</Text>

                            {item.file ? <TouchableOpacity onPress={() => setIsImageGrown(() => {


                                return { ...isImageGrown, [item.id]: !isImageGrown[item.id] };
                            })}>
                                <Image
                                    src={item.file}
                                    style={{ width: isImageGrown[item.id] ? 200 : 100, height: isImageGrown[item.id] ? 200 : 100, objectFit: 'contain', marginTop: 8 }}
                                />
                            </TouchableOpacity> : <></>}

                            {transactionError[item.id] ? <Text style={style.operationError}>{transactionError[item.id]}</Text> :
                                transactionMsg[item.id] ? <Text style={style.operationMessage}>{transactionError[item.id]}</Text> : <></>}
                        </View>

                        <View>
                            <TouchableOpacity style={[style.transactionButton, { backgroundColor: '#660000' }]} onPress={() => deleteTransaction(item.id)}>
                                <Text style={style.submitLabel}>Deletar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[style.transactionButton, { backgroundColor: !isEditingTransaction[item.id] ? '#005c25' : '#001a5c' }]}
                                onPress={() => !isEditingTransaction[item.id] ? startEditing(item) : editTransaction(item.id, edittedValue[item.id])}>
                                <Text style={style.submitLabel}>{!isEditingTransaction[item.id] ? 'Editar' : 'Salvar'}</Text>
                            </TouchableOpacity>
                        </View>

                    </View>)}

                    {canLoadMore ? <TouchableOpacity style={[style.submit, { marginTop: 16, backgroundColor: '#0045ad' }]} onPress={() => submitSearch(true)} disabled={!user?.name || !token}>
                        <Text style={[style.submitLabel]}>Carregar mais</Text>
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
        transactionButton: {
            ...styleValuesForMode.submitStyle,
            minWidth: 120,
            marginTop: 10,
        },
        errorText: {
            fontSize: 12,
            marginVertical: 4,
            color: styleValuesForMode.errorText,
        },
        entry: {
            flexDirection: 'row',
            marginVertical: 16,
            alignItems: 'center'
        },
        operationInfo: {
            flex: 1,
            marginRight: 8,
            paddingVertical: 8

        },
        operationInfoMonth: {
            color: isDarkMode ? '#8ffc7d' : '#1c4016',
            fontWeight: 'bold',
            fontSize: 20
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
            fontSize: 14,
            color: styleValuesForMode.textColor
        },
        operationError: {
            fontSize: 14,
            marginVertical: 4,
            color: styleValuesForMode.errorText,
        },
        operationMessage: {
            fontSize: 14,
            marginVertical: 4,
            color: isDarkMode ? '#8ffc7d' : '#1c4016',
        }
    })
}