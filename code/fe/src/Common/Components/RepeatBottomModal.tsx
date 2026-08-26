import React, {
  useState,
} from 'react';
import { TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useCommonStyle } from '../Styles';

import Modal from 'react-native-modal';
import { StepNavigation, StepView } from 'react-native-step-view-navigation';
import { B } from '../../../libs/components';
import { BRepeatComponentV2 } from '../../../libs/components/BRepeatComponentV2';
import { Link } from '../../../libs/components/Link';
import { useTheme } from '../../../theme';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/Constraints';
import { repeatOption } from '../Interfaces';
import { useText } from '../Text';

const DefaultRepeatOption = { enable: true, kind: 'weekly', dayOfWeek: [0, 1, 2, 3, 4, 5] } as repeatOption;
const RepeatBottomModalFC2 = (
  props: {
    value: repeatOption,
    date?: Date,
    onChanged?: (val) => void
    onDismiss?: () => void
  }) => {
  const commonStyle = useCommonStyle();
  const style = useCommonStyle();
  const colors = useTheme();
  const text = useText();
  const layout = useWindowDimensions();
  //local store
  const [value, setValue] = useState({ ...DefaultRepeatOption, ...props.value });
  const [step, setStep] = useState(1);
  const data = [
    {
      icon: 'arrow-left',
      value: { enable: true, kind: 'daily', repeat: 1, days: [] } as repeatOption,
      selected: value => value && value.kind == 'daily',
      text: text.hangnay || 'Hàng ngày',
    },
    {
      icon: 'arrow-left',
      value: {
        enable: true,
        kind: 'weekly',
        repeat: 1,
        dayOfWeek: [(props.date || new Date()).getDay() as number],
      } as repeatOption,
      selected: value => value && value.kind == 'weekly' && value.repeat == 1 && value.dayOfWeek.length == 1,
      text: text.hangtuan || 'Hàng tuần',
    },
    {
      icon: 'arrow-left',
      value: {
        enable: true,
        kind: 'weekly',
        repeat: 1,
        dayOfWeek: [0, 1, 2, 3, 4, 5, 6],
      } as repeatOption,
      selected: value => value && value.kind == 'weekly' && value.repeat == 1 && value.dayOfWeek.length == 7,
      text: text.ngaytrongtuan || 'Ngày trong tuần',
    },

    {
      icon: 'arrow-left',
      value: {
        enable: true, kind: 'monthly', repeat: 1,
        days: [(props.date || new Date()).getDay() as number],
      } as repeatOption,
      selected: value => value && value.kind == 'monthly' && value.days && value.days.length == 1 && value.repeat == 1,
      text: text.hangthang || 'Hàng tháng',
    },
  ];

  return (
    <Modal isVisible
      animationIn="slideInUp"
      animationOut="slideOutDown"
      onModalHide={props.onDismiss}
      onBackdropPress={props.onDismiss}
      style={{ justifyContent: 'flex-end', flex: 1, }}
    >
      <View style={[{ backgroundColor: '#fff', borderRadius: 15, padding: 15, height: 320, }]}>
        <View style={[{ width: layout.width - 70, overflow: 'hidden' }]}>
          <StepNavigation step={step} dots={null} >
            <StepView >
              <View style={[{ width: layout.width - 75 }]}>
                <View style={{ flexDirection: 'row', borderBottomColor: colors.outlineVariant, borderBottomWidth: 1, paddingBottom: 10 }}>
                  <Link
                    viewStyle={[commonStyle.left, { flex: 1 }]}
                    style={{ color: colors.error }}
                    onPress={() => {
                      props.onChanged(null);
                    }}
                  >
                    {text.loaibo || 'Loại bỏ'}
                  </Link>
                  <B.Text
                    style={[commonStyle.full, { textAlign: 'center', flex: 1 }]}
                  >
                    {text.ngaylam || 'Ngày làm'}
                  </B.Text>

                  <Link
                    viewStyle={[
                      commonStyle.right,
                      { flex: 1, alignItems: 'flex-end' },
                    ]}
                    style={{ color: colors.primary }}
                    onPress={() => {
                      props.onChanged(value);
                    }}
                  >
                    {text.hoanthanh || 'Xong'}
                  </Link>
                </View>
                <View style={[{ flexDirection: 'column' }]}>
                  {data.map((d, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        setValue(d.value);
                      }}
                      style={[
                        {
                          height: 50,
                          justifyContent: 'center',
                        },

                      ]}
                    >
                      <View style={{ flexDirection: 'row' }}>
                        <B.ICon
                          style={[
                            commonStyle.left,
                            { marginRight: 8, fontSize: FONT_SIZE.Text + 3 },
                            d.selected(value) && { color: colors.primary, fontWeight: FONT_WEIGHT.SEMIBOLD },
                          ]}
                          name="repeat-outline"
                        ></B.ICon>
                        <B.Text
                          style={[
                            commonStyle.full,
                            { verticalAlign: 'middle' },
                            d.selected(value) && { color: colors.primary, fontWeight: FONT_WEIGHT.SEMIBOLD },
                          ]}
                        >
                          {d.text}
                        </B.Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={[
                    {
                      height: 50,
                      justifyContent: 'center',
                    },
                  ]}
                  onPress={() => setStep(2)}
                >
                  <View style={{ flexDirection: 'row' }}>
                    <B.ICon
                      style={[commonStyle.left, { fontSize: FONT_SIZE.ICon, marginRight: 8 },
                      data.filter(d => d.selected(value)).length == 0 && { color: colors.primary, fontWeight: FONT_WEIGHT.SEMIBOLD }

                      ]}
                      name={'calendar-clock-outline'}
                    ></B.ICon>
                    <B.Text
                      style={[commonStyle.full, { verticalAlign: 'middle' }, data.filter(d => d.selected(value)).length == 0 && { color: colors.primary, fontWeight: FONT_WEIGHT.SEMIBOLD }]}
                    >
                      {text.tuychinh || 'Tùy chỉnh'}
                    </B.Text>
                    <B.ICon
                      style={[commonStyle.right]}
                      name={'right'}
                    ></B.ICon>
                  </View>
                </TouchableOpacity>
              </View>

            </StepView>
            <StepView>
              <View style={[{ width: layout.width - 75 }]}>
                <View style={{ flexDirection: 'row', borderBottomColor: colors.outlineVariant, borderBottomWidth: 1, paddingBottom: 10 }}>
                  <Link
                    viewStyle={[commonStyle.left, { flex: 1 }]}
                    onPress={() => {
                      setStep(1);
                    }}
                  >
                    {text.quaylai || 'Quay lại'}
                  </Link>
                  <B.Text
                    style={[commonStyle.full, { textAlign: 'center', flex: 1 }]}
                  >
                    {text.laplaimoi || 'Lặp lại mỗi...'}
                  </B.Text>

                  <Link
                    viewStyle={[
                      commonStyle.right,
                      { flex: 1, alignItems: 'flex-end' },
                    ]}
                    style={{ color: colors.primary }}
                    onPress={() => props.onChanged(value)}
                  >
                    {text.xong || 'Xong'}
                  </Link>
                </View>
                <View >
                  <BRepeatComponentV2 data={value} dispatch={val => setValue({ ...value, ...val })} />
                </View>
              </View>
            </StepView>
          </StepNavigation>
        </View>
      </View>
    </Modal>
  );

};



export const RepeatBottomModal = React.memo(RepeatBottomModalFC2);
