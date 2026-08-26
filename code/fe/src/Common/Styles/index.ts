import { StyleSheet } from 'react-native'
import { useTheme } from '../../../theme'
import {
  AWATAR_SIZE,
  FONT_SIZE,
  FONT_WEIGHT,
  HEADER_HEIGHT,
  ICON_TOUCH_WIDTH,
  MARGIN,
  PADDING,
  SECOND_BLACK_COLOR,
  TBL_ROW_HEIGHT,
} from '../../../theme/Constraints'

export const useCommonStyle = () => {
  const colors = useTheme()
  return {
    hashtag: StyleSheet.create({
      wrapper: {
        flexDirection: 'row',
        marginBottom: 20,
        marginTop: 20,
      },
      container: {
        marginRight: 20,
        borderColor: colors.outline,
        borderRadius: 15,
        borderWidth: 1,
        paddingLeft: 15,
        paddingRight: 15,
        height: 30,
        justifyContent: 'center',
      },
      container_actived: {
        backgroundColor: colors.hexToRGB(colors.primary, 0.7),
      },

      text: {},
      text_actived: {
        color: colors.onPrimary,
      },
    }),
    ...StyleSheet.create({
      left: {
        alignSelf: 'flex-start',
      },
      right: {
        alignSelf: 'flex-end',
      },
      full: {
        flex: 1,
      },
      icon_wrapper: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      small: {
        fontSize: 13,
      },
      normal: {
        fontSize: 16,
      },
      big: {
        fontSize: 19,
      },
      bigger: {
        fontSize: 22,
      },
      largest: {
        fontSize: 30,
      },
      center: {
        textAlign: 'center',
      },

      title: {
        fontWeight: '700',
        fontSize: 17,
      },
      subTitle: {
        fontSize: 16,
        fontWeight: '400',
      },
      description: {},
      content: {},

      bg_info: {
        backgroundColor: colors.info,
      },

      info: {
        color: colors.info,
      },
      row: {
        flexDirection: 'row',
      },
      row_old: {},
      row_even: {},
      col: {
        paddingLeft: 5,
        paddingRight: 5,
        height: TBL_ROW_HEIGHT,
        justifyContent: 'center',
        alignItems: 'flex-start',
      },

      sectionContainer: {
        marginTop: 8,
        marginBottom: 8,
        paddingLeft: PADDING.LEFT,
        paddingRight: PADDING.RIGHT,
        // backgroundColor: '#fff'
      },

      sectionLabel: {
        marginTop: 8,
        marginBottom: 8,
        marginLeft: PADDING.LEFT,
        fontWeight: FONT_WEIGHT.NORMAL,
        fontSize: FONT_SIZE.Snippets,
        // backgroundColor: '#fff'
      },
      screen: {
        padding: 16,
        paddingTop: 50,
        flex: 1,
        backgroundColor: colors.bgColor,
      },
      modalScreen: {
        padding: 16,
        paddingTop: 10,
      },
      modalPadding: {
        padding: 16,
      },
    }),
    form: StyleSheet.create({
      container: {
        backgroundColor: '#eee',
        borderRadius: 5,
        padding: 7,
        paddingLeft: 15,
        paddingRight: 15,
        marginTop: 10,
      },
      groupTitle: {
        color: SECOND_BLACK_COLOR,
        marginTop: 15,
        marginBottom: 5,
      },
      label: {
        color: '#000',
        fontWeight: 'semibold',
        marginRight: 10,
      },
      icon: {
        marginRight: 10,
      },
      form_error: {},
      form_value: {
        color: '#000',
        flex: 1,
      },
      form_placeholder: {},
    }),
    bottomModal: StyleSheet.create({
      style: {
        justifyContent: 'flex-end',
        flex: 1,
        marginLeft: -5,
        marginRight: -5,
        marginBottom: -20,
      },
    }),
    header: StyleSheet.create({
      container: {
        height: HEADER_HEIGHT,
      },
      left: {
        width: ICON_TOUCH_WIDTH,
        height: HEADER_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
      },
      right: {
        width: ICON_TOUCH_WIDTH,
        height: HEADER_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 0,
      },
      icon: {
        color: colors.primary,
        fontSize: FONT_SIZE.PageTitle,
        lineHeight: HEADER_HEIGHT,
      },
      title: {
        marginLeft: ICON_TOUCH_WIDTH,
        marginRight: ICON_TOUCH_WIDTH,
        flex: 1,
        color: colors.primary,
        fontSize: FONT_SIZE.PageTitle,
        lineHeight: HEADER_HEIGHT,
        textAlign: 'center',
        fontWeight: FONT_WEIGHT.SEMIBOLD,
      },
    }),
    awatar: StyleSheet.create({
      container: {
        width: AWATAR_SIZE,
        height: AWATAR_SIZE,
        borderRadius: 20,
        backgroundColor: '#fff',
      },
      small: {
        width: AWATAR_SIZE / 2,
        height: AWATAR_SIZE / 2,
        borderRadius: 20 / 2,
        backgroundColor: '#fff',
      },
    }),
    tips: StyleSheet.create({
      text_link: {
        fontSize: FONT_SIZE.Text,
        fontWeight: FONT_WEIGHT.SEMIBOLD,
        color: colors.primary,
        textDecorationLine: 'underline',
        lineHeight: 30,
        textAlign: 'center',
      },
      text_icon: {
        fontSize: FONT_SIZE.Text,
        color: colors.primary,
        textDecorationLine: 'underline',
      },
      text_container: {
        padding: 5,
      },
      container: {
        backgroundColor: colors.primaryColors[500],
        margin: MARGIN.SCREEN,
        borderRadius: 10,
        padding: 10,
        marginTop: 7,
        borderColor: colors.primaryColors[200],
        borderWidth: 1,
      },
      title: {
        fontSize: FONT_SIZE.Snippets,
        fontWeight: '400',
        color: colors.onPrimaryColors[500],
      },
      title_container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
      },

      checklist_container: {
        paddingLeft: 10,
        paddingTop: 10,
      },
      checklist_item_container: {
        flexDirection: 'row',
        marginBottom: 10,
      },
      checklist_icon: {
        fontSize: FONT_SIZE.SecondaryText,
        color: colors.onPrimaryColors[500],
      },
      checklist_text: {
        fontSize: FONT_SIZE.SecondaryText,
        color: colors.onPrimaryColors[500],
      },
    }),
    buttons: {
      default: StyleSheet.create({
        view: {},
        text: {},
        view_actived: {},
        text_actived: {},
      }),
      linkWithBackground: StyleSheet.create({
        view: {},
        text: {},
        view_actived: {},
        text_actived: {},
      }),
    },
    modal: StyleSheet.create({
      container: {
        margin: 0,
        //padding:20,
        //alignSelf: 'flex-end',
      },
      modalContent: {
        //  alignSelf:'flex-end'
        position: 'absolute',
        bottom: 30,
        left: 10,
        right: 10,
        borderRadius: 10,
        padding: 20,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        flex: 1,
        zIndex: 1000,
      },
      modalOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: -999,

        backgroundColor: 'rgba(0,0,0,0.3)',
      },
    }),
  }
}
