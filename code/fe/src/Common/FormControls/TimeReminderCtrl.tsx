import { getLogger } from '..';
import { B } from '../../../libs/components';
import { TBL_ROW_HEIGHT } from '../../../theme/Constraints';
import { reminderOption, repeatOption } from '../Interfaces';
import { useText } from '../Text';

const rowHeight = TBL_ROW_HEIGHT;
const logger = getLogger('FormControls-TimeReminder');
export const TimeReminderCtrl = (props: {
  value?: reminderOption
  onChanged?: (val: repeatOption) => void
}) => {
  const text = useText();
  return <B.TextBox dataType="time"
    icon={'bells'}
    iconStyle={{ color: 'orange', fontWeight: '500' }}
    label={text.batdau || 'Nhắc tôi'}
    value={!props.value ? null : props.value} onChanged={props.onChanged} />;
};


