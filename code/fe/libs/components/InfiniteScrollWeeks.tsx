import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

const InfiniteScrollWeeks = () => {
  const [weeks, setWeeks] = useState([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [itemWidth, setItemWidth] = useState(0); // State để lưu chiều rộng của phần tử

  // Khởi tạo danh sách các tuần
  useEffect(() => {
    const initialWeeks = generateWeeks(-5, 5); // -5 tuần trước đến 5 tuần sau
    setWeeks(initialWeeks);
    setCurrentWeekIndex(5); // Đặt tuần hiện tại làm trung tâm
  }, []);

  // Tạo danh sách các tuần
  const generateWeeks = (startOffset, endOffset) => {
    const weeksArray = [];
    for (let i = startOffset; i <= endOffset; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i * 7);
      weeksArray.push({ id: i, week: getWeekLabel(date) });
    }
    return weeksArray;
  };

  // Format nhãn tuần
  const getWeekLabel = (date) => {
    const startOfWeek = new Date(date);
    const endOfWeek = new Date(date);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
    return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
  };

  // Tải thêm tuần khi cuộn
  const loadMoreWeeks = (direction) => {
    const newWeeks = [...weeks];
    if (direction === 'forward') {
      const lastWeekId = weeks[weeks.length - 1].id;
      newWeeks.push(...generateWeeks(lastWeekId + 1, lastWeekId + 5));
    } else if (direction === 'backward') {
      const firstWeekId = weeks[0].id;
      newWeeks.unshift(...generateWeeks(firstWeekId - 5, firstWeekId - 1));
    }
    setWeeks(newWeeks);
  };

  return (
    <FlatList
      data={weeks}
      renderItem={({ item }) => (
        <View
          style={[styles.weekContainer, { width: itemWidth }]} // Sử dụng chiều rộng đã lấy
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            if (itemWidth !== width) {
              setItemWidth(width); // Cập nhật chiều rộng vào state
            }
          }}
        >
          <Text>{item.week}</Text>
        </View>
      )}
      keyExtractor={(item) => item.id.toString()}
      horizontal
      onEndReached={() => loadMoreWeeks('forward')}
      onEndReachedThreshold={0.5}
      onScrollBeginDrag={() => loadMoreWeeks('backward')}
    />
  );
};

const styles = StyleSheet.create({
  weekContainer: {
    padding: 20,
    margin: 10,
    backgroundColor: '#e0f7fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
});

export default InfiniteScrollWeeks;
