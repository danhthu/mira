import moment from 'moment';
import { Dispatch, MutableRefObject, SetStateAction, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { B, BButton, BICon, BText as Text } from '../../../libs/components';
import { Cel, Row } from '../../../libs/components/Row';
import { useTheme } from '../../../theme';
import { FONTSIZE, FONT_SIZE, PADDING, TBL_ROW_HEIGHT } from '../../../theme/Constraints';
import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';
import { useCommonStyle } from '../../Common/Styles';
import { dateGreater, dateLesser, getNextWeekend, getStartOfWeek } from '../../Common/Utils/common';
import { Background } from '../Components/Background';
import { workRepository } from '../Entities';
import { useText } from '../Text';
type FILTER = 'a' | 'w' | 'm' | 'y' | { from: Date, to: Date }
function convertFilterToDate(filter: FILTER): { from: Date, to: Date } {
  return {
    from: filter == 'w' ? getStartOfWeek(new Date)
      : filter == 'm' ? new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        : filter == 'y' ? new Date(new Date().getFullYear(), 0, 1)
          : filter == 'a' ? new Date(new Date().getFullYear() - 20, 0, 1)
            : filter.from,
    to: filter == 'w' ? getNextWeekend(new Date)
      : filter == 'm' ? moment(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)).add(-1, 'days').toDate()
        : filter == 'y' ? new Date(new Date().getFullYear(), 11, 31)
          : filter == 'a' ? new Date(new Date().getFullYear(), 11, 31)
            : filter.to,
  };
}

export const Statistic = () => {
  const [filter, setFilter] = useState('w' as FILTER);
  return <Background>
    <Caption filter={filter} setFilter={setFilter} />
    <RptBody filter={filter} />
  </Background>;
};


const RptBody = (props: { filter: FILTER }) => {
  const filter = convertFilterToDate(props.filter || 'w');
  const colors = useTheme();
  const text = useText();
  const style = useSummaryStyle();
  const commonStyle = useCommonStyle();
  const [dataTotal, setDataTotal] = useState({
    total: 100,
    completed: 10, //madatory
    mandatory: 50, //
    totalCompleted: 50,
    completeBeforeEndTime: 10, //dung
    completeAfterEndTime: 10, //muộn
  });
  useAsyncAction(async () => {
    const tmp = await workRepository.filter(w => dateGreater(w.startDate, filter.from) && dateLesser(w.startDate, filter.to));
    //batch
    //setData(prev => tmp)
    setDataTotal(({
      total: tmp.length,
      completed: tmp.filter(t => t.mandatory && t.status == 'DONE').length, //madatory
      mandatory: tmp.filter(t => t.mandatory).length, //
      totalCompleted: tmp.filter(t => t.status == 'DONE').length,
      completeBeforeEndTime: tmp.filter(t => t.status == 'DONE' && (!t.endDate || dateGreater(t.finishDate, t.endDate, 1))).length, //dung
      completeAfterEndTime: tmp.filter(t => t.status == 'DONE' && (t.endDate && dateLesser(t.finishDate, t.endDate))).length, //muộn
    }));
  }, [props.filter]);
  // Ràng buộc #3: không điểm thành tích/badge, không màu đỏ báo "chưa đủ" — chỉ hiển thị số liệu trung tính.
  return (<View style={{ borderWidth: 1, borderColor: colors.outlineVariant, margin: PADDING.SCREEN, padding: 8, backgroundColor: colors.grayColor, borderRadius: 16 }}>
    <Row>
      <Cel style={[{ marginTop: 10 }, commonStyle.full]}>
        <Text size="small" style={{ textAlign: 'center', marginTop: 8, marginBottom: 8 }}>{
          props.filter == 'w' ? '' + moment(filter.from).format('DD MMM') + ' - ' + moment(filter.to).format('DD MMM') + '' :
            props.filter == 'm' ? moment(filter.from).format('MMM, YYYY')
              : props.filter == 'y' ? moment(filter.from).format('YYYY')
                : moment(filter.from).format('DD MMM YYYY') + ' - ' + moment(filter.to).format('DD MMM YYYY')
        }</Text>
      </Cel>
    </Row>
    <Row>
      <Cel style={commonStyle.full}>
        <Text >{text.total || 'Total'}</Text>
      </Cel>
      <Cel style={commonStyle.right}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={[style.textNeutral]}>{dataTotal.totalCompleted}/</Text>
          <Text>{dataTotal.total} </Text>
          <Text style={[style.textNeutral]}>({Math.round(dataTotal.totalCompleted * 100 / dataTotal.total)}%)</Text>
        </View>
      </Cel>
    </Row>
    <Row>
      <Cel style={commonStyle.full}>
        <Text >{text.mandatory || 'Mandatory'}</Text>
      </Cel>
      <Cel style={commonStyle.right}>
        <View style={{ flexDirection: 'row', }}>
          <Text style={[style.textNeutral]}>{dataTotal.completed}/</Text>
          <Text>{dataTotal.mandatory} </Text>
          <Text style={[style.textNeutral]}>({Math.round(dataTotal.completed * 100 / dataTotal.mandatory)}%)</Text>
        </View>
      </Cel>
    </Row>

    <Row>
      <Cel style={commonStyle.full}>
        <Text>{text.dunghan || 'Đúng hạn'}</Text>
      </Cel>
      <Cel style={commonStyle.right}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={[style.textNeutral]}>{dataTotal.completeBeforeEndTime}/{dataTotal.totalCompleted} </Text>
          <Text style={[style.textNeutral]}>({Math.round(dataTotal.completeBeforeEndTime * 100 / dataTotal.totalCompleted)}%)</Text>
        </View>
      </Cel>
    </Row>

    <Row style={{ borderBottomWidth: 0 }}>
      <Cel style={commonStyle.full}>
        <Text>{text.quahan || 'Quá  hạn'}</Text>
      </Cel>
      <Cel style={commonStyle.right}>
        <View style={[{ flexDirection: 'row' }]}>
          <Text style={[style.textNeutral]}>{dataTotal.completeAfterEndTime || '--'}/</Text>
          <Text >{dataTotal.total} </Text>
          <Text style={[style.textNeutral]}>{dataTotal.completeAfterEndTime == 0 ? '--' : '(' + Math.round(dataTotal.completeAfterEndTime * 100 / dataTotal.totalCompleted) + '%)'}</Text>
        </View>
      </Cel>
    </Row>
  </View>
  );
};

