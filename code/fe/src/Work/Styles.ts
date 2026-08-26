import { StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { FONTSIZE } from '../Common';


export const useScreenStyle = () => {
  const theme = useTheme();
  return StyleSheet.create({
    container: {
      flexDirection: 'column',
      backgroundColor: theme.background,
      flex: 1,
    },
    caption: {
      backgroundColor: theme.primary,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      paddingBottom: 30,

    },
    body: {
      marginTop: 30,
      flex: 1
    },
  });
};

export const useCaptionStyle = () => {

  return StyleSheet.create({
    container: {
      paddingTop: 10,
      flex: 1,
      flexDirection: 'column'
    },
    caption: {
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: FONTSIZE.SMALL
    },
    component_container: {
      flexDirection: 'row',
      flex: 1
    },
    motivation_container: {

    },
    motivation_text: {

    }
  });
};

export const useBodyStyle = () => {
  return StyleSheet.create({
    container: {

    },
    nowork_image: {

    },
    nowork_text_line_1: {

    },
    nowork_text_line_2: {

    },
    container_high: {

    },
    container_nomal: {

    }

  });
};