import moment from 'moment';
import { useState } from 'react';
import {
  ChallengeForm,
  DEFAULT_WINDOW_DAYS,
} from '../Components/ChallengeForm';
import {
  Challenge,
  ChallengeAssociate,
  challengeAssociateRepository,
  challengeRepository,
} from '../Entities';
import { useText } from '../Text';

/** Quãng mặc định có sẵn: mở màn ra là chỉ còn phải đặt tên (ràng buộc #1). */
const newChallenge = (): Challenge => {
  const start = new Date();
  return {
    ...new Challenge(),
    start,
    end: moment(start).add(DEFAULT_WINDOW_DAYS, 'days').toDate(),
  };
};

export const Add = ({ navigation }) => {
  const [data, setData] = useState(newChallenge);
  const [associations, setAssociations] = useState([] as ChallengeAssociate[]);
  const text = useText();

  const onSave = async () => {
    await challengeRepository.addOrUpdate(data);
    await Promise.all(
      associations.map((a) => challengeAssociateRepository.addOrUpdate(a)),
    );
    navigation.goBack();
  };

  return (
    <ChallengeForm
      title={text.screen_add}
      data={data}
      associations={associations}
      onChanged={setData}
      onAssociationsChanged={setAssociations}
      onSave={onSave}
      onBack={navigation.goBack}
    />
  );
};
