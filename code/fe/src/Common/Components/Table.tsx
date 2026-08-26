import { ReactNode } from 'react';
import { StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import { BText as Text } from '../../../libs/components';
export function Table<T>(props: {
  data: Array<T>
  cols: Record<
    keyof T,
    { title?; container?: StyleProp<ViewStyle>, style?: StyleProp<TextStyle>; val: (e: T) => string }
  >
  emptyRender?: ReactNode
}) {
  return (
    <View>
      {/**header */}
      {Object.keys(props.cols).map((r, i) => (<View key={i} style={[props.cols[r].container]}>
        <Text style={[props.cols[r].style]}>{props.cols[r].title || r}</Text>
      </View>
      ))}
      {/**data */}
      {props.data.map((d, ii) => (
        <View key={ii}>
          {Object.keys(props.cols).map((r, i) => (
            <Text key={i} style={[props.cols[r].style]}>{props.cols[r].val(d)}</Text>
          ))}
        </View>
      ))}
    </View>
  );
}
