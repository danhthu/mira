import { ReactElement, ReactNode, useState } from 'react';
import { TouchableHighlight } from 'react-native';
import Tooltip  from 'react-native-walkthrough-tooltip';
import { BText as Text } from '../../../libs/components';

export const Tip=(props:{children:ReactElement,content: React.ReactElement|string,
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
})=>{
  const [isVisible,setIsVisible] = useState(false);
  return <Tooltip
    isVisible={isVisible}
    content={typeof(props.content)==='string'?<Text>{props.content}</Text> :props.content}
    placement={props.placement||'top'}
    onClose={() => setIsVisible(false)}
  >
    <TouchableHighlight onPress={()=>setIsVisible(true)}>
      {props.children}
    </TouchableHighlight>
  </Tooltip>;
};
