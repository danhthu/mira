import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Button, SafeAreaView, StyleSheet, Text, TextInput } from 'react-native';

export const TradingScreen = () => {
    const [viewTimes, setViewTimes] = useState([]); // Lưu thời gian xem giá dưới dạng Date
    const [goalTimeLimit, setGoalTimeLimit] = useState(30 * 60); // Thời gian mục tiêu (giây)
    const [inputGoal, setInputGoal] = useState('');
    const [goalAchievedDays, setGoalAchievedDays] = useState([]);
    const [nonGoalDays, setNonGoalDays] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const storedData = await AsyncStorage.getItem('tradingData');
                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    setGoalAchievedDays(parsedData.goalAchievedDays || []);
                    setNonGoalDays(parsedData.nonGoalDays || []);
                    setViewTimes(parsedData.viewTimes || []);
                }
            } catch (error) {
                console.log('Error loading data', error);
            }
        };
        loadData();
    }, []);

    const saveData = async () => {
        try {
            const dataToSave = {
                viewTimes,
                goalAchievedDays,
                nonGoalDays,
            };
            await AsyncStorage.setItem('tradingData', JSON.stringify(dataToSave));
        } catch (error) {
            console.log('Error saving data', error);
        }
    };

    const handleViewPrice = () => {
        const currentTime = new Date();
        setViewTimes([...viewTimes, currentTime]);
    };

    const checkGoalAchieved = async () => {
        const currentDate = moment().format('YYYY-MM-DD');
        const todayViews = viewTimes.filter(viewTime =>
            moment(viewTime).isSame(currentDate, 'day')
        );

        // Tính khoảng cách giữa các lần xem giá
        const waitTimes = todayViews.map((time, index) => {
            if (index === 0) return null;
            return moment(time).diff(moment(todayViews[index - 1]), 'seconds');
        }).filter(time => time !== null);

        const allTimesBelowGoal = waitTimes.every(time => time >= goalTimeLimit);

        if (allTimesBelowGoal) {
            if (!goalAchievedDays.includes(currentDate)) {
                const updatedGoalAchievedDays = [...goalAchievedDays, currentDate];
                setGoalAchievedDays(updatedGoalAchievedDays);
                await saveData();
            }
        } else {
            if (!nonGoalDays.includes(currentDate)) {
                const updatedNonGoalDays = [...nonGoalDays, currentDate];
                setNonGoalDays(updatedNonGoalDays);
                await saveData();
            }
        }
    };

    useEffect(() => {
        checkGoalAchieved();
        saveData();
    }, [viewTimes]);

    const handleSetGoalTime = () => {
        const goalInSeconds = parseInt(inputGoal) * 60;
        if (!isNaN(goalInSeconds) && goalInSeconds > 0) {
            setGoalTimeLimit(goalInSeconds);
            setInputGoal('');
            saveData();
        } else {
            alert('Vui lòng nhập thời gian mục tiêu hợp lệ.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Trading Time Tracker</Text>

            <Text style={styles.stats}>
                Mục tiêu thời gian xem giá (phút): {goalTimeLimit / 60}
            </Text>

            <TextInput
                style={styles.input}
                value={inputGoal}
                onChangeText={setInputGoal}
                keyboardType="numeric"
                placeholder="Nhập thời gian mục tiêu (phút)"
            />
            <Button title="Cập nhật mục tiêu" onPress={handleSetGoalTime} />

            <Text style={styles.stats}>Số lần xem giá hôm nay: {viewTimes.length}</Text>

            <Button title="Xem Giá" onPress={handleViewPrice} />

            <Text style={styles.subtitle}>Các ngày đạt mục tiêu:</Text>
            {goalAchievedDays.length === 0 ? (
                <Text>Chưa có ngày nào đạt mục tiêu.</Text>
            ) : (
                goalAchievedDays.map((day, index) => (
                    <Text key={index} style={[styles.dateText, { color: 'green' }]}>
                        {day}
                    </Text>
                ))
            )}

            <Text style={styles.subtitle}>Các ngày không đạt mục tiêu:</Text>
            {nonGoalDays.length === 0 ? (
                <Text>Chưa có ngày nào không đạt mục tiêu.</Text>
            ) : (
                nonGoalDays.map((day, index) => (
                    <Text key={index} style={[styles.dateText, { color: 'red' }]}>
                        {day}
                    </Text>
                ))
            )}

            <Text style={styles.subtitle}>Thời gian xem giá trong ngày:</Text>
            {viewTimes.length === 0 ? (
                <Text>Chưa có thời gian xem giá nào trong ngày.</Text>
            ) : (
                viewTimes.map((time, index) => (
                    <Text key={index} style={styles.timeText}>
                        {moment(time).format('HH:mm')}
                    </Text>
                ))
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0f0f0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    stats: {
        fontSize: 18,
        marginVertical: 5,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginVertical: 10,
        paddingLeft: 10,
        width: '80%',
    },
    subtitle: {
        fontSize: 20,
        marginTop: 20,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 16,
    },
    timeText: {
        fontSize: 16,
        color: 'blue',
    },
});