interface CustomFilterAction {
  show: () => void
}
const CustomFilter = forwardRef((props: { filter: FILTER, setFilter: Dispatch<SetStateAction<FILTER>> }, ref: MutableRefObject<CustomFilterAction>) => {
  const av = new Animated.Value(0);
  av.addListener(() => { return; });
  const style = useCommonStyle();
  const [visible, setVisible] = useState(false);
  const [from_date, setFromDate] = useState(moment(new Date()).add(-20, 'years').toDate());
  const [to_date, setToDate] = useState(new Date());
  const colors = useTheme();
  useImperativeHandle(ref, () => {
    return {
      show: () => {
        setVisible(true);
      }
    };
  }, []);
  useEffect(() => {
    const filter = convertFilterToDate(props.filter || 'w');
    setFromDate(v => filter.from);
    setToDate(v => filter.to);
  }, [props.filter]);
  const text = useText();
  return <Modal
    animationType='none'
    transparent
    visible={visible}
  >
    <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'column' },]}>
      <TouchableWithoutFeedback onPress={() => setVisible(false)} >
        <View style={style.modal.modalOverlay} />
      </TouchableWithoutFeedback>
      <View style={[{ width: '90%', backgroundColor: colors.background, padding: 20, borderRadius: 10 },]}>
        <View style={{ borderBottomColor: colors.outlineVariant, borderBottomWidth: 1, marginBottom: 20 }}>
          <Text style={{ fontSize: FONT_SIZE.PageTitle, textAlign: 'center', marginBottom: 10 }}>{text.filter || 'Tùy chỉnh thống kê'}</Text>
        </View>
        <Row >
          <View style={[style.full]}>
            <Text style={{ lineHeight: TBL_ROW_HEIGHT }}>{text.chongaybatdau || 'Ngày bắt đầu'}</Text>
          </View>
          <View style={[style.right, { width: 110 }]}>
            <B.TextBox hideClose={true} dataType="date" value={from_date} label="Chọn" onChanged={setFromDate} />
          </View>
        </Row>
        <Row >
          <View style={[style.full]}>
            <Text style={{ lineHeight: TBL_ROW_HEIGHT }}>{text.ngayketthuc || 'Ngày kết thúc'}</Text>
          </View>
          <View style={[style.right, { width: 110 }]}>
            <B.TextBox hideClose={true} dataType="date" value={to_date} label="Chọn" onChanged={setToDate} />
          </View>
        </Row>

        <View style={{ marginTop: 15, paddingRight: 20 }}>
          <BButton style={{ width: '50%', alignSelf: 'center' }} onPress={() => {
            setVisible(v => false);
            props.setFilter({ from: from_date, to: to_date });
          }} text={text.ok || 'Ok'} />
        </View>
      </View>
    </View>
  </Modal>;
});

