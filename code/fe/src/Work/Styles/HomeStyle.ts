import { StyleSheet } from "react-native";
import { useTheme } from "../../../theme";
import { FONT_SIZE, FONT_WEIGHT, FONTSIZE } from "../../../theme/Constraints";



export const useHomeStyle = () => {
    const colors = useTheme();
    return {
        Section: {
            done: [colors.success, colors.hexToRGB(colors.success, 0.7), '#f8faff', '#ffffff']
            ,
            today: [colors.tertiary, colors.hexToRGB(colors.tertiary, 0.7), '#f8faff', '#ffffff']
            ,
            doing: [colors.primary, colors.hexToRGB(colors.primary, 0.7), '#f8faff', '#ffffff']
            ,
            mandatory: [colors.secondary, colors.hexToRGB(colors.secondary, 0.7), '#f8faff', '#ffffff']
            ,
        },
        Body: StyleSheet.create({
            sectionLabel: {
                fontSize: 20,
                color: '#fff'
            },
            sectionLink: {

            },
            sectionContainer: {
                backgroundColor: '#fff',
                marginTop: 10,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,

            },

            sectionBody: {
                backgroundColor: '#fff',
                borderColor: colors.outline,
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
                borderWidth: 1,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                padding: 4,
                minHeight: 60
            },
            sectionHeader: {
                height: 40,
                justifyContent: 'center',
                paddingLeft: 16
            }
        }),
        WorkItem: StyleSheet.create({
            container: {
                flexDirection: 'row',
                borderTopColor: colors.outlineVariant,
                borderTopWidth: 1,
                // borderRadius: 10,
                paddingTop: 5,
                paddingBottom: 5,
                paddingLeft: 8
            },
            body_container: {
                flexDirection: 'column',
                flex: 1,
                height: 50,

            },
            body_title_container: {
                flex: 1, justifyContent: 'center'
            },
            body_title_text: {
                fontWeight: FONT_WEIGHT.SEMIBOLD, fontSize: FONT_SIZE.ListItem,
            },
            body_subTitle_container: {
                flex: 1, justifyContent: 'center'
            },
            body_subTitle_text: {

                fontSize: FONTSIZE.SMALL,
                fontWeight: '300',
                color: colors.tertiary,

            },
            body_subTitle_icon:
            {
                marginRight: 10,
                fontSize: FONTSIZE.SMALL,
                fontWeight: '300',
            },
            right_container:
            {
                alignSelf: 'flex-start',
                width: 50,
                height: 40,
                marginTop: 5, //middle body
                justifyContent: 'center',
                alignItems: 'center',
            }
            ,
            left_container:
            {
                alignSelf: 'flex-start',
                height: 40,
                marginRight: 10,
                marginTop: 5, //middle body
                justifyContent: 'center',
                alignItems: 'flex-start',
            }
            ,
            left_icon: { //pause,play
                color: colors.secondary,
                fontWeight: FONT_WEIGHT.THIN,
                fontSize: 25,
            },
            right_icon: {
                color: colors.secondary,
                fontWeight: FONT_WEIGHT.THIN,
                fontSize: 25,
            },
            text_done: {
                color: colors.success,
            },


        })
    };
};