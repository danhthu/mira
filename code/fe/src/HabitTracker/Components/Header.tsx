import { useNavigation } from '@react-navigation/native';
import { ReactNode } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { B, BText as Text } from '../../../libs/components';
import { useTheme } from '../../../theme';
import {
  FONT_SIZE,
  FONT_WEIGHT,
  HEADER_HEIGHT,
  ICON_TOUCH_WIDTH,
} from '../../../theme/Constraints';
export const Header = (props: {
  title?: string
  right?: { text: string; onTouch: () => void } | ReactNode
}) => {
  const navigation = useNavigation();
  const colors = useTheme();
  // Kiểm tra nếu `right` là một đối tượng có `text` và `onTouch`
  const isCustomButton = (value: any): value is { text: string; onTouch: () => void } => {
    return value && typeof value === "object" && "text" in value && "onTouch" in value;
  };

  return (
    <View style={{ height: HEADER_HEIGHT, justifyContent: 'center' }}>
      <View>
        <Text
          style={{
            lineHeight: HEADER_HEIGHT,
            textAlign: 'center',
            fontSize: FONT_SIZE.PageTitle,
          }}
        >
          {props.title}
        </Text>
      </View>
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
        onPress={navigation.goBack}
      >
        <B.ICon
          name="return-up-back"
          style={{ fontSize: FONT_SIZE.PageTitle }}
        />
      </TouchableOpacity>
      {props.right && (isCustomButton(props.right) ? (
        <TouchableOpacity
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
              backgroundColor: colors.secondary,
              borderRadius: HEADER_HEIGHT / 2,
            },
          ]}
          onPress={props.right.onTouch}
        >
          <Text
            style={{
              fontSize: FONT_SIZE.Text,
              color: colors.onSecondary,
              fontWeight: FONT_WEIGHT.SEMIBOLD,
            }}
          >
            {props.right.text}
          </Text>
        </TouchableOpacity>
      ) : <>{props.right}</>)}
    </View>
  );
};
