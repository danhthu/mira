import { ReactNode } from 'react'
import { StyleProp, ViewStyle } from 'react-native'

export const TabContent = (props: {
  tabs: Array<string | ReactNode>
  onTabIndexChanged?: (index) => void
  size?: 'large' | 'normal' | 'small'
  style?: StyleProp<ViewStyle>
}) => {}
