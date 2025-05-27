import React, { useEffect, useRef } from "react";
import { TouchableOpacity, View, Text, Animated, Easing, StyleSheet } from "react-native";
import { THEAMCOLOR } from "../../assets/theam/theam";

const ToggleSwitch = ({ isOn, onToggle, onColor, offColor, size = "large", labelStyle }) => {
    const knobAnim = useRef(new Animated.Value(isOn ? 1 : 0)).current;

    const switchWidth = size === 'large' ? 105 : 60;
    const switchHeight = size === 'large' ? 44 : 30;
    const knobSize = size === 'large' ? 34 : 20;
    const knobOffset = switchWidth - knobSize - 12; // Adjust for padding

    useEffect(() => {
        Animated.timing(knobAnim, {
            toValue: isOn ? 1 : 0,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [isOn]);

    const translateX = knobAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, knobOffset],
    });

    return (
        <TouchableOpacity onPress={() => onToggle(!isOn)} activeOpacity={0.8}>
            <View style={{ alignItems: 'center' }}>
                <View
                    style={{
                        width: switchWidth,
                        height: switchHeight,
                        borderRadius: 30,
                        backgroundColor: isOn ? onColor : offColor,
                        paddingHorizontal: 6,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        overflow: 'hidden',
                        borderColor: "gray",
                        borderWidth: 1,
                    }}
                >
                    {/* Animated Label Left */}
                    <Animated.View style={[styles.labelWrapper, { opacity: knobAnim }]}>
                        <Text style={[styles.label, { color: 'white' }, labelStyle]}>
                            Online
                        </Text>
                    </Animated.View>

                    {/* Knob */}
                    <Animated.View
                        style={[
                            {
                                width: knobSize,
                                height: knobSize,
                                borderRadius: knobSize / 2,
                                backgroundColor: 'gray',
                                position: 'absolute',
                                top: (switchHeight - knobSize) / 2.45,
                                left: 6,
                                transform: [{ translateX }],
                            },
                        ]}
                    />

                    {/* Animated Label Right */}
                    <Animated.View style={[styles.labelWrapper, {
                        opacity: knobAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 0],
                        })
                    }]}>
                        <Text style={[styles.label, labelStyle]}>
                            Offline
                        </Text>
                    </Animated.View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    labelWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: -1,
    },
    label: {
        color: 'gray',
        fontWeight: 'bold',
    },
});

export default ToggleSwitch;
