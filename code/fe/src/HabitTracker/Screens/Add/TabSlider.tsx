import React, { Children, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BLACK_COLOR, GRAY_COLOR, ROUND_NORMAL } from '../../../../theme/Constraints';

const TabSlider = ({ tabs, children, style, tabButtonHeight = 35 }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const handleTabPress = (index) => {
    Animated.timing(translateX, {
      toValue: -index * containerWidth, // Sử dụng containerWidth
      duration: 300,
      useNativeDriver: true,
    }).start();

    setActiveTab(index);
  };

  return (
    <View style={[style]} onLayout={(event) => {

      const { width } = event.nativeEvent.layout; // Lấy chiều rộng của parent
      setContainerWidth(width); // Cập nhật chiều rộng container
      console.log('width tab: ', width);
    }}>
      <View
        style={[styles.container]}

      >
        {/* Tab buttons */}
        <View style={[styles.tabContainer, { height: tabButtonHeight }]}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.tabButton, activeTab == index && { backgroundColor: BLACK_COLOR, borderRadius: ROUND_NORMAL }]}
              onPress={() => handleTabPress(index)}
            >
              {typeof tab === 'string' ? (
                <Text
                  style={
                    activeTab === index ? styles.activeTabText : styles.tabText
                  }
                >
                  {tab}
                </Text>
              ) : (
                tab // Render tab như một React node
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Content for each tab with sliding effect */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              transform: [{ translateX }],
              width: containerWidth * tabs.length, // Cập nhật chiều rộng contentContainer
            },
          ]}
        >
          {Children.map(children, (child) => (
            <View style={[styles.content, { width: containerWidth }]}>
              {child}
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: GRAY_COLOR,
    borderRadius: ROUND_NORMAL,
    borderWidth: 1,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    color: '#555',
  },
  activeTabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  contentContainer: {
    flexDirection: 'row',
    marginTop: 20
  },
  content: {

  },
});

export default TabSlider;
