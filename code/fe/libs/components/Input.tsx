import { useNavigation } from '@react-navigation/native'
import moment from "moment"
import React, { MutableRefObject, useEffect, useState } from "react"
import { Image, Linking, Platform, StyleProp, StyleSheet, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import DateTimePickerModal from "react-native-modal-datetime-picker"
import { AirbnbRating } from "react-native-ratings"
import { useText } from "../../lang"
import { Router } from "../../Router"
import { useSettings } from "../../src/Common/Hooks"
import { useCommonStyle } from '../../src/Common/Styles'
import { useTheme } from "../../theme"
import { FONTSIZE, TBL_ROW_HEIGHT } from "../../theme/Constraints"
import { ButtonActionSheet } from "./BButton"
import { BICon, ICON_LIST } from "./BIcon"
import { BText } from "./BText"
import { debugStyle } from "./debugStyle"
import { Link } from "./Link"
import { useInputTextStyle } from "./Styles"


const rowHeigh = TBL_ROW_HEIGHT
export interface InputRef {
    update: (val) => void
}

export interface InputTextProp {
    viewStyle?: StyleProp<ViewStyle>,
    icon?: ICON_LIST,
    iconStyle?: TextStyle,
    hideClose?: boolean,
    focus?: boolean,
    inputStyle?: TextStyle | TextStyle[],

    descStyle?: TextStyle,
    isMandatory?: boolean,
    mutipleline?: boolean,
    label: string,
    showLabel?: boolean,
    labelinfo?: string,
    value?: string | Date | any,
    dataType?: 'string' | 'date' | 'number' | 'interger' | 'time',
    ref?: MutableRefObject<InputRef>,
    onChanged: (val) => void
}
export const BInputText = (props: InputTextProp) => {
    if (props.dataType && (props.dataType == 'date' || props.dataType == 'time')) {
        return <InputDate {...props} />

    } else {
        return <InputText {...props} />
    }
}



export interface CheckBoxProps {
    viewStyle?: ViewStyle,
    inputStyle?: TextStyle,
    descStyle?: TextStyle,
    isMandatory?: boolean,
    label: string,
    value?: boolean,
    onChanged: (val: boolean) => void
}

export const CheckBox = (props: CheckBoxProps) => {
    const style = useInputTextStyle()
    const [value, setValue] = useState(props.value)

    return <TouchableOpacity style={{ justifyContent: 'center' }} onPress={() => {
        setValue(!value);
        props.onChanged && props.onChanged(!value)
    }}>
        <View style={{ flexDirection: 'row' }}>
            {/** <Text style={[style.text, props.isMandatory ? style.danger : null]}>{props.label} {props.isMandatory ? '(*)' : ''}</Text> */}
            <BICon name={value ? 'checkbox-active' : 'checkbox-passive'} style={[{ alignSelf: 'flex-start', marginRight: 10, fontSize: FONTSIZE.NORMAL }, debugStyle]} />
            <BText style={{ flex: 1 }}>{props.label}</BText>
        </View>
    </TouchableOpacity>
}

const InputText = (props: InputTextProp) => {
    const style = useInputTextStyle()

    const [value, setValue] = useState(props.value || '')
    useEffect(() => {

        setValue(props.value)
    }, [props.value])
    const timeout = React.useRef(null);
    const onChangeHandler = (value) => {
        timeout.current && clearTimeout(timeout.current);
        setValue(value);
        timeout.current = setTimeout(() => {
            props.onChanged(value)
        }, 200);
    }
    const colors = useTheme()
    if (!props.mutipleline) {
        return <View
            style={[{ flexDirection: 'row' }, style.inputContainer, props.viewStyle]}
        >
            {props.icon &&
                <View style={{ height: rowHeigh, justifyContent: 'center' }}>
                    <BICon name={props.icon} style={[props.iconStyle, { fontSize: FONTSIZE.NORMAL, marginRight: 10, }]} /></View>}
            {props.showLabel && <View style={{ height: rowHeigh, justifyContent: 'center', }}><Text style={{ fontSize: FONTSIZE.NORMAL, fontWeight: 400 }}>{props.label}</Text></View>}
            <View style={[{
                flex: 1, borderBottomWidth: 1,
                borderBottomColor: colors.outline
            }]}>
                <TextInput
                    style={[style.textBox, props.inputStyle,]}
                    value={value + ''}
                    onChangeText={onChangeHandler}
                    placeholder={props.label}
                    keyboardType={props.dataType == 'number' ? 'numeric' : 'default'}
                    returnKeyType={'done'}
                    onSubmitEditing={(event) => (onChangeHandler(event.nativeEvent.text))}
                ></TextInput>
            </View>
        </View>
    }
    return <View style={[style.inputContainer, { flexDirection: 'row', borderWidth: 1, borderColor: style.inputContainer.borderBottomColor }, props.viewStyle]}>
        {props.showLabel && <Text>{props.label}</Text>}
        <TextInput
            placeholder={props.label}
            style={[style.multipleBox, props.inputStyle, { height: 80 }]}
            multiline={props.mutipleline}
            numberOfLines={props.mutipleline ? 4 : 1}
            value={value}
            onChangeText={onChangeHandler}></TextInput>
    </View>
}

const InputDate = (props: { dateFormat?: string } & InputTextProp) => {
    const style = useCommonStyle().form
    const [value, setValue] = useState(new Date)
    const colors = useTheme()
    const text = useText()
    const [settings] = useSettings()
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        setValue(date)
        hideDatePicker();
        props.onChanged(date)
    };
    const handleClose = (date) => {
        setValue(null)
        hideDatePicker();
    };
    useEffect(() => {
        setValue((props.value))
    }, [props.value])
    if (Platform.OS == 'web') {
        return <View><InputText {...props} value={value} /></View>
    } else {
        return (
            <View style={[{ flexDirection: 'row' }]}>
                {props.icon &&
                    <View style={{ height: rowHeigh, justifyContent: 'center' }}>
                        <BICon name={props.icon} style={[style.icon, props.iconStyle, { fontSize: FONTSIZE.NORMAL, marginRight: 10, }]} /></View>}
                <View style={[{ flexDirection: 'row', flex: 1, height: rowHeigh }]}>
                    <Link style={{ color: !value ? 'black' : colors.colorLink, lineHeight: rowHeigh }}
                        viewStyle={{ flex: 1 }}
                        children={value ? moment(value).format(props.dataType == 'time' ? 'HH:mm' : props.dateFormat || 'MMM, DD') : props.label}
                        onPress={showDatePicker} />
                    {value && !props.hideClose &&
                        <TouchableOpacity
                            style={[
                                {
                                    width: rowHeigh,
                                    alignSelf: 'flex-end',
                                    alignItems: 'flex-end',
                                    height: rowHeigh,
                                    justifyContent: 'center'
                                },
                            ]}
                            onPress={handleClose}
                        >
                            <BICon
                                style={[{ color: colors.error }]}
                                size={FONTSIZE.NORMAL}
                                name="close"
                            />
                        </TouchableOpacity>
                    }
                </View>
                <DateTimePickerModal
                    date={value || new Date}
                    isVisible={isDatePickerVisible}
                    mode={props.dataType as "date" | "time" | "datetime"}
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                />
            </View>
        )
    }
}


