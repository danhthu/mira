import moment from 'moment';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useText } from '../../lang';
import { Router } from '../../libs';
import { B } from '../../libs/components';
import { AddButtonBottom } from '../../libs/components/AddButtonBottom';
import { useTheme } from '../../theme';
import { useDailyTimeLine, useStatistic, useTextDaily } from './Models';
import { useBodyStyles, useCaptionBoxStyle, useCaptionStyle, useScreenStyle } from './Styles';


export const Screen = ({ route, navigation }) => {
  const theme = useTheme();
  const style = useScreenStyle();
  return (
    <View style={style.container}>
      <Caption route={route} navigation={navigation} style={style.caption} />
      <Body route={route} navigation={navigation} viewStyle={style.body} />
      <AddButtonBottom
        onPlusClick={() => Router.Open(navigation, 'TimeScreen_Add')}
      />
    </View>
  );
};

const Caption = (props: { route; navigation; style }) => {
  const totals = useStatistic();
  const text = useText();
  const textDaily = useTextDaily();
  const style = useCaptionStyle();
  return (
    <View style={props.style}>
      <View style={style.header_container}>
        <Text style={style.header_text}>{text.for('Your week')}</Text>
        <TouchableOpacity style={{ paddingTop: 7 }}>
          <Text style={style.header_button_text}>{text.for('View all')}</Text>
        </TouchableOpacity>
      </View>
      <Text style={style.daily_movitation}>
        {textDaily}
      </Text>
      <View style={style.box_group_container}>
        <Box
          type={'working'}
          label={text.for('Working')}
          number={totals.working}
          percentage={(totals.working * 100) / totals.total}
          viewStyle={style.box_container}
        />

        <Box
          type={'personal'}
          label={text.for('Personal')}
          number={totals.personal}
          percentage={(totals.personal * 100) / totals.total}
          viewStyle={style.box_container}
        />

        <Box
          type={'rest'}
          label={text.for('Rest')}
          number={totals.rest}
          percentage={(totals.rest * 100) / totals.total}
          viewStyle={style.box_container}
        />

        <Box
          type={'healthy'}
          label={text.for('Healthy')}
          number={totals.healthy}
          percentage={(totals.healthy * 100) / totals.total}
          viewStyle={style.box_container}
        />
        <Box
          type={'waste'}
          label={text.for('Waste')}
          number={totals.waste}
          percentage={(totals.waste * 100) / totals.total}
          viewStyle={style.box_container}
        />

      </View>

      <View
        style={style.daily_text_container}
      >
        <Text
          style={style.daily_text}
        >
          {text.for('Daily')}
        </Text>
      </View>
    </View>
  );
};


const Box = (props: {
  type
  label
  number
  percentage
  viewStyle: ViewStyle
  iconSide?: 'left' | 'right'
}) => {
  const { type, label, number, viewStyle, iconSide } = props;
  const style = useCaptionBoxStyle();
  const colorTypeMap = {
    working: 'orange',
    healthy: '#fb87ab',
    personal: '#2bb3ee',
    waste: '#0d0c22',
    rest: '#06ad2a',
  };
  const iconNameMap = {
    working: 'work',
    healthy: 'hearto',
    personal: 'person',
    waste: 'trash',
    rest: 'leaf',
  };
  return (
    <View style={viewStyle}>
      <View style={style.box_container}>
        <View style={[style.box_icon_container]}> <B.ICon name={iconNameMap[type]} style={[style.box_icon, { color: colorTypeMap[type] }]} /></View>
        <View style={style.box_divider}></View>
        <Text style={style.box_number}>
          {number}
        </Text>
        <Text style={style.box_label}>
          {label}
        </Text>
      </View>
    </View>
  );
};



const Body = (props: { route; navigation; viewStyle }) => {
  const text = useText();
  const data = useDailyTimeLine();
  const bodyItemStyle = useBodyStyles();
  const itemPress = (item) => { };
  if (data == null) return <View></View>;
  return (
    <View style={props.viewStyle}>
      <FlatList
        style={{ padding: 30, borderRadius: 5 }}
        data={data}
        renderItem={({ item }) => {
          const style = bodyItemStyle(item.status);
          return (
            <View style={style.container}>
              <TouchableOpacity
                onPress={() => itemPress(item)}
                style={
                  item.status == 'DONE'
                    ? style.left_container_done
                    : item.status == 'PLAN'
                      ? style.left_container_plan
                      : style.left_container
                }
              >
                <B.ICon
                  style={[style.left_icon]}
                  name={
                    item.status == 'DOING'
                      ? 'pause'
                      : item.status == 'PLAN'
                        ? 'play'
                        : 'check'
                  }
                />
              </TouchableOpacity>
              <View style={style.body_container}>
                <Text style={style.body_title}>{item.title}</Text>
                <Text style={style.body_description}>{item.description}</Text>
                <Text style={style.body_time}>
                  {moment(new Date(item.time)).format('HH:mm')}
                </Text>
              </View>
              <View style={style.right_container}>
                <Text style={[style.right_time]}>
                  {moment(new Date(item.time)).format('HH:mm')}
                </Text>
                <Text style={style.right_status}>
                  {item.status == 'DOING'
                    ? text.for('ongoing')
                    : item.status == 'PLAN'
                      ? text.for('on hold')
                      : text.for('completed')}
                </Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};
