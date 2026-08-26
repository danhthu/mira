import React, {
  useState,
} from 'react';
import {
  Alert,
  View,
} from 'react-native';
import {
  B,
  BText as Text,
} from '../../../libs/components';
import { Work, workRepository } from '../Entities';
import { useText } from '../Text';

import moment from 'moment';
import { showMessage } from 'react-native-flash-message';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useTheme } from '../../../theme';
import { SegmentPercentage } from '../../Common/FormControls/SegmentPercentage';
import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';
import { useCommonStyle } from '../../Common/Styles';
import { getCurrentDay } from '../../Common/Utils/common';

{/**focust view */ }

export const Detail = ({ route, navigation }) => {
  const text = useText();
  const colors = useTheme();
  const style = useCommonStyle();
  const [datePickerVisible, setDatePickerVisibility] = useState(false);
  const [data, setData] = useState(null as Work);
  useAsyncAction(async () => {
    setData(await workRepository.findOne((w) => w.id == route.params.id));
  }, [route.params, useDectectDataChanged(workRepository)]);

  if (!data) return <View></View>;

  return (
    <View>
      <Text style={[style.center, { marginBottom: 20 }]}>{data.name}</Text>
      <View style={[style.sectionContainer]}>
        <B.Html>{data.description}</B.Html>
      </View>
      {/**segment percentage */}
      <View style={[style.sectionContainer, { paddingRight: 20 }]}>
        <SegmentPercentage
          value={data.did || 0}
          segment={4}
          onChanged={async (val) => {
            await workRepository.update(
              (w) => w.id == data.id,
              (w) => {
                w.did = val;
              },
            );
          }}
        />
      </View>
      {/** action */}
      <View style={[style.sectionContainer, { paddingRight: 20 }]}>
        <B.Button
          containerStyle={{ backgroundColor: colors.primaryContainer }}
          textStyle={{ color: colors.onPrimaryContainer }}
          onPress={async () => {
            await workRepository.update(
              (w) => w.id == data.id,
              (w) => (w.status = 'DONE'),
            );
            navigation.goBack();
            showMessage({
              type: 'success',
              message: text.donesuccess || 'Đã hoàn thành công việc',
            });
          }}
        >
          {text.complete || 'Hoàn thành'}
        </B.Button>
      </View>
      <View style={[style.sectionContainer, { paddingRight: 20 }]}>
        <View style={{ flexDirection: 'row' }}>
          <B.Button
            containerStyle={{ flex: 1, marginRight: 10, backgroundColor: colors.errorContainer }}
            textStyle={{ color: colors.error }}
            onPress={() => {
              Alert.alert(
                text.confirm_deleted || 'Bạn có chắc muốn xóa ?',
                null,
                [
                  {
                    text: text.Ok || 'Ok',
                    onPress: async () => {
                      await workRepository.delete(data);
                      navigation.goBack();
                      showMessage({
                        type: 'warning',
                        message:
                          text.xoathanhcong || 'Xóa công việc thành công',
                      });
                    },
                  },
                ],
              );
            }}
          >
            {text.deleted || 'Xóa'}
          </B.Button>
          <B.Button
            containerStyle={{ flex: 1, marginLeft: 10, backgroundColor: colors.secondaryContainer }}
            textStyle={{ color: colors.onSecondaryContainer }}
            onPress={async () => {
              await workRepository.update(
                (w) => w.id == data.id,
                (w) => {
                  w.startDate = moment(getCurrentDay()).add(1, 'days').toDate();
                },
              );
              navigation.goBack();
              showMessage({
                type: 'success',
                message: text.dadichuyen || 'Đã di chuyển việc qua ngày mai',
              });
            }}
          >
            {text.moveToTomorrow || 'Mai làm'}
          </B.Button>
        </View>
      </View>
      <View style={[style.sectionContainer, { paddingRight: 20 }]}>
        <View>
          <B.Button
            containerStyle={{ backgroundColor: colors.tertiaryContainer }}
            textStyle={{ color: colors.onTertiaryContainer }}
            onPress={() => {
              setDatePickerVisibility(true);
            }}
          >
            {text.scheduler || 'Sắp xếp thời gian'}
          </B.Button>
        </View>
      </View>
      <DateTimePickerModal
        date={moment(data.startDate || new Date).toDate()}
        isVisible={datePickerVisible}
        mode={'datetime'}
        onConfirm={async (d) => {

          await workRepository.update(
            (w) => w.id == data.id,
            (w) => (w.startDate = d),
          );
          setDatePickerVisibility(false);
          //
          showMessage({
            type: 'success',
            message: text.dadichuyen || 'Đã cập nhật công việc',
          });
          navigation.goBack();
        }}
        onCancel={() => {
          setDatePickerVisibility(false);
        }}
      />
    </View>
  );
};
