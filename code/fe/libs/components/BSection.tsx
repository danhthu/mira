import React, { ReactNode, useImperativeHandle, useState } from "react";
import { View, ViewStyle } from "react-native";
import { ViewProps } from "react-native-svg/lib/typescript/fabric/utils";

export const BSection = React.forwardRef((props: { hide?: boolean, ref?: any } & ViewProps, ref) => {
    const [hide, setHide] = useState(props.hide)
    useImperativeHandle(ref, () => ({
        update: (hide) => {
            setHide(hide)
        },
    }))
    if (hide) return null
    return <View {...props}>
        {props.children}
    </View>
})