import { useText as useCommonText } from '../../../lang';
export const useText = () => {
  const text = useCommonText();
  const result = {

    Name: 'Name',
    Description: 'Descritpion',
    DoDate: 'Start Date',
    EndDate: 'End Date',
    IsMandatory: 'Is mandatory',
    Estimated: 'Estimated',
    Reminder: 'Reminder',

    for: text.for,
    translate: t => t
  } as {
    [Key: string]: any;
  };


  return result;
};