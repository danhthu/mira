import { useEffect, useState } from 'react';
import { Reminder,Repo } from '../Entities';


const useList =  (): Array<Reminder>=>{
  const reminderRepository = Repo.reminderRepository;
  const [data,setData] = useState([] as Array<Reminder>);
  useEffect(()=>{
    const load = async ()=>{
      setData(await reminderRepository.list());
    };
    reminderRepository.registerDataChanged(load);
    return ()=> reminderRepository.unRegisterDataChanged(load);
  },[]);
  return data;
};

export const reminderModel={
  useList
};