export const InputImage = (props: { name, meta, style }) => {
    const { name, meta, style } = props;

    const handlePress = () => {
        if (meta.link) {
            Linking.openURL(meta.link);
        }
    };

    return (
        <View key={name}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
                <Image
                    style={{ ...style, ...styles.image }}
                    source={{ uri: meta.source }}
                />
            </TouchableOpacity>
        </View>
    );
}
const styles = StyleSheet.create({
    image: {
        resizeMode: 'contain',
        alignSelf: 'center'
    },
});


export const CircleImage = (props: { size?, source?, style?, viewStyle?: ViewStyle, onChanged: (sourceId) => void }) => {
    const colors = useTheme()
    const styles = StyleSheet.create({
        image: {
            resizeMode: 'contain',
            alignSelf: 'center',
            borderRadius: (props.size || 80) / 2,
            backgroundColor: colors.surface,
            width: (props.size || 80),
            height: (props.size || 80),
        },
        text: {
            fontSize: FONTSIZE.SMALL
        }
    });

    const { size, source, style } = props;
    const [uri, setUri] = useState(source)
    const nav = useNavigation()
    const handlePress = (index) => {
        Router.OpenImageSelectorDialog(nav, (val, cat, src) => {
            //let _uri = require('../../assets/' + cat + '/' + val + '.png')
            //setUri(_uri)
            //props.onChanged && props.onChanged('assets/' + cat + '/' + val + '.png')
        })
    };

    const text = useText()

    return (
        <View style={props.viewStyle}>
            <Image
                style={{ ...style, ...styles.image }}
                width={props.size || 80}
                height={props.size || 80}
                source={uri}
            />
            <ButtonActionSheet textList={[text.for("Thư viện icon"), text.for("Thư viện ảnh")]} type="Link" title={text.for("Chọn nguồn ảnh")} onPress={handlePress}>{uri == null ? text.for('Thêm ảnh') : text.for('Thay đổi')}</ButtonActionSheet>
        </View>
    );
}




export default function Rating(props) {
    const styles = StyleSheet.create({
        text: {
            marginLeft: 10,
            marginTop: 10,
        },
        rating: {
        }
    });
    const {
        name, meta, style, onChangeInputValue, isMandatory
    } = props;

    const recordRating = rating => onChangeInputValue(rating);
    return (
        <View key={name}>
            <Text style={styles.text}>{`${meta.label} ${isMandatory ? '*' : ''}`}</Text>
            <AirbnbRating
                onFinishRating={recordRating}
                starContainerStyle={{ ...style, ...styles.rating }}
                count={meta.count || 5}
                defaultRating={0}
                showRating={false}
                size={30}
            />
        </View>
    );
}

