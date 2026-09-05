import moment from 'moment';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { B, BText as Text } from '../../../libs/components';
import { useTheme } from '../../../theme';
import {
  FONT_SIZE,
  FONT_WEIGHT,
  HEADER_HEIGHT,
  ICON_TOUCH_WIDTH,
  PADDING,
} from '../../../theme/Constraints';
import { useCommonStyle } from '../../Common/Styles';
import Assets from '../Assets';
import { Challenge, ChallengeAssociate } from '../Entities';
import { useText } from '../Text';
import { Background } from './Background';
import { ChallengeLinkTo } from './ChallengeLinkTo';
import { ImageSelection } from './ImageSelection';

/**
 * Một biểu mẫu dùng cho cả Thêm và Sửa. Trước đây `Screens/Add.tsx` và
 * `Screens/Edit.tsx` là hai bản gần như chép tay của nhau (cùng sáu control,
 * khác mỗi nguồn dữ liệu), nên mỗi lần sửa màu hay chữ đều phải nhớ sửa hai chỗ.
 */
export const DEFAULT_WINDOW_DAYS = 30;

export const ChallengeForm = (props: {
  title: string
  data: Challenge
  associations: ChallengeAssociate[]
  onChanged: (data: Challenge) => void
  onAssociationsChanged: (value: ChallengeAssociate[]) => void
  onSave: () => void
  onBack: () => void
}) => {
  const { data } = props;
  const text = useText();
  const colors = useTheme();
  const style = useCommonStyle();

  /** Đặt tên xong là đã có một quãng mặc định, khỏi phải nhập hai ngày. */
  const withWindow = (patch: Partial<Challenge>): Challenge => {
    const start = data.start || new Date();
    return {
      ...data,
      ...patch,
      start,
      end: data.end || moment(start).add(DEFAULT_WINDOW_DAYS, 'days').toDate(),
    };
  };

  const icon = data.icon;
  const iconSource = !icon
    ? Assets['item-icon-default'].uri
    : icon.startsWith('assets')
      ? Assets[icon.replace('assets/', '')]?.uri ||
        Assets['item-icon-default'].uri
      : { uri: icon };

  return (
    <Background style={style.modalScreen}>
      <FormHeader
        title={props.title}
        onSave={props.onSave}
        onBack={props.onBack}
      />
      <ScrollView
        automaticallyAdjustKeyboardInsets
        style={{
          marginLeft: -PADDING.LEFT,
          marginRight: -PADDING.RIGHT,
          paddingBottom: 50,
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <Image source={iconSource} style={style.awatar.container} />
          <ImageSelection
            style={{ marginTop: 10 }}
            onChanged={(val) => props.onChanged({ ...data, icon: val })}
          />
        </View>

        <View style={style.sectionContainer}>
          <B.TextBox
            iconStyle={{
              color: colors.token.accent,
              fontSize: FONT_SIZE.PageTitle,
            }}
            inputStyle={{
              fontSize: FONT_SIZE.PageTitle,
              color: colors.token.textPrimary,
              textAlign: 'center',
            }}
            label={text.name}
            value={data.name || ''}
            onChanged={(val) => props.onChanged(withWindow({ name: val }))}
          />
        </View>

        <View
          style={[
            style.sectionContainer,
            {
              backgroundColor: colors.token.surface,
              borderRadius: 10,
              padding: 5,
              margin: 16,
            },
          ]}
        >
          <B.TextBox
            viewStyle={{ borderWidth: 0, borderBottomWidth: 0 }}
            mutipleline
            value={data.description || ''}
            label={text.note}
            onChanged={(val) => props.onChanged({ ...data, description: val })}
          />
        </View>

        <View style={style.sectionContainer}>
          <B.TextBox
            icon="calendar-start"
            iconStyle={{ color: colors.token.accent }}
            dataType="date"
            label={text.start_date}
            value={data.start}
            onChanged={(val) =>
              props.onChanged({
                ...data,
                start: val,
                end:
                  data.end ||
                  moment(val).add(DEFAULT_WINDOW_DAYS, 'days').toDate(),
              })
            }
          />
        </View>
        <View style={style.sectionContainer}>
          <B.TextBox
            icon="calendar-end"
            iconStyle={{ color: colors.token.accentAlt }}
            dataType="date"
            label={text.end_date}
            value={data.end}
            onChanged={(val) => props.onChanged({ ...data, end: val })}
          />
        </View>

        <View style={style.sectionContainer}>
          <B.TextBox
            icon="gift"
            iconStyle={{
              color: colors.token.accentSoft,
              fontSize: FONT_SIZE.ICon,
            }}
            label={text.reward}
            value={data.gif || ''}
            onChanged={(val) => props.onChanged({ ...data, gif: val })}
          />
          <Text style={{ color: colors.token.textMuted, fontSize: 13 }}>
            {text.reward_hint}
          </Text>
        </View>

        <View style={style.sectionContainer}>
          <ChallengeLinkTo
            challenge={data}
            value={props.associations}
            onChanged={props.onAssociationsChanged}
          />
        </View>
      </ScrollView>
    </Background>
  );
};

const FormHeader = (props: {
  title: string
  onSave: () => void
  onBack: () => void
}) => {
  const text = useText();
  const colors = useTheme();
  const style = useCommonStyle();
  return (
    <View>
      <Text style={style.header.title}>{props.title}</Text>
      <TouchableOpacity
        style={[
          style.header.leftButton,
          { width: ICON_TOUCH_WIDTH, height: HEADER_HEIGHT },
        ]}
        onPress={props.onBack}
      >
        <B.ICon name="return-up-back" style={{ fontSize: FONT_SIZE.PageTitle }} />
      </TouchableOpacity>
      <TouchableOpacity style={style.header.rightButton} onPress={props.onSave}>
        <Text
          style={{
            fontSize: FONT_SIZE.Text,
            color: colors.token.accent,
            fontWeight: FONT_WEIGHT.BOLD,
          }}
        >
          {text.save}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
