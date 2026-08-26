import { View, Text, ViewProps } from "react-native"
import { Grid, Col, Row } from "react-native-easy-grid"
import { FONTSIZE, ICONSIZE, MARGIN, PADDING } from "../../theme/Constraints"
import { ICON_LIST, FontICon } from "./Icon"
import { Switch } from "react-native-paper"
import { ReactNode } from "react"
import { useTheme } from "../../theme"



export const BCard = (props: ViewProps) => {
  const theme = useTheme()
  return (<View
    style={[
      {
        flexDirection: 'column',
        padding: PADDING.ELEMENT,
        borderColor: theme.outlineVariant,
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: MARGIN.GROUP
      },
      props.style,
    ]}

  >{props.children}</View>)
}

interface CaptionRowProps {
  title: string
  subTitle: string
  value?: boolean
  iconLeft: ICON_LIST
  onChanged?: (e: boolean) => void,
  iconRight?: () => ReactNode
}

export const CaptionRow = (props: CaptionRowProps) => {
  return (
    <View style={{ height: 40 }}>
      <Grid>
        <Col
          style={{
            flex: null,
            height: 40,
            width: 40,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <FontICon name={props.iconLeft} size={ICONSIZE.LARGE} />
        </Col>
        <Col style={{ height: 40 }}>
          <Row>
            <Text
              style={{
                height: 20,
                justifyContent: 'center',
                fontWeight: 'bold',
              }}
            >
              {props.title}
            </Text>
          </Row>
          <Row>
            <Text style={{ height: 18, fontSize: FONTSIZE.SMALL, justifyContent: 'center' }}>
              {props.subTitle}
            </Text>
          </Row>
        </Col>
        <Col
          style={{
            flex: null,
            height: 40,
            width: 40,
            justifyContent: 'center',
            alignItems: 'flex-end',
          }}
        >
          {props.iconRight ? props.iconRight() : <Switch value={props.value} onValueChange={props.onChanged}></Switch>}

        </Col>
      </Grid>
    </View>
  )
}