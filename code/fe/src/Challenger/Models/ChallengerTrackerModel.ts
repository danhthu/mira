import { useState, useEffect } from 'react';


export const ChallengerTrackerModel={
  useCurrent : ():{total:number,done:number,status:0|1|number}=>{
    const [data,setData] = useState({ total:0,done:0,status:0 } );
    useEffect(()=>{
      setData({ total:10,done:10,status:0 });
    },[]);
    return data;
  },
  useCalendarData: (): Array<{ date: Date; status: 0 | 1 | 2} > => {
    const [data, setData] = useState([] as Array<{ date: Date; status: 0 | 1 | 2} >);
    useEffect(() => {
      const loadData = async () => {
        setData([{ date: new Date(), status: 0 }]);
      };
            
      return () => {
              
      };
    }, []);
    return data;
  },
};