import { configStore } from '../store/configStore';
import { enString } from './en';
import { textString } from './textString';

export const getText=(name:string): typeof textString=>{
  return name=='en'? enString:textString;
};

export const useText=():typeof textString=>{
  return getText(configStore.useState(s=>s.lang));
};

export const useLocale=()=>{
  return 'en';
};



