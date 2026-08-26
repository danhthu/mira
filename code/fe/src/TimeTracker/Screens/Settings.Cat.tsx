import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Col, Grid, Row } from 'react-native-easy-grid';
import { B, BText as Text } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { FONT_SIZE, HEADER_HEIGHT, ICON_TOUCH_WIDTH, TBL_ROW_HEIGHT } from '../../../theme/Constraints';
import { useAsyncAction, useDectectDataChanged, useStateData } from '../../Common/Hooks';
import { useCommonStyle } from '../../Common/Styles';
import { LoadingService } from '../../Common/Utils/Loading';
import { Background } from '../Components/Background';
import { timeCatRepository } from '../Entities/repositories';
import { TimeCat } from '../Entities/TimeCat';
import { useText } from '../Text';


//danh sách cat
//thời gian phân bổ
export const SettingsCat = ({ route, navigation }) => {
  const style = useCommonStyle();
  const onSave = async () => {
    LoadingService.show();
    await Promise.all(dataRef.current.map(async d => timeCatRepository.addOrUpdate(d)));
    LoadingService.hide();
    navigation.goBack();
  };
  const [data, setData, dataRef] = useStateData([]);
  useAsyncAction(async () => {
    setData(await timeCatRepository.list());
  }, [useDectectDataChanged(timeCatRepository)]);
  return <Background style={style.screen}>
    <Header route={route} navigation={navigation} onSave={onSave} />
    <Body route={route} navigation={navigation} setData={setData} data={data} />
  </Background>;
};

const Body = ({ route, navigation, data, setData }) => {
  const text = useText();

  return <Grid style={{ borderTopColor: '#000', borderTopWidth: 1, marginTop: 20 }}>
    <Row style={[{ height: TBL_ROW_HEIGHT }, tblStyle.row]}>
      <Col style={[tblStyle.col, { width: 40, height: TBL_ROW_HEIGHT, justifyContent: 'center', alignItems: 'center' }]}><Text>#</Text></Col>
      <Col style={[tblStyle.col, { height: TBL_ROW_HEIGHT, justifyContent: 'center', paddingLeft: 10 }]}><Text >{text.cat_label || 'Danh mục'}</Text></Col>
      <Col style={[tblStyle.col, { width: 120, height: TBL_ROW_HEIGHT, justifyContent: 'center', alignItems: 'center' }]}><Text>{text.cat_time || 'Thời gian'}</Text></Col>
      <Col style={{ width: 60, height: TBL_ROW_HEIGHT, justifyContent: 'center', alignItems: 'center' }}></Col>
    </Row>
    {data.map((d: TimeCat, i) => <RowData data={d} key={i} />)}
    <EditRow data={new TimeCat} />
  </Grid>;
};
const RowData = (props: { data: TimeCat }) => {
  const [editMode, setEditMode] = useState(false);
  useEffect(() => {
    setEditMode(false);
  }, [props.data]);
  if (!editMode) return <DisplayRow data={props.data} setEditMode={() => setEditMode(true)} />;
  return <EditRow data={props.data} />;
};

const DisplayRow = (props: { data: TimeCat, setEditMode: () => void }) => {
  const d = props.data;
  const text = useText();

  return <Row style={[tblStyle.row, { height: TBL_ROW_HEIGHT }]}>
    <Col style={[tblStyle.col, { width: 40, height: TBL_ROW_HEIGHT, justifyContent: 'center', alignItems: 'center' }]}>
      <View style={{ backgroundColor: d.color || '#000', borderRadius: 3, width: 20, height: 20 }}></View>
    </Col>
    <Col style={[tblStyle.col, { height: TBL_ROW_HEIGHT, justifyContent: 'center', paddingLeft: 10 }]}><Text>{d.name}</Text></Col>
    <Col style={[tblStyle.col, { width: 60, height: TBL_ROW_HEIGHT, justifyContent: 'center', alignItems: 'center' }]}><Text>{d.minPercentage}</Text></Col>
    <Col style={[tblStyle.col, { width: 60, height: TBL_ROW_HEIGHT, justifyContent: 'center', alignItems: 'center' }]}><Text>{d.maxPercentage}</Text></Col>
    <Col style={[{ width: 60, height: TBL_ROW_HEIGHT, justifyContent: 'center', alignItems: 'center' }]}><TouchableOpacity onPress={props.setEditMode}>
      <Text>{text.edit || 'Sửa'}</Text>
    </TouchableOpacity></Col>
  </Row>;
};
const EditRow = (props: { data: TimeCat }) => {
  const text = useText();
  const [data, setData, dataRef] = useStateData({ ...new TimeCat, color: '#000' });
  useEffect(() => {
    setData(props.data);
  }, [props.data]);
  const onSave = async () => {
    const data = dataRef.current;
    LoadingService.show();
    timeCatRepository.addOrUpdate(data);
    await timeCatRepository.save();
    LoadingService.hide();
  };
  return <Row style={[tblStyle.row, { height: TBL_ROW_HEIGHT, }]}>
    <Col style={[tblStyle.col, { width: 40, height: TBL_ROW_HEIGHT, justifyContent: 'center', alignItems: 'center' }]}>
      <View style={{ backgroundColor: data.color || '#000', borderRadius: 3, width: 20, height: 20 }}></View>
    </Col>
    <Col style={[tblStyle.col, { paddingLeft: 10 }]}><B.TextBox value={data.name} label="New Time" onChanged={val => setData({ ...data, name: val })} /></Col>
    <Col style={[tblStyle.col, { width: 60, height: TBL_ROW_HEIGHT, justifyContent: 'center', alignItems: 'center' }]}>
      <B.TextBox
        inputStyle={{ textAlign: 'center' }}
        dataType="number"
        value={data.minPercentage} label="min" onChanged={val => setData({ ...data, minPercentage: val })} /></Col>
    <Col style={[tblStyle.col, { width: 60, height: TBL_ROW_HEIGHT, justifyContent: 'center', alignItems: 'center' }]}>
      <B.TextBox
        inputStyle={{ textAlign: 'center' }}
        dataType="number"
        value={data.maxPercentage} label="max" onChanged={val => setData({ ...data, maxPercentage: val })} /></Col>
    <Col style={[{ width: 60, height: TBL_ROW_HEIGHT, justifyContent: 'center', alignItems: 'center' }]}><TouchableOpacity onPress={onSave}>
      <B.ICon name="save" />
    </TouchableOpacity></Col>
  </Row>;
};

const Header = ({ route, navigation, onSave }) => {
  const text = useText();
  const colors = useTheme();
  return (
    <View>
      <View >
        <Text style={{ lineHeight: HEADER_HEIGHT, textAlign: 'center', fontSize: FONT_SIZE.PageTitle }}>{text.settingsCat_title || 'Thiết lập danh mục thời gian'}</Text>
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
            left: 0
          }
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


const tblStyle = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderColor: '#000',
    borderTopWidth: 0
  },
  col: {
    borderRightWidth: 1,
    borderRightColor: '#000'
  }
});