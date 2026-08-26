import { TouchableOpacity, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { ReactNode } from 'react';
import { B, BText as Text } from '../../../libs/components';
import { useTheme } from '../../../theme';
import {
  FONT_SIZE,
  FONTSIZE,
  HEADER_HEIGHT,
  ICON_TOUCH_WIDTH,
} from '../../../theme/Constraints';
import { useText } from '../Text';
import { Divider } from './Divider';

export const Header = (
  props: {
    title
    rightButton?: ReactNode
    disableLeft?: boolean
    right?: ReactNode
  } = { title: '', rightButton: null, disableLeft: false },
) => {
  const colors = useTheme();
  const nav = useNavigation();
  return (
    <View style={[{ height: HEADER_HEIGHT }]}>
      <View style={{ flexDirection: 'row' }}>
        <Text
          style={{
            lineHeight: HEADER_HEIGHT,
            textAlign: 'center',
            fontSize: FONT_SIZE.PageTitle,
            flex: 1,
          }}
        >
          {props.title}
        </Text>
      </View>
      {!props.disableLeft && (
        <TouchableOpacity
          style={[
            {
              width: ICON_TOUCH_WIDTH,
              height: HEADER_HEIGHT,
              justifyContent: 'center',
              alignItems: 'flex-start',
              position: 'absolute',
              top: 0,
              left: 0,
            },
          ]}
          onPress={nav.goBack}
        >
          <B.ICon
            name="return-up-back"
            style={{ fontSize: FONT_SIZE.PageTitle }}
          />
        </TouchableOpacity>
      )}
      {props.right && (
        <View
          style={[
            {
              alignSelf: 'flex-end',
              height: HEADER_HEIGHT,

              justifyContent: 'center',
              alignItems: 'flex-start',
              position: 'absolute',
              top: 0,
              right: 0,
            },
          ]}
        >
          {props.right}
        </View>
      )}
      {!props.right && props.rightButton && (
        <View
          style={[
            {
              width: ICON_TOUCH_WIDTH + 16,
              height: HEADER_HEIGHT - 12,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              top: 6,
              right: 0,
              paddingLeft: 8,
              paddingRight: 8,
              //backgroundColor: colors.secondary,
              borderRadius: HEADER_HEIGHT / 2,
            },
          ]}
        >
          {props.rightButton}
        </View>
      )}
    </View>
  );
};

export const HeaderWithSave = (props: {
  title
  disableLeft: boolean
  onSave: () => void
}) => {
  const text = useText();
  return (
    <Header
      {...props}
      rightButton={
        <TouchableOpacity onPress={props.onSave}>
          <Text>{text.save || 'Lưu'}</Text>
        </TouchableOpacity>
      }
    />
  );
};


export const ModalHeader = (props: {
  left?: ReactNode
  title: string
  right?: ReactNode
}) => {

  return <View>
    <View style={{ paddingTop: 4, paddingBottom: 4 }}>
      <View style={{ flexDirection: 'row' }}>
        <View>{props.left}</View>
        <View style={{ flex: 1 }}><Text style={{ fontSize: FONTSIZE.NORMAL, fontWeight: '400', textAlign: 'center' }}>{props.title}</Text></View>
        <View>{props.right}</View>
      </View>
    </View>
    <Divider />
  </View>;
};