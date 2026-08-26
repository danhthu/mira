import BottomSheet from '@gorhom/bottom-sheet';
import moment from 'moment';
import React, {
  useEffect,
  useRef,
  useState
} from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { useCommonStyle } from '../Styles';

import { StepNavigation, StepView } from 'react-native-step-view-navigation';
import { FONTSIZE } from '..';
import { B } from '../../../libs/components';
import { Link } from '../../../libs/components/Link';
import { useTheme } from '../../../theme';
import { useText } from '../../Work/Text';
import { getCurrentDay, getDay } from '../Utils/common';
import { CustomCalendarView } from './CustomCalendarView';
export declare interface DateTimeBottomModal {
  show: () => void
}
export const DateTimeBottomModal = (props: {
  testId?: string
  value: Date
  onChanged: (val) => void
}) => {
  const [modalContainerBg, setModalContainerBg] = useState(null);
  const commonStyle = useCommonStyle();
  const [step, setStep] = useState(1);
  const dateModalRef = useRef<BottomSheet>();
  const colors = useTheme();
  const text = useText();
  const [value, setValue] = useState(props.value);
  useEffect(() => {
    setValue(props.value || null);
  }, [props.value]);
  const [data, setData] = useState([]);
  useEffect(() => {
    setData([
      {
        icon: 'calendar-today',
        value: moment(getCurrentDay()).toDate(),
        selected:
          getDay(value).getTime() ==
          getDay(moment(getCurrentDay()).toDate()).getTime(),
        right: '',
        text: text.homnay || 'Hôm nay',
      },
      {
        icon: 'calendar-arrow-right',
        value: moment(getCurrentDay()).add(1, 'days').toDate(),
        selected:
          getDay(value).getTime() ==
          getDay(moment(getCurrentDay()).add(1, 'days').toDate()).getTime(),
        right: '',
        text: text.ngaymai || 'Ngày mai',
      },
      {
        icon: 'calendar-week',
        value: moment(getCurrentDay()).add(7, 'days').toDate(),
        selected:
          getDay(value).getTime() ==
          getDay(moment(getCurrentDay()).add(7, 'days').toDate()).getTime(),
        right: '',
        text: text.tuantoi || 'Tuần tới',
      },
    ]);
  }, [value]);
  return (
    <BottomSheet
      index={0}
      ref={dateModalRef}
      snapPoints={[300]}

      //enableDynamicSizing={true}
      backdropComponent={(props) => (
        <View
          onTouchEnd={() => {
            dateModalRef.current.close({ duration: 0 });
          }}
          pointerEvents={modalContainerBg == null ? 'box-none' : 'box-only'}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
            // backgroundColor:'#0BB1B266'
          }}
        ></View>
      )}
      enablePanDownToClose={true}
      containerStyle={{
        backgroundColor: modalContainerBg,
      }}
      onClose={() => {
        setModalContainerBg(null);
      }}
      style={{ paddingLeft: 15, paddingRight: 15 }}
    >
      <StepNavigation step={step} dots={null}>
        <StepView>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row' }}>
              <Link
                viewStyle={[commonStyle.left, { flex: 1 }]}
                style={{ color: colors.error }}
                onPress={() => {
                  props.onChanged(null);
                  dateModalRef.current.forceClose();
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
                  dateModalRef.current.forceClose();
                }}
              >
                {text.xong || 'Xong'}
              </Link>
            </View>

            <View style={[{ flexDirection: 'column' }]}>
              {data.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    props.onChanged(item.value);
                    dateModalRef.current.forceClose();
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
                        { fontSize: FONTSIZE.NORMAL, marginRight: 10 },
                        item.selected && { color: colors.primary },
                      ]}
                      name={item.icon}
                    ></B.ICon>
                    <B.Text
                      style={[
                        commonStyle.full,
                        { verticalAlign: 'middle' },
                        item.selected && { color: colors.primary },
                      ]}
                    >
                      {item.text}
                    </B.Text>
                    <B.Text
                      style={[
                        commonStyle.right,
                        item.selected && { color: colors.primary },
                      ]}
                    >
                      {moment(item.value).format('dddd, DD')}
                    </B.Text>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={() => {
                  setStep(2);
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
                      { fontSize: FONTSIZE.NORMAL, marginRight: 10 },
                      data.filter((d) => !d.selected).length == 0 && {
                        color: colors.primary,
                      },
                    ]}
                    name={'calendar-blank'}
                  ></B.ICon>
                  <B.Text
                    style={[
                      commonStyle.full,
                      { verticalAlign: 'middle' },
                      data.filter((d) => !d.selected).length == 0 && {
                        color: colors.primary,
                      },
                    ]}
                  >
                    {text.chongnay || 'Chọn ngày'}
                  </B.Text>
                  <B.ICon
                    style={[
                      commonStyle.right,
                      { fontSize: FONTSIZE.NORMAL, marginRight: 10 },
                      data.filter((d) => !d.selected).length == 0 && {
                        color: colors.primary,
                      },
                    ]}
                    name={'arrow-right'}
                  ></B.ICon>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </StepView>
        <StepView>
          <CustomCalendarView
            value={value}
            onBack={() => setStep(1)}
            onSet={(val) => {
              props.onChanged(val);
              dateModalRef.current.forceClose();
            }}
          />
        </StepView>
      </StepNavigation>
    </BottomSheet>
  );
};
