import Header from "@src/components/Header";
import Loading from "@src/components/Loading";
import { UserContext } from "@src/context/UserContext";
import { InvestmentTypes, TransactionTypes } from "@src/model/enums/Transaction";
import { useContext, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, RefreshControl, StyleSheet, Text, TextStyle, useColorScheme, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { styleValues } from "../styles/StylesCommons";
import { toMoney } from "@src/model/utils/str";
import { PieChart, pieDataItem } from "react-native-gifted-charts";

interface InvestmentResponse {
    investments: Record<InvestmentTypes, number>;
    total: number
}


export default function InvestmentScreen() {

    const { token, setIsLoading } = useContext(UserContext);
    const [errors, setErrors] = useState('')
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [investmentsData, setIsvestmentData] = useState<InvestmentResponse | undefined>(undefined);

    const heightAnim = useRef(new Animated.Value(70)).current

    const isDarkMode = useColorScheme() == 'dark';
    const style = styleFunc(isDarkMode);

    async function getInvestments() {

        setErrors('');

        try {
            const theLink = `${process.env.BACKEND_URL}transaction/investments`
            const returnedInvestments: InvestmentResponse = await fetch(`${theLink}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }).then(res => res.json());

            setIsLoading(false);
            setIsvestmentData(returnedInvestments);

        } catch (err: any) {
            console.log(err);
            setIsLoading(false);
            setErrors(err.message || 'Erro buscando transações');
        } finally {
            Animated.timing(heightAnim, {
                toValue: 9999,
                useNativeDriver: false,
                duration: 3500,
                easing: Easing.inOut(Easing.ease)
            }).start();
        }
    }

    async function refreshInvestments() {
        setIsRefreshing(true);
        setErrors('')

        await getInvestments()
            .then(() => setIsRefreshing(false))
            .catch(() => setIsRefreshing(false))

    }

    function getGraphData() {
       
        if (!investmentsData)
            return [];

        const textColor = isDarkMode ? 'black' : 'white'

        const newGraphData: pieDataItem[] = [];

        const funds = investmentsData.investments["Investimento em fundos"];
        const treasury = investmentsData.investments["Investimento em Tesouro Direto"];
        const retirement = investmentsData.investments["Investimento em Previdência Privada"];
        const stocks = investmentsData.investments["Investimento em Bolsa de Valores"];
        const interest = investmentsData.investments["Rendimentos de Investimentos"]
        
        newGraphData.push({ value: funds, text: `Investimento em \nFundos\n${toMoney(funds)}`, textColor });
        newGraphData.push({ value: treasury, text: `Investimento em \nTesouro Direto\n${toMoney(treasury)}`, textColor })   
        newGraphData.push({ value: retirement, text: `Investimento em \nPrevidência Privada\n${toMoney(retirement)}`, textColor })   
        newGraphData.push({ value: stocks, text: `Investimento em \nBolsa de Valores\n${toMoney(stocks)}`, textColor });         
        newGraphData.push({ value: interest, text: `Rendimentos de \nInvestimentos\n${toMoney(interest)}`, textColor });         
         

        return newGraphData;
    }

    useEffect(() => {
        setIsLoading(true)
        getInvestments()
            .then(() => setIsLoading(false))
            .catch(() => setIsLoading(false))

    }, [])

    return <>
        <Loading />

        <ScrollView style={style.body} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => refreshInvestments()} />}>

            <Header />

            <Animated.View style={[style.investmentsList, { maxHeight: heightAnim }]}>
                <Text style={style.title}>Investimentos</Text>

                {errors ? <Text style={style.errorText}>{errors}</Text> : <></>}

                {
                    investmentsData?.investments ? <>

                        <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 16, width: '100%' }}>
                            <PieChart animationDuration={1500} showTooltip={true} paddingHorizontal={32} paddingVertical={32} isAnimated={true}
                                tooltipBackgroundColor={isDarkMode ? 'white' : 'black'} donut={true} innerCircleColor={isDarkMode ? '#444' : '#ccc'}
                                radius={(Dimensions.get('screen').width - 32) * .4} data={getGraphData()} textColor="white" />
                        </View>

                        <Text style={style.total}>Total: R$ {investmentsData.total}</Text>

                        <View style={style.investment}>
                            <Text style={style.investmentName}>{TransactionTypes.INVESTIMENT_FUNDS}</Text>
                            <Text style={style.investmentValue}>{toMoney(investmentsData.investments[TransactionTypes.INVESTIMENT_FUNDS])}</Text>
                        </View>

                        <View style={style.investment}>
                            <Text style={style.investmentName}>{TransactionTypes.DIRECT_TREASURY}</Text>
                            <Text style={style.investmentValue}>{toMoney(investmentsData.investments[TransactionTypes.DIRECT_TREASURY])}</Text>
                        </View>

                        <View style={style.investment}>
                            <Text style={style.investmentName}>{TransactionTypes.PRIVATE_RETIREMENT}</Text>
                            <Text style={style.investmentValue}>{toMoney(investmentsData.investments[TransactionTypes.PRIVATE_RETIREMENT])}</Text>
                        </View>

                        <View style={style.investment}>
                            <Text style={style.investmentName}>{TransactionTypes.STOCKS}</Text>
                            <Text style={style.investmentValue}>{toMoney(investmentsData.investments[TransactionTypes.STOCKS])}</Text>
                        </View>

                        <View style={[style.investment, { backgroundColor: '#2b6222' }]}>
                            <Text style={style.investmentName}>{TransactionTypes.INTEREST}</Text>
                            <Text style={style.investmentValue}>{toMoney(investmentsData.investments[TransactionTypes.INTEREST])}</Text>
                        </View>
                    </> : <></>
                }

            </Animated.View>

        </ScrollView>
    </>
}


const styleFunc = (isDarkMode: boolean) => {

    const styleValuesForMode = styleValues(isDarkMode);

    const investmentText = {
        fontSize: 20,
        marginVertical: 4,
        textAlign: 'center',
        color: 'white'
    } as TextStyle

    return StyleSheet.create({
        body: {
            flex: 1,
            backgroundColor: styleValuesForMode.backgroundColor
        },
        investmentsList: {
            backgroundColor: isDarkMode ? '#444' : '#ccc',
            margin: 16,
            padding: 16,
            borderRadius: 8,
            overflow: 'hidden'
        },
        title: styleValuesForMode.titleText,
        investmentName: investmentText,
        investmentValue: { ...investmentText, fontWeight: 'bold' } as TextStyle,
        errorText: {
            fontSize: 20,
            marginVertical: 4,
            color: styleValuesForMode.errorText,
        },
        investment: {
            backgroundColor: '#004D61',
            margin: 16,
            padding: 16,
            borderRadius: 8
        },
        total: {
            color: isDarkMode ? '#c2e0ff' : '#004D61',
            fontWeight: 'bold',
            marginVertical: 16,
            fontSize: 18
        }

    })
}