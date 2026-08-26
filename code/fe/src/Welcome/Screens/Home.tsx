import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { StepNavigation, StepView } from 'react-native-step-view-navigation';
import { useText } from '../../../lang';
import { Link } from '../../../libs/components/Link';
import { useTheme } from '../../../theme';
import { FONTSIZE } from '../../Common';
import { useSettings } from '../../Common/Hooks';
import { useCommonStyle } from '../../Common/Styles';
import { Step1, Step2, Step3, Step4, Step5, Step6, StepFinish } from '../Components';




export const Home = ({ navigation, route }) => {
  const styles = useStyle();
  const [step, setStep] = useState(1);
  const text = useText();
  const [stepStatus, setStepStatus] = useState({} as { [key: string]: boolean });
  const [settings, setSettings] = useSettings();
  const finish = () => {
    setSettings({ hasSetupProfile: true });
    navigation.navigate('Home');
  };

  return (

    <StepNavigation step={step} dots={false}  >
      <StepView  >
        <View style={[styles.container, { backgroundColor: '#eaddca' }]}>
          <Step1 />
          <TouchableOpacity style={styles.btn} onPress={() => setStep(2)} >
            <Text style={styles.btn_text}>{text.for('Let\'s do it')}</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: FONTSIZE.NORMAL, marginTop: 10 }}>
            {text.for('By continuing, you agree to our ')}<Link viewStyle={{ marginBottom: -3 }}>{text.for('Terms')}</Link>{text.for(' and')}<Link viewStyle={{ marginBottom: -3 }}>{text.for('Privacy policy')}</Link>
          </Text>
        </View>
      </StepView>
      <StepView >
        <View style={[styles.container, { backgroundColor: '#eaddca' }]}>
          <View style={{ flex: 1 }}>
            {step == 2 ? <Step2 /> : null}
          </View>

          <TouchableOpacity style={styles.btn} onPress={() => setStep(3)} >
            <Text style={styles.btn_text}>{text.for('Continue')}</Text>
          </TouchableOpacity>
        </View>
      </StepView>
      <StepView>
        <View style={[styles.container, { backgroundColor: '#eaddca' }]}>
          <View style={{ flex: 1 }}>
            {step == 3 ? <Step3 /> : null}
          </View>

          <TouchableOpacity style={styles.btn} onPress={() => setStep(4)} >
            <Text style={styles.btn_text}>{text.for('Continue')}</Text>
          </TouchableOpacity>
        </View>
      </StepView>
      <StepView>
        <View style={[styles.container, { backgroundColor: '#eaddca' }]}>
          <View style={{ flex: 1 }}>
            {step == 4 ? <Step4 /> : null}
          </View>

          <TouchableOpacity style={styles.btn} onPress={() => { setStep(5); }} >
            <Text style={styles.btn_text}>{text.for('Continue')}</Text>
          </TouchableOpacity>
        </View>
      </StepView>

      <StepView>
        <View style={[styles.container, { backgroundColor: '#eaddca' }]}>
          <View style={{ flex: 1 }}>
            {step == 5 ? <Step5 /> : null}
          </View>
          <TouchableOpacity style={styles.btn} onPress={() => { setStep(6); }} >
            <Text style={styles.btn_text}>{text.for('Continue')}</Text>
          </TouchableOpacity>
        </View>
      </StepView>

      <StepView>
        <View style={[styles.container, { backgroundColor: '#eaddca' }]}>
          <View style={{ flex: 1 }}>
            {step == 6 ? <Step6 on_Completed={() => { setStepStatus({ ...stepStatus, step6: true }); }} /> : null}
          </View>
          {stepStatus['step6'] ? (
            <TouchableOpacity style={styles.btn} onPress={() => { setStep(7); }} >
              <Text style={styles.btn_text}>{text.for('Continue')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </StepView>
      <StepView>
        <View style={[styles.container, { backgroundColor: '#eaddca' }]}>
          <View style={{ flex: 1 }}>
            {step == 7 ? <StepFinish on_Completed={() => { setStepStatus({ ...stepStatus, step7: true }); }} /> : null}
          </View>
          {stepStatus['step7'] ? (
            <TouchableOpacity style={styles.btn} onPress={finish} >
              <Text style={styles.btn_text}>{text.for('Finish')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </StepView>
    </StepNavigation>
  );
};

const useStyle = () => {
  const color = useTheme();
  const style = useCommonStyle();
  return StyleSheet.create({
    container: style.screen && { flex: 1, paddingLeft: 30, paddingRight: 30, paddingBottom: 30, paddingTop: 50 },
    btn: {

      backgroundColor: color.secondary,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 40,
    },

    btn_text: {
      color: 'white'
    },

    label: {
      fontSize: 20,
    },
    img: {
      height: 100
    }
  });
};