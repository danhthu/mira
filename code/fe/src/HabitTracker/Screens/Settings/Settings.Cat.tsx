import { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Col, Grid, Row } from 'react-native-easy-grid';
import { B, BText as Text } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { FONT_SIZE, FONT_WEIGHT, HEADER_HEIGHT, ICON_TOUCH_WIDTH, TBL_ROW_HEIGHT } from '../../../theme/Constraints';
import { useAsyncAction, useDectectDataChanged, useStateData } from '../../Common/Hooks';
import { LoadingService } from '../../Common/Utils/Loading';
import { Background } from '../Components/Background';
import { timeCatRepository } from '../Entities/repositories';
import { TimeCat } from '../Entities/TimeCat';
import { useText } from '../Text';


//danh sách cat
//thời gian phân bổ
export const SettingsCat = ({ route, navigation }) => {
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
  return <Background>
    <Header route={route} navigation={navigation} onSave={onSave} />
    <Body route={route} navigation={navigation} setData={setData} data={data} />
  </Background>;
};

const Body = ({ route, navigation, data, setData }) => {
  const text = useText();

  return <Grid>
    <Row>
      <Col style={{ width: 40, height: TBL_ROW_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>#</Col>
      <Col >{text.cat_label || 'Danh mục'}</Col>
      <Col style={{ width: 60, height: TBL_ROW_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>{text.cat_min || 'Tối thiểu'}</Col>
      <Col style={{ width: 60, height: TBL_ROW_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>{text.cat_max || 'Tối đa'}</Col>
      <Col style={{ width: 40, height: TBL_ROW_HEIGHT, justifyContent: 'center', alignItems: 'center' }}></Col>
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
  if (editMode) return <DisplayRow data={props.data} setEditMode={() => setEditMode(true)} />;
  return <EditRow data={props.data} />;
};

const DisplayRow = (props: { data: TimeCat, setEditMode: () => void }) => {
  const d = props.data;
  const text = useText();

  return <Row>
    <Col style={{ width: 40, height: TBL_ROW_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ backgroundColor: d.color, borderRadius: 3, width: 20, height: 20 }}></View>
    </Col>
    <Col>{d.name}</Col>
    <Col style={{ width: 40, height: TBL_ROW_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>{d.minPercentage}</Col>
    <Col style={{ width: 40, height: TBL_ROW_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>{d.maxPercentage}</Col>
    <Col style={{ width: 40, height: TBL_ROW_HEIGHT, justifyContent: 'center', alignItems: 'center' }}><TouchableOpacity onPress={props.setEditMode}>
      <Text>{text.edit || 'Sửa'}</Text>
    </TouchableOpacity></Col>
  </Row>;
};
const EditRow = (props: { data: TimeCat }) => {
  const text = useText();
  const [data, setData, dataRef] = useStateData(new TimeCat);
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
  return <Row>
    <Col style={{ width: 40, height: TBL_ROW_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ backgroundColor: data.color, borderRadius: 3, width: 20, height: 20 }}></View>
    </Col>
    <Col>{data.name}</Col>
    <Col style={{ width: 40, height: TBL_ROW_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>{data.minPercentage}</Col>
    <Col style={{ width: 40, height: TBL_ROW_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>{data.maxPercentage}</Col>
    <Col style={{ width: 40, height: TBL_ROW_HEIGHT, justifyContent: 'center', alignItems: 'center' }}><TouchableOpacity onPress={onSave}>
      <Text>{text.save || 'Lưu'}</Text>
    </TouchableOpacity></Col>
  </Row>;
};

const Header = ({ route, navigation, onSave }) => {
  const text = useText();
  const colors = useTheme();
  return (
    <View>
      <View >
        <Text style={{ lineHeight: HEADER_HEIGHT, textAlign: 'center', fontSize: FONT_SIZE.PageTitle }}>{text.add_title || 'Add Time Usage'}</Text>
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
        onPress={onSave}
      >
        <Text style={{ fontSize: FONT_SIZE.Text, color: colors.onSecondary, fontWeight: FONT_WEIGHT.SEMIBOLD }}>{text.save || 'Lưu'}</Text>
      </TouchableOpacity>
    </View>
  );
};

