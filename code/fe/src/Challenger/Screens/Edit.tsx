import { useState } from 'react';
import { useAsyncAction } from '../../Common/Hooks';
import { ChallengeForm } from '../Components/ChallengeForm';
import {
  Challenge,
  ChallengeAssociate,
  challengeAssociateRepository,
  challengeRepository,
} from '../Entities';
import { useText } from '../Text';

export const Edit = ({ route, navigation }) => {
  const [data, setData] = useState(new Challenge());
  const [associations, setAssociations] = useState([] as ChallengeAssociate[]);
  const text = useText();
  const id: string = route.params && route.params.id;

  useAsyncAction(async () => {
    if (!id) return;
    setData(await challengeRepository.findById(id));
    setAssociations(
      await challengeAssociateRepository.filter((a) => a.challengeId === id),
    );
  }, [id]);

  const onSave = async () => {
    await challengeRepository.addOrUpdate(data);
    await challengeAssociateRepository.delete2((a) => a.challengeId === data.id);
    await Promise.all(
      associations.map((a) => challengeAssociateRepository.addOrUpdate(a)),
    );
    navigation.goBack();
  };

  return (
    <ChallengeForm
      title={text.screen_edit}
      data={data}
      associations={associations}
      onChanged={setData}
      onAssociationsChanged={setAssociations}
      onSave={onSave}
      onBack={navigation.goBack}
    />
  );
};
