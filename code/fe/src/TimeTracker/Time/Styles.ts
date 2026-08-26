import { StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { BORDER_ROUND, FONTSIZE, MARGIN, PADDING } from '../Common';

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

export const useBodyStyles = () => {
  const theme = useTheme();
  return (status: 'DOING' | 'DONE' | 'PLAN') => {


    return StyleSheet.create({
      container: {
        flexDirection: 'row',
        borderLeftWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.outline,
        paddingBottom: 10,
      },
      left_container: {
        position: 'absolute',
        left: -16,
        width: 30,
        height: 30,
        borderRadius: 15,
        borderColor: theme.secondary,
        justifyContent: 'center',
        borderWidth: 2,
        alignItems: 'center',
        backgroundColor: theme.onSecondary,
      },
      left_container_done: {
        position: 'absolute',
        left: -10,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.primary,
      },
      left_container_plan: {
        position: 'absolute',
        left: -15,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        backgroundColor: theme.onPrimary,
        borderColor: theme.tertiary,
      },
      left_icon: {
        color:
          status == 'DONE'
            ? 'white'
            : status == 'PLAN'
              ? theme.tertiary
              : theme.secondary,
      },
      left_divider: {},

      body_container: {
        flex: 1,
        marginLeft: 30,
      },
      body_title: {
        fontWeight: 'bold',
        color: status != 'DONE' ? 'black' : 'gray',
        textDecorationLine: status == 'DONE' ? 'line-through' : 'none',
      },
      body_time: {
        //  color: theme.onBackground,
        color: status != 'DONE' ? 'black' : 'gray',
        textDecorationLine: status == 'DONE' ? 'line-through' : 'none',
      },
      body_description: {
        textDecorationLine: status == 'DONE' ? 'line-through' : 'none',
        color: status != 'DONE' ? 'black' : 'gray',
      },
      right_container: {
        alignSelf: 'flex-start',
        justifyContent: 'flex-start',
        width: 80,
      },
      right_time: {
        fontWeight: 'bold',
        textAlign: 'right',
        color: status == 'DONE' ? 'gray' : 'black',
      },
      right_status: {
        textAlign: 'right',
        color: status == 'DOING' ? theme.secondary : 'black',
      },
    });

  };
};

export const useCaptionBoxStyle = () => {
  const theme = useTheme();

  return StyleSheet.create({

    box_container: {
      // backgroundColor: '#478d61',
      flexDirection: 'column',
      alignSelf: 'center',
      width: 60,
      borderRadius: 10,
      flex: 1,
      alignItems: 'center',
      margin: MARGIN.GROUP,
      // borderRadius: 1.3 * BORDER_ROUND.normal,
      padding: PADDING.ELEMENT,
    },
    box_number: {
      fontSize: FONTSIZE.NORMAL,
      color: '#231e1e',
      textAlign: 'center',
      backgroundColor: theme.background,
      width: 40,
      borderRadius: 5,
      padding: 5,
      paddingTop: 10,
      paddingBottom: 10,
    },
    box_divider: {
      width: 2,
      backgroundColor: theme.background,
      alignSelf: 'center',
      height: 14
    },
    box_label: {
      fontSize: FONTSIZE.SSSMALL,
      color: theme.onBackground,

      textAlign: 'center',
    },
    box_icon: {
      color: theme.tertiary,
      alignSelf: 'center',
      fontWeight: 'bold'
    },
    box_icon_container: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -20,
      borderRadius: 12,
      backgroundColor: theme.background
    }

  });

};
export const useCaptionStyle = () => {
  const theme = useTheme();

  return StyleSheet.create({
    box_group_container: {
      flexDirection: 'row'
    },
    box_container: {
      flex: 1,
    },
    daily_text_container: {
      left: 40,
      right: 40,
      bottom: -20,
      height: 40,
      justifyContent: 'center',
      borderRadius: 10,
      alignItems: 'center',
      backgroundColor: theme.background,
      borderColor: theme.outline,
      borderWidth: 1,
      position: 'absolute',

    },
    daily_movitation: {
      color: theme.onBackground,
      textAlign: 'center',
      fontSize: FONTSIZE.NORMAL,
      fontStyle: 'italic',
      margin: MARGIN.GROUP,
      marginTop: 0,
      backgroundColor: theme.background,
      borderRadius: BORDER_ROUND.NORMAL,
      marginBottom: 30
    },
    daily_text: {
      color: theme.tertiary,
      textAlign: 'center',
      fontSize: FONTSIZE.NORMAL
    },


    header_container: {
      flexDirection: 'row',
      padding: PADDING.ELEMENT,
      justifyContent: 'center',

    },
    header_button_container: {
      borderLeftWidth: 1,
      borderColor: theme.outline,
      padding: 5,
      minWidth: 35,
    },
    header_button_group: {
      flexDirection: 'row',
      alignSelf: 'flex-end',

      backgroundColor: theme.secondaryContainer,
      borderWidth: 1,
      borderColor: theme.outline,
      borderRadius: 5,
      marginRight: PADDING.ELEMENT,
    },
    header_button_text: {
      color: theme.onSecondary,
      backgroundColor: theme.secondary,
      textAlign: 'center',
      textAlignVertical: 'center',
      padding: 2,
      paddingLeft: 10,
      paddingRight: 10,
      borderRadius: 5,
    },
    header_text: {
      alignSelf: 'stretch',
      fontSize: FONTSIZE.NORMAL,
      padding: 5,
      flex: 1,
      color: '#1C2833',

    },
  });
};