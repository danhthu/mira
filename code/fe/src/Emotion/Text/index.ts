import { useText as useCommonText } from '../../../lang'
const _def = {
  notgreat: 'Not great',
  good: 'Good',
}
export const useText = () => {
  const text = useCommonText()
  return {
    emotion_status: {
      sobad: 'so bad',
      bad: 'bad',
      normal: 'normal',
      good: 'good',
    },
    translate: (text, def?) => {
      if (!_def[text]) {
        _def[text] = def || text
      }
      return _def[text]
    },
  } as {
    [Key: string]: any
  }
}
