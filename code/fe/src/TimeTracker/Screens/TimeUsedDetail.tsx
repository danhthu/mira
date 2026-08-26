import { useActionSheet } from '@expo/react-native-action-sheet';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { sortBy } from 'sort-by-typescript';
import { B, BText, BText as Text } from '../../../libs/components';
import { useTheme } from '../../../theme';
import {
  FONT_SIZE,
  FONT_WEIGHT,
  FONTSIZE,
  HEADER_HEIGHT,
  ICON_TOUCH_WIDTH,
  TBL_ROW_HEIGHT,
} from '../../../theme/Constraints';
import { useAsyncAction, useSettings, useStateData } from '../../Common/Hooks';
import { useCommonStyle } from '../../Common/Styles';
import { dateUtils } from '../../Common/Utils/common';
import { ActivityDetailCom } from '../Components/ActivityDetailCom';
import { Background } from '../Components/Background';
import { TimeData } from '../Entities/TimeData';
import { timeCatRepository, timeDataRepository } from '../Entities/repositories';
import { useText } from '../Text';

declare type Filter = {
  day?: number
  catId?: string
}

export const TimeUsedDetail = ({ route, navigation }) => {
  const [data, setData,] = useStateData([] as Array<TimeData>);

  const style = useCommonStyle();
  const [filter, setFilter] = useState({} as Filter);
  useEffect(() => {
    setFilter(route.params as Filter);
  }, [route.params]);
  useAsyncAction(async () => {
    const data = await timeDataRepository.filter(
      (td) => (
        (!filter.catId || td.catId == filter.catId) &&
        (!filter.day || dateUtils.dateEqual(td.day || new Date, new Date(filter.day)))
      )
    );
    data.sort(sortBy('day'));
    setData(data);
  }, [filter]);
  if (!data) return <View />;
  return (
    <Background style={style.modalPadding}>
      <Header navigation={navigation} />
      <FilterSection filter={filter} onChanged={(val) => setFilter(val)} />
      <View style={[{ flex: 1, marginBottom: 100 }]}>
        <DataSection data={data} />
      </View>
    </Background>
  );
};

const FilterSection = (props: {
  filter: Filter
  onChanged: (val: Filter) => void
}) => {
  const text = useText();
  const [settings] = useSettings();
  const colors = useTheme();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    props.onChanged({ ...props.filter, day: date.getTime() });
    hideDatePicker();
  };
  const { showActionSheetWithOptions } = useActionSheet();

  const listCats = useAsyncAction(
    async () => {
      return await timeCatRepository.list();
    },
    [],
    [],
  );
  return (
    <View style={{
      marginBottom: 30, borderBottomColor: colors.outline,
      borderBottomWidth: 1, marginLeft: 20, marginRight: 20
    }}>
      <View
        style={{

          flexDirection: 'row',
        }}
      >
        <Text style={{ flex: 1, lineHeight: TBL_ROW_HEIGHT }}>
          {text.chonngay || 'Chọn ngày'}
        </Text>
        <TouchableOpacity
          onPress={() => setDatePickerVisibility(true)}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignSelf: 'flex-end',
            alignItems: 'flex-end',
          }}
        >
          <Text
            style={{
              color: colors.primary,
              flex: 1,
              textAlign: 'right',
              marginRight: 5,
              lineHeight: TBL_ROW_HEIGHT,
            }}
          >
            {moment(
              new Date(props.filter ? props.filter.day : new Date()),
            ).format(settings.dateFormat)}
          </Text>
          <B.ICon
            style={{
              color: colors.primary,
              fontSize: FONTSIZE.NORMAL,
              alignSelf: 'flex-end',
              lineHeight: TBL_ROW_HEIGHT,
            }}
            name="calendar"
          />
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: 'row',
        }}
      >
        <Text style={{ flex: 1, lineHeight: TBL_ROW_HEIGHT }}>
          {text.chondanhmuc || 'Danh mục'}
        </Text>
        <TouchableOpacity
          onPress={() =>
            showActionSheetWithOptions(
              {
                options: [text.tatca || 'Tất cả', ...listCats.map(c => c.label)],
                message: text.chondanhmuc || 'Chọn danh mục',
                //cancelButtonIndex: 0,
                messageTextStyle: {
                  textAlign: 'center',
                  fontSize: FONTSIZE.NORMAL,
                  alignSelf: 'center',
                },
              },
              async (selectedIndex: number) => {
                props.onChanged({ ...props.filter, catId: selectedIndex == 0 ? null : listCats[selectedIndex - 1].id });
              },
            )
          }
          style={{
            flex: 1,
            flexDirection: 'row',
            alignSelf: 'flex-end',
            alignItems: 'flex-end',
          }}
        >
          <Text
            style={{
              color: colors.primary,
              flex: 1,
              textAlign: 'right',
              marginRight: 5,
              lineHeight: TBL_ROW_HEIGHT,
            }}
          >
            {props.filter ? props.filter.catId == null ? text.tatca || 'Tất cả' : listCats.filter(c => c.id == props.filter.catId)[0]?.label : text.danhmuc || 'Tất cả'}
          </Text>
          <View style={{ backgroundColor: colors.primary }}></View>
        </TouchableOpacity>
      </View>
      <DateTimePickerModal
        date={props.filter ? new Date(props.filter.day) : new Date()}
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  );
};

