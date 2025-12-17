import { UserContext } from "@src/context/UserContext";
import { initCapSentence, toMoney } from "@src/model/utils/str";
import { styleValues } from "@src/views/styles/StylesCommons";
import { useContext, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, useColorScheme, View } from "react-native";
import React from 'react'
import { PieChart, pieDataItem } from "react-native-gifted-charts";
import { AdditiveTransactions, TransactionTypes } from "@src/model/enums/Transaction";

interface extendedPieDataItem extends pieDataItem {
    legend: string
}

export default function Statement() {
    const { statement, user } = useContext(UserContext);

    const isDarkMode = useColorScheme() == 'dark';
    const style = styleFunc(isDarkMode);

    const graphData = statement.length ? getGraphData() : [];

    function getGraphData() {

        const expenses = [TransactionTypes.TRANSFER, TransactionTypes.WITHDRAW];
        const investments = [TransactionTypes.INVESTIMENT_FUNDS, TransactionTypes.PRIVATE_RETIREMENT, TransactionTypes.DIRECT_TREASURY, TransactionTypes.STOCKS]

        const incomeValue = statement.reduce((acc, item) => AdditiveTransactions.includes(item.type) ? acc + item.value : acc, 0);
        const expensesValue = statement.reduce((acc, item) => expenses.includes(item.type) ? acc + Math.abs(item.value) : acc, 0);
        const investmentsValue = statement.reduce((acc, item) => investments.includes(item.type) ? acc + Math.abs(item.value) : acc, 0);
        const interestValue = statement.reduce((acc, item) => item.type == TransactionTypes.INTEREST ? acc + Math.abs(item.value) : acc, 0);
        const textColor = isDarkMode ? 'black' : 'white'

        const newGraphData: extendedPieDataItem[] =[]; 
        
        incomeValue ? newGraphData.push({ value: incomeValue, text: `Rendimentos\n${toMoney(incomeValue)}`, textColor, color: 'aqua', legend: `Rendimentos (${toMoney(incomeValue)})` }) : '';
        expensesValue ? newGraphData.push({ value: expensesValue, text: `Gastos\n${toMoney(expensesValue)}`, textColor, color: 'green', legend: `Gastos (${toMoney(expensesValue)})` }) : '';
        investmentsValue ? newGraphData.push({ value: investmentsValue, text: `Investimentos\n${toMoney(investmentsValue)}`, textColor, color: 'orange', legend: `Investimentos (${toMoney(investmentsValue)})` }) : '';
        interestValue ? newGraphData.push({ value: interestValue, text: `Renda de \nInvestimentos\n${toMoney(interestValue)}`, textColor, color: 'purple', legend: `Renda de Investimentos (${toMoney(interestValue)})` }) : '';
        



        return newGraphData;


    }

    // return <FlatList 
    //     data={statement}
    //     keyExtractor={(item) => item.id}
    //     style={style.listDiv}
    //     ListHeaderComponent={<Text style={style.title}>Extrato</Text>}
    //     ListFooterComponent={<Text style={style.footNote}>Listando últimas 30 transações</Text>}
    //     renderItem={({item}) => <View style={style.entry}>
    //         <View style={style.operationInfo}>
    //             <Text style={style.operationInfoMonth}>{initCapSentence(new Date(item.createdAt).toLocaleDateString(['pt-br', 'en-us'], { month: 'long' }))}</Text>
    //             <Text style={style.operationInfoType}>{item.type}</Text>
    //             <Text style={style.operationInfoValue}>{toMoney(item.value)}</Text>
    //         </View>
    //         <Text style={style.operationDate}>{new Date(item.createdAt).toLocaleDateString(['pt-br', 'en-us'], {dateStyle: 'short'})}</Text>
    //     </View>}

    // />

    return statement ? <View style={style.listDiv}>
        <Text style={style.title}>Extrato</Text>

        {statement.map((item) => <View key={item.id} style={style.entry}>
            <View style={[style.operationInfo]} >
                <Text style={style.operationInfoMonth}>{initCapSentence(new Date(item.createdAt).toLocaleDateString(['pt-br', 'en-us'], { month: 'long' }))}</Text>
                <Text style={style.operationInfoType}>{item.type}</Text>
                <Text style={style.operationInfoValue}>{toMoney(item.value)}</Text>
                {item.file ? <Image source={{uri: item.file}} width={100} height={100} style={{objectFit: 'contain', marginTop: 4}}/> : <></>}
            </View>
            <Text style={style.operationDate}>{new Date(item.createdAt).toLocaleDateString(['pt-br', 'en-us'], { dateStyle: 'short' })}</Text>
        </View>)}


        {statement.length ? <>
            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 16, width: '100%' }}>
                <PieChart animationDuration={1500} showTooltip={true} paddingHorizontal={32} paddingVertical={32} isAnimated={true}
                    tooltipBackgroundColor={isDarkMode ? 'white' : 'black'}
                    radius={(Dimensions.get('screen').width - 32) * .4} data={getGraphData()} textColor="white" />
            </View>
            <View style={style.LegendDiv}>
                {graphData.map((gd) => <View key={gd.legend} style={style.LegendLine}>
                    <View style={[style.LegendColor, {backgroundColor: gd.color}]} />
                    <Text style={style.LegendText}>{gd.legend}</Text>
                </View>)}
            </View>
        </> : <></>}


        <Text style={style.footNote}>Listando últimas 30 transações</Text>
    </View> : <></>


}

const styleFunc = (isDarkMode: boolean) => {

    const styleValuesForMode = styleValues(isDarkMode);

    return StyleSheet.create({
        listDiv: {
            padding: 16,
            margin: 16,
            borderRadius: 8,
            backgroundColor: isDarkMode ? '#171717' : '#fcfcfc'
        },
        title: {
            fontSize: 24,
            marginBottom: 8,
            color: styleValuesForMode.textColor,
            fontWeight: 'bold'
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
        },
        footNote: {
            fontSize: 12,
            textAlign: 'center',
            marginTop: 8,
            color: styleValuesForMode.textColor
        },

        LegendDiv: {
            gap: 12,
            padding: 16
        },
        LegendLine: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12
        },
        LegendColor: {
            width: 48,
            height: 16,
            borderWidth: 1,
            borderColor: styleValuesForMode.textColor
        },
        LegendText: {
            color: styleValuesForMode.textColor,
            fontSize: 16
        }

    })
}