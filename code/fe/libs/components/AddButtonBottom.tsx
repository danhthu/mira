
import {StyleSheet,Text, TouchableOpacity} from'react-native'
import { useText } from '../../lang';
import { AppStyle, useTheme } from '../../theme';
export const AddButtonBottom=(props:{theme?:typeof AppStyle,onPlusClick:()=>void})=>{
    const text = useText()
    const styles = Styles(useTheme())
    return (
        <TouchableOpacity style={styles.addButton_container} onPress={props.onPlusClick}>
        <Text style={styles.addButton_text}>{text.plus}</Text>
      </TouchableOpacity>
    )
}

const Styles = (theme: typeof AppStyle) =>
    StyleSheet.create({

        addButton_container: {
            borderRadius: 50,
            width: 50,
            height: 50,
            backgroundColor: theme.tertiary,
            bottom: 90,
            right: 10,
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
          },
          addButton_text: {
            fontSize: 25,
            marginBottom: 7,
            color: theme.onTertiary,
            textAlign: 'center',
          },
    })
