import { ReactNode } from "react";
import { Text, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";
import { B } from "../../../libs/components";
import { FONTSIZE } from "../../Common";
import { Habit } from "../Entities";
import { useColors } from "../Styles/HomeStyle";
import { useText } from "../Text";

export const ScoreComponent = ({ score = 0, isCompleted = false, habits = [] }: { score: number, isCompleted?: boolean, habits: Array<Habit> }) => {
    const text = useText();
    return (
        <View style={[{ justifyContent: 'center', alignItems: 'center' }]}>
            <CircleSegmentsWithBorders strokeWidth={40} elemCenter={<View style={[{ width: 170, alignItems: 'center' }]}><View><Text style={{ fontSize: 50, fontWeight: 'bold', textAlign: 'center' }} >{score}</Text></View>
                <View>
                    {!isCompleted && (<Text style={{ textAlign: 'center', fontSize: FONTSIZE.SMALL }}>{text.your || 'Your'} <Text style={{ fontWeight: 'bold' }}>{text.daily_habits || 'daily habits'}</Text> {text.are_not_completed || 'are not completed.'}</Text>)}
                    {isCompleted && (<Text style={{ textAlign: 'center', fontSize: FONTSIZE.SMALL }}>{text.your || 'Your'} <Text style={{ fontWeight: 'bold' }}>{text.daily_habits || 'daily habits'}</Text> {text.are || 'are'} <Text style={{ color: 'green' }}>{text.habits_are_completed || 'xong.'}</Text></Text>)}
                </View></View>} gapAngle={12} radius={120} items={habits?.map(h => ({
                    size: h.score || 20,
                    elem: <B.ImageFor
                        name={h.icon || h.name}
                        height={30}
                        width={30}
                        style={[{ backgroundColor: '#fff' }]}
                        textStyle={{
                            color: '#000',
                            lineHeight: 25,
                            textAlign: 'center',
                            fontSize: FONTSIZE.SSSMALL,
                        }}
                    />
                }))} />
        </View>
    );
};

const CircleSegmentsWithBorders = ({
    elemCenter = <View />,
    radius = 100,
    gapAngle = 8,
    items = [],
    strokeWidth = 20
}: { elemCenter: ReactNode | ReactNode[], strokeWidth: number, radius: number, gapAngle: number, items: Array<{ size: number, elem: ReactNode }> }
) => {

    const totalItems = items.length;
    //
    const baseSize = (360 - totalItems * gapAngle * 2.4) / items.map(h => h.size).reduce((sum, current) => sum + current, 0);

    console.log(["BaseSize", baseSize, (360 - totalItems * gapAngle * 2.4), items.map(h => h.size).reduce((sum, current) => sum + current, 0)]);
    // Hàm chuyển đổi từ độ sang radian
    const degreeToRadian = (angle: number) => (angle * Math.PI) / 180;

    // Hàm tạo đường dẫn cho đoạn cung
    const createSegment = (startAngle: number, endAngle: number) => {
        //svg từ 3h
        startAngle = startAngle - 90;
        endAngle = endAngle - 90;
        const startX = radius + radius * Math.cos(degreeToRadian(startAngle));
        const startY = radius + radius * Math.sin(degreeToRadian(startAngle));
        const endX = radius + radius * Math.cos(degreeToRadian(endAngle));
        const endY = radius + radius * Math.sin(degreeToRadian(endAngle));

        return {
            path: `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`,
            startX,
            startY,
            endX,
            endY,
            midAngle: (startAngle + endAngle) / 2, // Tính góc giữa để đặt hình ảnh
        };
    };

    // Tạo các đoạn cung với góc và khoảng cách tùy chỉnh
    const segments = [];
    let currentAngle = 0;
    const habitColors = useColors().habitColors;
    for (let i = 0; i < totalItems; i++) { // Vẽ 6 đoạn cung
        const startAngle = currentAngle;
        const endAngle = currentAngle + items[i].size * baseSize;
        segments.push({ ...createSegment(startAngle, endAngle), color: habitColors[i % habitColors.length], strokeWidth: items[i].size * baseSize });
        currentAngle += items[i].size * baseSize + gapAngle * 2.4; // Thêm khoảng cách giữa các đoạn
    }


    return (
        <Svg height={radius * 2 + strokeWidth * 2} width={radius * 2 + strokeWidth * 2}

        //viewBox={`-${props.strokeWidth / 2} -${props.strokeWidth / 2} ${radius * 2 + props.strokeWidth} ${radius * 2 + props.strokeWidth}`}
        >
            <G translate={[strokeWidth, strokeWidth]}>
                <View style={{ position: 'absolute', top: strokeWidth, left: strokeWidth, height: radius * 2, width: radius * 2, justifyContent: 'center', alignItems: 'center' }}>{elemCenter}</View>
                {segments.map((segment, index) => (
                    <G key={index}>
                        {/* Vẽ đoạn cung */}
                        <Path
                            d={segment.path}
                            stroke={segment.color}
                            strokeWidth={strokeWidth}
                            fill="none"
                        />
                        {/* Vẽ border tại điểm đầu */}
                        <Circle
                            cx={segment.startX}
                            cy={segment.startY}
                            r={strokeWidth / 2} // Bán kính của circle = nửa độ dày
                            fill={segment.color}
                        />
                        {/* Vẽ border tại điểm cuối */}
                        <Circle
                            cx={segment.endX}
                            cy={segment.endY}
                            r={strokeWidth / 2} // Bán kính của circle = nửa độ dày
                            fill={segment.color}
                        />
                        <View style={[{
                            position: 'absolute',
                            top: strokeWidth + -strokeWidth * 0.7 / 2 + radius + radius * Math.sin(degreeToRadian(segment.midAngle)), // Vị trí x của hình ảnh
                            left: strokeWidth + -strokeWidth * 0.7 / 2 + radius + radius * Math.cos(degreeToRadian(segment.midAngle)), // Vị trí y của hình ảnh
                            width: strokeWidth * 0.7, // Chiều rộng của hình ảnh
                            height: strokeWidth * 0.7, // Chiều cao của hình ảnh
                            borderRadius: strokeWidth * 0.7 / 2,
                        }]}
                        >{items[index].elem}</View>
                    </G>
                ))
                }
            </G>
        </Svg >
    );
};

