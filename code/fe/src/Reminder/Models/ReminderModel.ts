import { useEffect, useState } from 'react';
import { Reminder } from '../Entities';
import { reminderRepository } from '../Entities';

const useList =  (): Array<Reminder>=>{
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