import { useText as useCommonText } from '../../../lang';
export const useText = () => {
  const text = useCommonText();
  return {

    title: 'Welcome my friend,',
    wish: '"Wishing you abundant energy and happines"',

    for: text.for
  } as {
    [Key: string]: any;
  };
};