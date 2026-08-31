import { Animated, Easing } from 'react-native';

class ModalTransition {
  animationValue: Animated.Value;

  constructor() {
    this.animationValue = new Animated.Value(0);
  }

  expandItemToModal(viewRefItem, viewRefModal) {
    this.animationValue.setValue(0);

    // Chụp ảnh kích thước và vị trí của item
    viewRefItem.measure((x, y, width, height, pageX, pageY) => {
      const itemLayout = { x: pageX, y: pageY, width, height };

      // Chụp ảnh kích thước và vị trí của modal
      viewRefModal.measure((x, y, width, height, pageX, pageY) => {
        const modalLayout = { x: pageX, y: pageY, width, height };

        // Tạo hiệu ứng chuyển đổi từ item sang modal
        Animated.timing(this.animationValue, {
          toValue: 1,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start();

        // Sử dụng interpolate để tạo hiệu ứng giữa hai view
        const interpolatedStyles = {
          left: this.animationValue.interpolate({
            inputRange: [0, 1],
            outputRange: [itemLayout.x, modalLayout.x],
          }),
          top: this.animationValue.interpolate({
            inputRange: [0, 1],
            outputRange: [itemLayout.y, modalLayout.y],
          }),
          width: this.animationValue.interpolate({
            inputRange: [0, 1],
            outputRange: [itemLayout.width, modalLayout.width],
          }),
          height: this.animationValue.interpolate({
            inputRange: [0, 1],
            outputRange: [itemLayout.height, modalLayout.height],
          }),
        };

        //   viewRefModal.setNativeProps({ style: interpolatedStyles });
      });
    });
  }

  collapseModalToItem(viewRefItem, viewRefModal) {

    console.log('====================');
    console.log('animationValue', this.animationValue);
    this.animationValue.setValue(1);

    // Chụp ảnh kích thước và vị trí của modal
    viewRefModal.measure((x, y, width, height, pageX, pageY) => {
      const modalLayout = { x: pageX, y: pageY, width, height };

      // Chụp ảnh kích thước và vị trí của item
      viewRefItem.measure((x, y, width, height, pageX, pageY) => {
        const itemLayout = { x: pageX, y: pageY, width, height };

        // Tạo hiệu ứng chuyển đổi từ modal về item
        Animated.timing(this.animationValue, {
          toValue: 0,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start();

        // Sử dụng interpolate để tạo hiệu ứng giữa hai view
        const interpolatedStyles = {
          left: this.animationValue.interpolate({
            inputRange: [0, 1],
            outputRange: [itemLayout.x, modalLayout.x],
          }),
          top: this.animationValue.interpolate({
            inputRange: [0, 1],
            outputRange: [itemLayout.y, modalLayout.y],
          }),
          width: this.animationValue.interpolate({
            inputRange: [0, 1],
            outputRange: [itemLayout.width, modalLayout.width],
          }),
          height: this.animationValue.interpolate({
            inputRange: [0, 1],
            outputRange: [itemLayout.height, modalLayout.height],
          }),
        };

        //viewRefModal.setNativeProps({ style: interpolatedStyles });
      });
    });
  }
}

export default ModalTransition;
