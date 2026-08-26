import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, View } from "react-native";
import { BICon } from "../../../libs/components";
import { getWeeklyScores } from "../Entities/habitRepository";
interface WeekScore {
    weekStart: Date;
    weekEnd: Date;
    score: number;
    stars: number; // Số lượng ngôi sao (1 - 3)
}

export const WeeklyScoreView = ({ width = 50, onWeekChanged = (start, end) => { } }: { width: number, onWeekChanged: (start: Date, end: Date) => void }) => {
    const flatListRef = useRef<FlatList>(null);
    const [weeklyScores, setWeeklyScores] = useState([] as Array<WeekScore>);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const scrollToCurrentIndex = (index) => {
        if (weeklyScores.length > 0) {
            if (flatListRef.current) {
                flatListRef.current.scrollToIndex({
                    index: index, // Scroll tới tuần hiện tại
                    animated: false,
                });
            }
        }
    };
    // Tải dữ liệu cho trang hiện tại
    const loadData = async () => {

        setLoading(true);
        const newScores = (await getWeeklyScores(page, 3))
            .map(w => ({ ...w, stars: w.score == w.maxScore ? 3 : w.score > 0 ? 2 : 1 })).reverse(); // Mỗi lần tải 5 tuần

        setWeeklyScores([...newScores, ...weeklyScores]);
        setLoading(false);
        scrollToCurrentIndex(newScores.length);
    };

    useEffect(() => {
        loadData();
    }, [page]);


    // Hàm kiểm tra khi cuộn đến đầu danh sách (cuộn hết về bên trái)
    const handleOnScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (event && event.nativeEvent) {
            const { contentOffset } = event.nativeEvent;
            // Kiểm tra nếu đã cuộn đến đầu (contentOffset.x <= 0)
            // Tính toán chỉ số tuần dựa trên vị trí cuộn
            const index = Math.floor(contentOffset.x / width); // Thay 100 bằng chiều rộng thực tế của mục
            if (index >= 0 && index < weeklyScores.length) {
                onWeekChanged(weeklyScores[index].weekStart, weeklyScores[index].weekEnd);
            }



            if (contentOffset.x <= 0 && !loading) {
                // Tăng trang và tải thêm dữ liệu
                setPage(prevPage => prevPage + 1);

            }
        }
    };


    const renderStars = (stars: number) => {
        const starElements = [];
        for (let i = 0; i < 3; i++) {
            starElements.push(
                <BICon
                    key={i}
                    name="star"
                    size={24}
                    color={i < stars ? '#FFD700' : '#C0C0C0'} // Màu vàng cho sao được bật, xám cho sao tắt
                />
            );
        }
        return <View style={styles.starsContainer}>{starElements}</View>;
    };

    // Render từng tuần với điểm số, số sao và ngày bắt đầu/kết thúc
    const renderItem = ({ item }: { item: WeekScore }) => (
        <View style={[styles.weekContainer, { width, padding: 20 }]}>
            <Text style={styles.scoreText}>{item.score}</Text>
            {renderStars(item.stars)}
            <Text style={styles.dateText}>
                {moment(item.weekStart).format('MMM, DD')} - {moment(item.weekEnd).format('MMM, DD')}
            </Text>
        </View>
    );



    const Dots = ({ isLeft = true, isRight = true }: { isLeft: boolean, isRight: boolean }) => {
        return <View style={styles.dotsContainer}>
            <View style={[styles.dot, isLeft && styles.inactiveDot, !isLeft && styles.activeDot]} />
            <View style={[styles.dot, (isLeft && isRight) && styles.activeDot]} />
            <View style={[styles.dot, isRight && styles.inactiveDot, !isRight && styles.activeDot]} />
        </View>;
    };

    React.useEffect(() => {
        //    scrollToCurrentWeek();
    }, [weeklyScores]);

    if (weeklyScores.length == 0) return <View style={{ height: width, width }} />;
    return (
        <View style={[styles.container, { width: width }]}>
            <FlatList
                ref={flatListRef}
                data={weeklyScores}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, index) => index.toString()}
                initialScrollIndex={weeklyScores.length > 0 ? weeklyScores.length - 1 : 0}
                getItemLayout={(data, index) => ({
                    length: width,
                    offset: width * index,
                    index,
                })}
                onScroll={handleOnScroll} // Sử dụng `onScroll` để kiểm tra cuộn
                scrollEventThrottle={200} // Tần số kiểm tra sự kiện cuộn
            />
        </View>
    );

};
// Style cho giao diện
const styles = StyleSheet.create({
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 4,
        flex: 1,
    },
    activeDot: {
        backgroundColor: '#007AFF', // Màu của dot active
    },
    inactiveDot: {
        backgroundColor: '#D3D3D3', // Màu của dot không active
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',

    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    weekContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreText: {
        fontSize: 48, // Font size lớn cho điểm số
        fontWeight: 'bold',
        color: '#1e90ff',
        marginBottom: 10,
    },
    starsContainer: {
        flexDirection: 'row', // Hiển thị 3 ngôi sao theo hàng ngang
        marginBottom: 10,
    },
    dateText: {
        fontSize: 16,
        color: '#666',
    },
});