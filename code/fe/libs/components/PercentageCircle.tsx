/** React Native Percentage Circle
 ** @github  https://github.com/JackPu/react-native-percentage-circle
 ** React Native Version >=0.25
 ** to fixed react native version
 **/

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  View,
} from 'react-native';

const styles = StyleSheet.create({
  circle: {
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e3e3e3',
  },
  leftWrap: {
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
  },
  rightWrap: {
    position: 'absolute',

  },

  loader: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: 1000,

  },

  innerCircle: {
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 11,
    color: '#888',
  },
});

class PercentageCircle extends Component<any, any> {
  propTypes: {
    color: string,
    bgcolor: string,
    innerColor: string,
    radius: number,
    percent: number,
    borderWidth: number,
    textStyle: Array<TextStyle>,
    disabled: boolean,
  }
  static defaultProps: { bgcolor: string; innerColor: string; };

  constructor(props) {
    super(props);

    let percent = this.props.percent;
    let leftTransformerDegree = '0deg';
    let rightTransformerDegree = '0deg';
    if (percent >= 50) {
      rightTransformerDegree = '180deg';
      leftTransformerDegree = (percent - 50) * 3.6 + 'deg';
    } else {
      rightTransformerDegree = percent * 3.6 + 'deg';
      leftTransformerDegree = '0deg';
    }

    this.state = {
      percent: this.props.percent,
      borderWidth: this.props.borderWidth < 2 || !this.props.borderWidth ? 2 : this.props.borderWidth,
      leftTransformerDegree: leftTransformerDegree,
      rightTransformerDegree: rightTransformerDegree,
      textStyle: this.props.textStyle ? this.props.textStyle : null
    };
  }
  static getDerivedStateFromProps(props, state) {
    //if (props.currentRow !== state.lastRow) {
    let percent = props.percent;
    let leftTransformerDegree = '0deg';
    let rightTransformerDegree = '0deg';
    if (percent >= 50) {
      rightTransformerDegree = '180deg';
      leftTransformerDegree = (percent - 50) * 3.6 + 'deg';
    } else {
      rightTransformerDegree = percent * 3.6 + 'deg';
    }
    return {
      percent: props.percent,
      borderWidth: props.borderWidth < 2 || !props.borderWidth ? 2 : props.borderWidth,
      leftTransformerDegree: leftTransformerDegree,
      rightTransformerDegree: rightTransformerDegree
    };
    // }

    // Return null to indicate no change to state.
    //  return null;
  }
  /*
  componentWillReceiveProps(nextProps) {
    let percent = nextProps.percent;
    let leftTransformerDegree = '0deg';
    let rightTransformerDegree = '0deg';
    if (percent >= 50) {
      rightTransformerDegree = '180deg';
      leftTransformerDegree = (percent - 50) * 3.6 + 'deg';
    } else {
      rightTransformerDegree = percent * 3.6 + 'deg';
    }
    this.setState({
      percent: this.props.percent,
      borderWidth: this.props.borderWidth < 2 || !this.props.borderWidth ? 2 : this.props.borderWidth,
      leftTransformerDegree: leftTransformerDegree,
      rightTransformerDegree: rightTransformerDegree
    });
  }*/

  render() {
    if (this.props.disabled) {
      return (
        <View style={[styles.circle, {
          width: this.props.radius * 2,
          height: this.props.radius * 2,
          borderRadius: this.props.radius
        }]}>
          <Text style={styles.text}>{this.props.disabledText}</Text>
        </View>
      );
    }
    return (
      <View style={[styles.circle, {
        width: this.props.radius * 2,
        height: this.props.radius * 2,
        borderRadius: this.props.radius,
        backgroundColor: this.props.bgcolor
      }]}>
        <View style={[styles.leftWrap, {
          width: this.props.radius,
          height: this.props.radius * 2,
          left: 0,
        }]}>
          <View style={[styles.loader, {
            left: this.props.radius,
            width: this.props.radius,
            height: this.props.radius * 2,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            backgroundColor: this.props.color,
            transform: [{ translateX: -this.props.radius / 2 }, { rotate: this.state.leftTransformerDegree }, { translateX: this.props.radius / 2 }],
          }]}></View>
        </View>
        <View style={[styles.leftWrap, {
          left: this.props.radius,
          width: this.props.radius,
          height: this.props.radius * 2,
        }]}>
          <View style={[styles.loader, {
            left: -this.props.radius,
            width: this.props.radius,
            height: this.props.radius * 2,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            backgroundColor: this.props.color,
            transform: [{ translateX: this.props.radius / 2 }, { rotate: this.state.rightTransformerDegree }, { translateX: -this.props.radius / 2 }],
          }]}></View>
        </View>
        <View style={[styles.innerCircle, {
          width: (this.props.radius - this.state.borderWidth) * 2,
          height: (this.props.radius - this.state.borderWidth) * 2,
          borderRadius: this.props.radius - this.state.borderWidth,
          backgroundColor: this.props.innerColor,
        }]}>
          {this.props.children ? this.props.children :
            <Text style={[styles.text, this.state.textStyle]}>{this.props.percent}%</Text>}
        </View>

      </View>
    );
  }
}

// set some attributes default value
PercentageCircle.defaultProps = {
  bgcolor: '#e3e3e3',
  innerColor: '#fff',

};
export { PercentageCircle };


import Svg, { Circle } from 'react-native-svg';

export const PercentageCircleV2 = ({ startPoint = 90, radius = 50, strokeWidth = 10, process = 0, centerView, processColor = 'blue', bgColor = '#ddd' }) => {

  const circumference = 2 * Math.PI * radius;
  const processValue = process > 100 ? 100 : process < 0 ? 0 : process;
  const progressStroke = (processValue / 100) * circumference;
  // Tính toán strokeDashoffset dựa trên `startPoint` phần trăm
  const strokeDashoffset = (1 - startPoint / 100) * circumference;
  const styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    centerView: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Svg height={radius * 2 + strokeWidth} width={radius * 2 + strokeWidth}>
        {/* Background Circle */}
        <Circle
          stroke={bgColor}
          cx={radius + strokeWidth / 2}
          cy={radius + strokeWidth / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill={'#fff'}
        />
        {/* Progress Circle */}
        <Circle
          stroke={processColor}
          cx={radius + strokeWidth / 2}
          cy={radius + strokeWidth / 2}
          r={radius}
          strokeWidth={strokeWidth * 0.7}
          strokeDasharray={`${progressStroke}, ${circumference}`}
          strokeLinecap="round"
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          origin={`${radius + strokeWidth / 2}, ${radius + strokeWidth / 2}`}
        />
      </Svg>
      <View style={styles.centerView}>{centerView}</View>
    </View>
  );
};

