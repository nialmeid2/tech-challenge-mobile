import { UserContext } from "@src/context/UserContext";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, useColorScheme, View } from "react-native";
import LoadingSvg from "@src/assets/loading.svg";


export default function Loading() {

    const { isLoading } = useContext(UserContext);
    const loopAnimation = useRef(new Animated.Value(0)).current;
    const [loop, setLoop] = useState<Animated.CompositeAnimation | undefined>(undefined);

    const style = styleFunc(useColorScheme() === 'dark');

    const doLoop = useCallback(() => {

        if (loop) {
            loop.reset();
            loop.start();
        }
        else {
            const newLoop = Animated.loop(Animated.timing(loopAnimation, {
                toValue: 1,
                useNativeDriver: true,
                duration: 800,
                easing: Easing.linear
            }));
            setLoop(newLoop);
            newLoop.start();
        }
    }, []);

    const AnimatedLoading = useMemo(() => Animated.createAnimatedComponent(LoadingSvg), []);
    const rotateInterpolate = useMemo(() => loopAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    }), []);

    useEffect(() => {
        if (isLoading) {
            if (loop) {
                loop.reset();
                loop.start();
            }
            else
                doLoop();
        }            
        else if(loop)
            loop.stop();
    }, [isLoading])

    return <>
        {
            isLoading && <View style={[style.background, { zIndex: 1000 }]}>
                <AnimatedLoading height={'80%'} width={'80%'} style={[style.loading, { transform: [{ rotate: rotateInterpolate }] }]} />
            </View>

        }
    </>
}

const styleFunc = (isDarkMode: boolean) => StyleSheet.create({
    loading: {
        color: isDarkMode ? 'white' : 'black',
    },
    background: {
        flex: 1,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
    },
})