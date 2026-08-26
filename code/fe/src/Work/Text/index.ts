import { useText as useCommonText } from '../../../lang';
export const useText = () => {
  const text = useCommonText();
  return {

    Name: 'Name',
    Description: 'Descritpion',
    DoDate: 'Start Date',
    EndDate: 'End Date',
    IsMandatory: 'Is mandatory',
    Estimated: 'Estimated',
    Reminder: 'Reminder',

    for: text.for,
    translate: (name, def) => name

  } as {
    [Key: string]: any;
    translate: (name: string, def?: string) => string
  };
};