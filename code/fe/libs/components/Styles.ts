import { Platform, StyleSheet } from "react-native"
import { useTheme } from "../../theme"
import { FONTSIZE } from "../../theme/Constraints"



export const useButtonStyle = () => {
    const colors = useTheme()
    return {
        default: StyleSheet.create({
            container: {

                backgroundColor: '#fff',
                borderColor: '#ccc',
                borderWidth: 1,
                padding: 5,
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
            },
            text: {
                color: '#333'
            }
        }),
        disabled: {
            text: {
                color: '##ddd'
            }
        },
        link: StyleSheet.create({
            text: { color: colors.primary }
        }),
        primary: StyleSheet.create({
            container: {
                backgroundColor: '#337ab7',
                borderColor: '#2e6da4',
                borderWidth: 1, padding: 5,
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
            },
            text: {
                color: '#fff'
            }
        }),
        secondary: StyleSheet.create({
            container: {

            },
            text: {

            }
        }),
        small: StyleSheet.create({
            text: { fontSize: FONTSIZE.SMALL }
        }),
        normal: StyleSheet.create({
            text: { fontSize: FONTSIZE.NORMAL }
        }),
        big: StyleSheet.create({
            text: { fontSize: FONTSIZE.BIG }
        }),
    }
}

export const useSection = () => {
    const colors = useTheme()
    return StyleSheet.create({
        round: {
            borderRadius: 1
        },
        bordered: {
            borderWidth: 1,
            borderColor: colors.outlineVariant
        },
        normal: {
            padding: 10
        }
    })
}

export const useBgStye = () => {
    const colors = useTheme()
    return StyleSheet.create({
        muted: {
            color: '#777'
        },
        success: {
            color: '#3c763d'
        },
        info: {
            color: '#31708f'
        },
        warning: {
            color: '#8a6d3b'
        },
        danger: {
            color: '#d44950'
        },
        primary: {
            color: colors.primary
        },
        secondary: {
            color: colors.secondary
        },
        gray: {
            color: colors.getColor('#000000', 33.5)
        },
        gray_dark: {
            color: colors.getColor('#000000', 20)
        },
        gray_darker: {
            color: colors.getColor('#000000', 13.5)
        },
        gray_light: {
            color: colors.getColor('#000000', 46.7)
        },
        gray_lighter: {
            color: colors.getColor('#000000', 93.5)
        }
    })
}


export const useTextStyle = () => {
    const colors = useTheme()

    return StyleSheet.create({
        default: {
            color: '#000'
        },
        muted: {
            color: '#777'
        },
        success: {
            color: '#3c763d'
        },
        info: {
            color: '#31708f'
        },
        warning: {
            color: '#8a6d3b'
        },
        danger: {
            color: '#d44950'
        },
        primary: {
            color: colors.primary
        },
        secondary: {
            color: colors.secondary
        },
        small: {
            fontSize: FONTSIZE.SMALL,
        },
        normal: {
            fontSize: FONTSIZE.NORMAL
        },
        big: {
            fontSize: FONTSIZE.BIG
        },
        description: {
            fontSize: FONTSIZE.SMALL,
        },
        label: {
            fontSize: FONTSIZE.NORMAL,
        },
        bold: {
            fontWeight: 'bold'
        }
    })

}

export const useHtmlStyle = () => {
    return StyleSheet.create({
        li: { marginBottom: 10 },
        p: { marginTop: 10, marginBottom: 10 }
    })
}

export const useInputTextStyle = () => {
    const colors = useTheme()

    return StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: 'column'
        },
        inputContainer: {
            // marginTop:5,
            // marginBottom:5,
            justifyContent: 'center',

        },
        label: {
            marginBottom: -3,
            fontSize: FONTSIZE.NORMAL,
            color: colors.getColor('#000000', 600)
        },
        multipleBox: {
            fontSize: FONTSIZE.NORMAL,

            ...(Platform.OS === 'web' && {
                outlineWidth: 0, // Ẩn border khi focus trên web
                outlineColor: 'transparent', // Màu của border khi focus
            }),
        },
        textBox: {
            paddingTop: 8,
            paddingBottom: 8,
            fontSize: 20,
            //                marginBottom: 10,
            //paddingLeft:5,
            ...(Platform.OS === 'web' && {
                outlineWidth: 0, // Ẩn border khi focus trên web
                outlineColor: 'transparent', // Màu của border khi focus
            }),
        },
        danger: {
            color: '#d44950'
        }
    })
}