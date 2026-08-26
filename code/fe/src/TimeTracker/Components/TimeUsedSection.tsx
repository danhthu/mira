import { useState } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import PieChart from 'react-native-pie-chart';
import { BText as Text } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { FONTSIZE, TBL_ROW_HEIGHT } from '../../../theme/Constraints';
import { getLogger } from '../../Common';
import { useAsyncAction } from '../../Common/Hooks';
import { dateUtils } from '../../Common/Utils/common';
import { TimeCat } from '../Entities/TimeCat';
import { calc, getCats } from '../Models';
import { useText } from '../Text';

declare type Period = 'w' | 'm' | '3m' | 'y'
const periodArrays = ['w', 'm', '3m', 'y'];
const logger = getLogger('TimeUsedSection');
export const TimeUsedSectionByDate = (props: {
  startDate?: Date
  endDate?: Date
  period?: boolean
  style?: StyleProp<ViewStyle>
}) => {
  const [period, setPeriod] = useState('w' as Period); //w,m,3m,y
  const text = useText();
  const colors = useTheme();
  const [data, setData] = useState(null as Array<TimeCat>);
  useAsyncAction(async () => {
    const startDate = props.period
      ? new Date(2024, 5, 1) //current date
      : props.startDate;
    const endDate = props.period ? dateUtils.getCurrentDay() : props.endDate;
    await calc(startDate, endDate);
    const cats = await getCats(startDate, endDate);
    setData(cats);
  }, [props.startDate, props.endDate, period]);
  if (
    !data ||
    data.map((d) => d.value).reduce((acc, curr) => acc + curr, 0) == 0
  )
    return <View />;
  return (
    <View
      style={[
        {
          backgroundColor: '#fff',
        },
        props.style,
      ]}
    >
      <Text
        style={{
          fontSize: FONTSIZE.HOME_SECTION_TITLE,
          fontWeight: '300',
          lineHeight: TBL_ROW_HEIGHT,
        }}
      >
        {text.tuannaycuaban || 'Thời gian trong tuần'}
      </Text>
      <View style={[{ flexDirection: 'row' }]}>
        <View
          style={[
            {
              justifyContent: 'center',
              flex: 3,
              alignItems: 'center',
              flexDirection: 'column',
            },
          ]}
        >
          <View
            style={{
              justifyContent: 'center',
            }}
          >
            <PieChart
              widthAndHeight={data.length * (TBL_ROW_HEIGHT - 15) - 40}
              series={data.map((d) => d.value)}
              sliceColor={data.map((d) => d.color)}
              coverRadius={0.45}
              coverFill={'#FFF'}
            />
          </View>
        </View>
        <View style={{ flex: 4, paddingRight: 10 }}>
          {data.map((d, i) => {
            const per = Math.round(
              (d.value * 100) /
              data.map((d) => d.value).reduce((acc, curr) => acc + curr, 0),
            );
            return (
              <View key={i} style={[{ flexDirection: 'row' }]}>
                <View
                  style={{
                    height: TBL_ROW_HEIGHT - 35,
                    marginTop: 10,
                    backgroundColor: d.color,
                    borderRadius: 2,
                    width: 5,
                    marginRight: 10,
                  }}
                ></View>
                <Text
                  style={{
                    lineHeight: TBL_ROW_HEIGHT - 15,
                    height: TBL_ROW_HEIGHT - 15,
                    fontSize: 15,
                    flex: 1,
                  }}
                >
                  {d.label}
                </Text>
                <Text
                  style={[
                    {
                      width: 50,
                      lineHeight: TBL_ROW_HEIGHT - 15,
                      height: TBL_ROW_HEIGHT - 15,
                      fontSize: 15,
                      textAlign: 'right',
                    },
                    //!(per > d.minPercentage && per < d.maxPercentage) && { color: colors.warning }
                  ]}
                >
                  {per}%
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};
export const TimeUsedSection = (props: { style?: StyleProp<ViewStyle> }) => {
  return <TimeUsedSectionByDate period {...props} />;
};