const DataSection = (props: { data: Array<TimeData> }) => {
  const text = useText();
  const colors = useTheme();
  const [id, setId] = useState(null);
  const cats = useAsyncAction(async () => await timeCatRepository.list(), [], []);
  if (!props.data || props.data.length == 0) {
    return (
      <View>
        <BText>Chưa có data</BText>
      </View>
    );
  }

  return (
    <View>
      <View style={{ flexDirection: 'row' }}>
        <Text
          style={{
            lineHeight: TBL_ROW_HEIGHT,
            width: 50,
            fontWeight: FONT_WEIGHT.SEMIBOLD,
            textAlign: 'center',
          }}
        >
          #
        </Text>
        <Text
          style={{
            lineHeight: TBL_ROW_HEIGHT,
            flex: 1,
            fontWeight: FONT_WEIGHT.SEMIBOLD,
          }}
        >
          {text.name || 'Hoạt động'}
        </Text>
        <Text
          style={{
            lineHeight: TBL_ROW_HEIGHT,
            width: 50,
            fontWeight: FONT_WEIGHT.SEMIBOLD,
            textAlign: 'center',
          }}
        >
          {text.time || 'Phút'}
        </Text>
      </View>
      <FlatList
        automaticallyAdjustKeyboardInsets
        data={props.data}
        renderItem={({ item, index }) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              borderBottomColor: colors.outline,
              borderBottomWidth: 1,
            }}
          >
            <Text
              style={{
                lineHeight: TBL_ROW_HEIGHT,
                width: 50,
                textAlign: 'center',
              }}
            >
              {index + 1}
            </Text>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => setId(item.id)}
            >
              <View style={{
                height: TBL_ROW_HEIGHT - 26,
                marginTop: 13,
                backgroundColor: cats.filter(c => c.id == item.catId).length > 0 ? cats.filter(c => c.id == item.catId)[0].color : '#fff', borderRadius: 2,
                width: 5, marginRight: 10
              }}></View>
              <Text
                style={{ lineHeight: TBL_ROW_HEIGHT, color: colors.primary }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
            <View>
              <B.TextBox
                viewStyle={{ width: 50, borderBottomColor: colors.primary }}
                inputStyle={{ textAlign: 'center', color: colors.primary }}

                label={text.minut || 'Phút'} value={item.minut || 5} dataType="number" onChanged={async val => {
                  await timeDataRepository.addOrUpdate({ ...item, minut: parseFloat('' + val) });
                }} />
            </View>
            {/**
            <Text
              style={[
                {
                  lineHeight: TBL_ROW_HEIGHT,
                  width: 50,
                  alignSelf: 'flex-end',
                  textAlign: 'center',
                },
              ]}
            >
              {item.minut || 5}
            </Text> */}
          </View>
        )}
      />
      {id && <ActivityDetailCom id={id} onHide={() => setId(null)} />}
    </View>
  );
};

const Header = ({ navigation }) => {
  const text = useText();
  return (
    <View>
      <View>
        <Text
          style={{
            lineHeight: HEADER_HEIGHT,
            textAlign: 'center',
            fontSize: FONT_SIZE.PageTitle,
          }}
        >
          {text.detail_title || 'Thời gian sử dụng'}
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
    </View>
  );
};
