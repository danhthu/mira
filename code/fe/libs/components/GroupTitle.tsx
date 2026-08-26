
//#region group title

import { TouchableOpacity, View, StyleSheet } from "react-native"
import { Grid, Col } from "react-native-easy-grid"
import { BText as Text } from "./BText"
import { FONTSIZE } from "../../src/Common"
import { AppStyle, useTheme } from "../../theme"
import { BICon } from "./BIcon"
import { FONT_SIZE } from "../../theme/Constraints"


export const GroupTitle = (props: {
    label: string
    actionText: string
    onPress?: () => void
}) => {
    const style = useGroupTitleStyles()
    return (
        <View>
            <Grid style={style.container}>
                <Col>
                    <Text style={style.textLeft}>{props.label}</Text>
                </Col>
                <TouchableOpacity onPress={() => props.onPress && props.onPress()}>
                {props.actionText ? (
                    <Col style={style.rightContainer}>
                        <Text style={style.rightText}>{props.actionText}</Text>
                        <BICon name="right" style={style.rightIcon}></BICon>
                    </Col>) : null}
                </TouchableOpacity>
            </Grid>
        </View>
    )
}

const useGroupTitleStyles = () =>{
    const theme = useTheme()
    return StyleSheet.create({
        container: {
            marginTop: 10,
            marginBottom: 10,
        },
        textLeft: {
            alignSelf: 'flex-start',
            fontSize: FONT_SIZE.Text,
            fontWeight: 'bold',
            flex: 1,
        },
        rightContainer: {
            flex: null,
            flexDirection: 'row',
            justifyContent: 'center',
        },
        rightText: {
            alignSelf: 'flex-start',
            fontSize: FONT_SIZE.Text,
        },
        rightIcon: {
            alignSelf: 'flex-end',
            marginLeft: 5,
            fontSize: FONT_SIZE.ICon,
        },
    })
}
//#endregion
