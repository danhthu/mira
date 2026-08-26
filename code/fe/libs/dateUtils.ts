import moment from "moment"


export const getDateFormat=(date:number)=>{
    return new Date(date).toISOString()
}


export const getCurrentDay = ():Date=>{
    return getDay(new Date())
}


export const getDay = (date:Date)=>{    
    date = moment(date).toDate()
    date.setHours(0,0,0,0)
    return date;
}