const useSummaryStyle = () => {
  const colors = useTheme();
  return StyleSheet.create({
    textNeutral: { color: colors.onSurface, },
  });
};

const StatusWidget2 = (props: {
  type: 'mandatory' | 'today' | 'pending'
  day?: Date
  onPress?: () => void
}) => {
  const style = useStyle().component;
  const text = useText();
  const colors = useTheme();
  const data = useAsyncAction(async () => {
    if (props.type == 'pending') {
      return {
        done: 0,
        total: (await workRepository.getUnPlanned(props.day)).length,
      };
    }
    const data = (await workRepository.getListByDate(props.day)).filter(
      (w) =>
        (props.type == 'mandatory' && w.mandatory) ||
        (props.type == 'today' && !w.mandatory),
    );
    return {
      done: data.filter((w) => w.status == 'DONE').length,
      total: data.length,
    };
  }, [useDectectDataChanged(workRepository), props.day]);
  if (data == null) return <View></View>;
  const { done, total } = data;
  const icon_name =
    props.type == 'mandatory'
      ? 'work'
      : props.type == 'today'
        ? 'today-outline'
        : 'clockcircleo';
  const title =
    props.type == 'mandatory'
      ? text.batbuoc || 'Bắt buộc'
      : props.type == 'today'
        ? text.homnay || 'Hôm nay'
        : text.chuasapxep || 'No Plan';
  const color =
    props.type == 'mandatory'
      ? colors.secondary
      : props.type == 'today'
        ? colors.tertiary
        : 'gray';
  const bg =
    props.type == 'mandatory'
      ? colors.secondary
      : props.type == 'today'
        ? colors.tertiary
        : '#dddddd';
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={[
        style.container,
        {
          backgroundColor: colors.hexToRGB(bg, 0.3),
          borderColor: bg,
          borderWidth: 1,
        },
      ]}
    >
      <View
        style={{ marginTop: 10, alignItems: 'flex-end', flexDirection: 'row' }}
      >
        <B.Text
          style={{ fontSize: 30, fontWeight: '600', color: colors.success }}
        >
          {done || '--'}
        </B.Text>
        <B.Text
          style={[
            {
              fontSize: 30,
              marginBottom: 0,
              paddingLeft: 5,
              paddingRight: 5,
              fontWeight: '600',
            },
          ]}
        >
          /
        </B.Text>
        <B.Text style={{ fontSize: 30, fontWeight: '600' }}>
          {total || '--'}
        </B.Text>
      </View>
      <View>
        <B.Text style={{ fontSize: FONT_SIZE.Text + 3, fontWeight: '400' }}>
          {title}
        </B.Text>
        {props.type != 'pending' && (
          <B.Text style={{ fontWeight: '300' }}>
            {text.hoanthanh || 'Completed'}
          </B.Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const Caption = (props = { filter: 'w' } as { filter?: FILTER, setFilter: Dispatch<SetStateAction<FILTER>> }) => {
  const { filter, setFilter } = props;
  const buttonGroupStyle = useButtonGroup();
  const text = useText();
  const colors = useTheme();
  const customFilterDialogRef = useRef<CustomFilterAction>();
  return <View style={{ flexDirection: 'row', marginTop: 20 }}>
    {/** header */}
    <View style={{ width: 60 }}></View>
    <View style={buttonGroupStyle.container}>
      <CaptionButtonInGroup text={text.week || 'Tuần'} actived={filter == 'w'} onPress={() => setFilter('w')} />
      <CaptionButtonInGroup text={text.month || 'Tháng'} actived={filter == 'm'} onPress={() => setFilter('m')} />
      <CaptionButtonInGroup text={text.week || 'Năm'} actived={filter == 'y'} onPress={() => setFilter('y')} />
    </View>
    {/** filter by date*/}
    {/**lich chon */}
    <TouchableOpacity
      style={[
        {
          alignSelf: 'flex-end',
          width: 35,
          height: 35,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 15,
          backgroundColor: colors.primary,
          borderRadius: 17,
          marginLeft: 20
        },
      ]}
      onPress={() => { customFilterDialogRef.current?.show(); }}
    >
      <BICon name="calendar-start" style={{ fontSize: 14, color: colors.onPrimary }}></BICon>
    </TouchableOpacity>
    <CustomFilter ref={customFilterDialogRef} filter={filter} setFilter={setFilter} />
  </View>;
};

const CaptionButtonInGroup = ({ actived = false, onPress = () => { }, text = 'unknown' }) => {
  const buttonGroupStyle = useButtonGroup();
  const colors = useTheme();
  return <TouchableOpacity
    style={[
      buttonGroupStyle.default,
      actived &&
      buttonGroupStyle.selected,
    ]}
    onPress={onPress}
  >
    <Text
      style={[
        { fontSize: 14 },
        actived && {
          color: colors.onPrimary,
        },
      ]}
    >
      {text}
    </Text>
  </TouchableOpacity>;
};

const useButtonGroup = () => {
  const colors = useTheme();
  return StyleSheet.create({
    default: {
      flex: 1,
      height: 35,
      justifyContent: 'center',
      alignItems: 'center',
    },
    selected: {
      borderColor: colors.outlineVariant,
      borderRadius: 20,
      borderWidth: 1,
      backgroundColor: colors.primary,
    },
    container: {
      flexDirection: 'row',
      flex: 1,
      borderColor: colors.outlineVariant,
      borderWidth: 1,
      borderRadius: 20,
      backgroundColor: colors.surfaceContainer,
    },
  });
};

export const useStyle = () => {
  const colors = useTheme();
  return {
    workItem: StyleSheet.create({
      container: {},
      left_container: {},
      left_icon: {},
      body_container: {},
      body_title: {},
      body_subTitle: {},
    }),
    screen: StyleSheet.create({
      groupLabel: {
        //color: colors.onBackground,
        color: colors.getColor(colors.onBackground, 600),
        fontSize: FONTSIZE.NORMAL,
        lineHeight: 40,
        height: 40,
      },
      container: {
        padding: 20,
        paddingTop: 40,
        flexDirection: 'column',
        flex: 1,
      },
    }),
    component: StyleSheet.create({
      container: {
        height: 110,
        width: 150,
        //backgroundColor: colors.surface,
        borderRadius: 15,
        padding: 20,
        paddingTop: 0,
        marginRight: 20,
      },
      caption_container: {
        flexDirection: 'row',
        marginLeft: -20,
      },
      caption_icon: {
        color: colors.surface,
        fontSize: 20,
      },
      caption_iconContainer: {
        borderTopLeftRadius: 20,
        borderBottomRightRadius: 20,
        backgroundColor: colors.primary,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
      },
      caption_title: {
        color: colors.onSurface,
        textAlign: 'center',
        lineHeight: 40,
        height: 40,

        fontSize: FONTSIZE.NORMAL,
        flex: 1,
      },
      body_container: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
      },
      arrowup: {
        color: colors.success,
        fontWeight: 'bold',
      },
      arrowdown: {
        color: colors.error,
        fontWeight: 'bold',
      },

      normal: {
        color: colors.onBackground,
        fontSize: FONTSIZE.NORMAL,
      },

      label: {
        color: colors.getColor(colors.onSurface, 500),
        textAlign: 'center',
        flex: 1,
      },

      textDone: {
        color: colors.onSurface,
        fontSize: FONTSIZE.LARGE,
        fontWeight: 'bold',
        paddingRight: 5,
        marginBottom: -5,
      },
      timeDone: {
        color: colors.success,
      },
      textTotal: {
        color: colors.onSurface,
        fontSize: FONTSIZE.BIG,
        fontWeight: 'bold',
      },

      footer_container: {
        flexDirection: 'column',
      },
      footer_text: {},
      progress_container: {
        flexDirection: 'row',
        backgroundColor: colors.background,
      },
      progress: {
        flex: 1,
        borderWidth: 3,
        borderRadius: 3,
        borderColor: colors.success,
      },
    }),
    body: {
      timeLine: StyleSheet.create({
        title: {
          color: colors.onBackground,
          fontSize: FONTSIZE.NORMAL,
          fontWeight: 'bold',
        },
        description: {
          color: colors.getColor(colors.onBackground, 500),
          fontSize: FONTSIZE.NORMAL,
        },
      }),
    },
  };
};
