import { DailyActivity } from '../Entities/DailyActivity';
import { dailyActivityRepository, timeCatRepository } from '../Entities/repositories';
import { TimeCat } from '../Entities/TimeCat';

export  async function initialize(){

  const data = [{ id:'Working', label: 'Working', color: '#0000FF',minPercentage:40, maxPercentage:50 },
    { id:'Personal',label: 'Personal',  color: '#008000',minPercentage:10, maxPercentage:15  },
    { id:'Family', label: 'Family',  color: '#FFFF00',minPercentage:10, maxPercentage:15  },
    { id:'Relationship',label: 'Relationship', color: '#FFA500',minPercentage:10, maxPercentage:15  },
    { id:'Waste', label: 'Waste',  color: '#000000',minPercentage:5, maxPercentage:10  },
    { id:'Relax', label: 'Sleep & Relax ', color: '#800080' ,minPercentage:25, maxPercentage:30 }
  ].map(d=> ({ ...new TimeCat,...d,id:d.id,name:d.label }));
  await timeCatRepository.empty();
  await timeCatRepository.adds(data);
  //log
  const dailyActivies = [
    {
      id:'Sleep',
      name:'Sleep',
      did: 8*60,
      protected:true,
      timeCatId:'Relax'
    },
    {
      id:'Transport',
      name:'Transport',
      did: 60,
      protected:true,
      timeCatId:'Waste'
    },
  ].map(d=>({ ...new DailyActivity,...d }));
  await dailyActivityRepository.empty();
  await dailyActivityRepository.adds(dailyActivies);

  await timeCatRepository.save();
  await dailyActivityRepository.save();


}