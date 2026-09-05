import { textString } from './textString';

const identity = (name: string, def?: string): string => def ?? name;

/**
 * Bản tiếng Anh. Tiếng Việt là ngôn ngữ mặc định của Mira; bảng này giữ cấu trúc
 * đa ngôn ngữ đã có trong `configStore.lang`. Chuỗi nguồn trong .tsx vốn là tiếng
 * Anh nên `for`/`translate` ở đây trả lại nguyên chuỗi.
 */
export const enString: typeof textString = {
  appName: textString.appName,

  common: {
    daysOfWeek: [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
    ],
    daysOfWeekShort: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    daysOfWeekShort3L: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    priority: {
      high: 'High',
      normal: 'Normal',
      low: 'Low',
      label: 'priority',
    },
    work: 'Work',
    doing: 'doing',
    status: 'Status',
    statusText: ['not done', 'done'],
    habit: 'Habit',
    challenge: 'challenge',
    save: 'Save',
    edit: 'Edit',
    description: 'description',
    color: 'color',
    repeat: 'repeat',
    reminder: 'reminder',
    tool: 'tools',
    newHabit: 'new habit',
    error: {
      habit_day_greater: '',
    },
    addNew: 'Add new',
    completed: 'Completed',
    basic_info: 'Basic info',
    tabar: {
      profile: 'Profile',
      timeTracker: 'Time',
      habitTracker: 'Habit',
      challenge: 'Challenge',
      home: 'Home',
    },
    delete: 'delete',
  },

  save: 'Save',
  add: 'Add',
  edit: 'Edit',
  cancel: 'Cancel',
  done: 'Done',
  day: 'day',
  week: 'week',
  month: 'month',
  year: 'year',

  plus: '+',

  repeat: {
    title: 'Repeat',
    subTitle: 'Set a cycle for this item',
    weekly: 'weekly',
    monthly: 'monthly',
    day: 'day',
    week: 'week',
    month: 'month',
    daily: 'daily',
    repeat: 'Repeat',
    every: 'Every',
    endDay: 'end day',
  },
  goal: {
    title: 'Goal',
    subTitle: 'Set a goal',
    perday: 'per day',
  },
  reminder: {
    title: 'Reminder',
    subTitle: 'Set a reminder for this item',
    des: 'Remind me at ',
  },
  plan: {
    title: 'Plan',
    subTitle: 'Estimated time for the planned task',
    des: 'Doing at ',
  },
  tag: {
    title: 'Tag',
    subTitle: 'Customized text input box',
  },
  checkList: {
    title: 'Checklist',
    subTitle: 'Things to tick off when done',
  },

  for: identity,
  translate: identity,

  profile_screen: {
    HelpAndFeedback: 'Help and feedback',
    StatusStat: 'Mood',
    HabitStat: 'Habits',
    TimeStat: 'Time',
    ChallengerStat: 'Challenges',
    ViewAll: 'View all',
    Caption: 'Profile',
    help_center: 'Help center',
    feedback: 'Feedback',
    privacy: 'Privacy policy',
    term: 'Terms',
  },

  welcome_Q: {
    title: 'Does any of this sound familiar',
    questions: [
      { title: 'Life is crowded, and the good moments pass quickly', answer: true },
      { title: 'You often feel under pressure', answer: true },
      { title: 'A day, a week, a month goes by and it is unclear what you did', answer: true },
      { title: 'You want to keep a good habit but it is hard to sustain', answer: true },
      { title: 'There is more daily work than you can turn around', answer: true },
      { title: 'You set goals for yourself and then leave them there', answer: true },
    ],
  },

  welcome_Recomments: {
    title: 'From what you shared, here are a few things that may fit',
    array: textString.welcome_Recomments.array.map((item, index) => ({
      ...item,
      title: [
        'Light movement for about 15 minutes after waking up, to warm the body.',
        'Look at and sort the day ahead at {$.wakeup.minut+15>60?$.wakeup.hour+1:$.wakeup.hour}: {($.wakeup.minut+15)>=60?($.wakeup.minut+15)-60:($.wakeup.minut+15)}.',
        'Look back at the stretches of time that felt wasted.',
        'At {$.sleep.minut}, take 15 minutes to wind down before bed: meditation, yoga, reading, music, anything you enjoy.',
        'Take 45 to 60 minutes of exercise each day.',
      ][index],
    })),
  },

  welcome_finish: {
    title: 'Everything is ready',
    content:
      'If something in the app does not sit right, tell us. We read all of it and fix it over time.',
  },

  smart_goal: {
    desc: `<p>A goal that is easy to follow usually has five parts, known as SMART</p>
        <ul>
        <li><b>Specific:</b> stated plainly, no ambiguity</li>
        <li><b>Measurable:</b> a number that shows where you are</li>
        <li><b>Achievable:</b> within reach, not impossible</li>
        <li><b>Relevant:</b> genuinely tied to what you care about</li>
        <li><b>Time-bound:</b> a start date and a target date</li>
        </ul>
        `,
  },
};
