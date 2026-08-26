export interface repeatOption {
  enable: boolean,
  kind?: 'daily' | 'weekly' | 'monthly',
  repeat?: number,
  days?: Array<number>,
  dayOfWeek?: Array<number>,
  endDate?: number,
  endDateEnable?: boolean,
  startTime?: number;
}

export interface reminderOption {
  enable: boolean,
  hour?: number,
  minut?: number,
  title?: string,
  descritpion?: string,
  date?: Date
}

export interface priorityOption {
  level?: string;
  color?: string;
}

export interface planOption {
  enable: boolean,
  hour?: number,
  minut?: number,
  title?: string,
  descritpion?: string,
  startTime?: number;
}


export interface goalOption {
  enable: boolean,
  total?: number,
  done?: number;
  unit?: string
}

export declare type tagOption = string[]
export interface checkListOption {
  data: Array<{ text: string, checked?: boolean }>
}

export interface priorityOption {
  level?: string;
  color?: string;
}

export interface planOption {
  enable: boolean,
  hour?: number,
  minut?: number,
  title?: string,
  descritpion?: string,
  startTime?: number;
}


export interface goalOption {
  enable: boolean,
  total?: number,
  done?: number;
  unit?: 'Hour' | 'Day' | 'Time' | string
}


export declare type COLOR = 'red' | 'green' | 'blue'

export type STATUS = 'CREATED' | 'DOING' | 'PAUSE' | 'PLAN' | 'DONE'

