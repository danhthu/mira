
export const textString = {
  common: {
    daysOfWeek: [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
    ],
    daysOfWeekShort: [
      'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su',
    ],
    daysOfWeekShort3L: [
      'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su',
    ],
    priority: {
      high: 'High',
      normal: 'Normal',
      low: 'Low',
      label: 'priority'
    },
    work: 'Work',
    doing: 'doing',
    status: 'Status',
    statusText: ['notgood', 'good'],
    habit: 'Habit',
    challenge: 'challenge',
    save: 'Save',
    edit: 'Edit',
    description: 'description',
    color: 'color',
    repeat: 'repeat',
    reminder: 'reminder',
    tool: 'tools',
    newHabit: 'newHabit',
    error: {
      habit_day_greater: ''
    },
    addNew: 'Add new',
    completed: 'Completed',
    basic_info: 'Basic info',
    tabar: {
      'profile': 'Profile',
      'timeTracker': 'TimeTracker',
      'habitTracker': 'Habit',
      'challenge': 'Challenge',
      'home': 'Home'
    },
    delete: 'delete'
  },


  plus: '+',
  repeat: {
    title: 'Repeat',
    subTitle: 'Set a cycle for your plan',
    weekly: 'weekly',
    monthly: 'monthly',
    day: 'day',
    week: 'week',
    month: 'month',
    daily: 'daily',
    repeat: 'Repeat',
    every: 'Every',
    endDay: 'endDay'
  },
  goal: {
    title: 'Goal',
    subTitle: 'Set a goal',
    perday: 'per day'

  },
  reminder: {
    title: 'Reminder',
    subTitle: 'Set a reminder & Stick with it',
    des: 'Reminder me at '
  },
  plan: {
    title: 'Planning to do',
    subTitle: 'Estimated time for the planned task',
    des: 'Doing at '
  },
  tag: {
    title: 'Tag',
    subTitle: 'Customized text input box',
  },
  checkList: {
    title: 'Checklist',
    subTitle: 'A list of things to be checked or done',
  },
  for: (text: string) => text,
  profile_screen: {
    HelpAndFeedback: 'HelpAndFeedback',
    StatusStat: 'StatusStat',
    HabitStat: 'HabitStat',
    TimeStat: 'TimeStat',
    ChallengerStat: 'ChallengerStat',
    ViewAll: 'ViewAll',
    Caption: 'Profile',
    help_center: 'help_center',
    feedback: 'feedback',
    privacy: 'privacy',
    term: 'term',
  },

  welcome_Q: {
    'title': 'Have you ever encountered the following issues?',
    'questions': [
      { 'title': 'Feel that life is complicated and moments of happiness are rather fleeting?', 'answer': true },
      { 'title': 'Often feel pressure or stress?', 'answer': true },
      { 'title': 'Feel like each day, week, or month goes by without accomplishing much?', 'answer': true },
      { 'title': 'Have difficulty establishing good habits to develop yourself?', 'answer': true },
      { 'title': 'Feel overwhelmed or out of control with the amount of daily work you have?', 'answer': true },
      { 'title': 'Had difficulty setting and maintaining personal or professional goals?', 'answer': true }
    ]
  },

  welcome_Recomments: {
    'title': 'Based on your sharing, we suggest the following activies',
    'array': [
      {
        'title': 'Light exercise upon waking up for about 15 minutes to warm up the body.', 'enable': true, id: 1,
        params: { repeat: { kind: 'daily', repeat: 1 }, reminder: {} }
      },
      {
        'title': 'Check and organize tasks for the new day at {$.wakeup.minut+15>60?$.wakeup.hour+1:$.wakeup.hour}: {($.wakeup.minut+15)>=60?($.wakeup.minut+15)-60:($.wakeup.minut+15)}.', 'enable': true, id: 1,
        params: { repeat: { kind: 'weekly', repeat: 1 }, plan: { time: '$.wakeup.minut+15' }, reminder: {} }
      },
      { 'title': 'Evaluate periods where you feel wasted.', 'enable': true, id: 1, params: { repeat: { kind: 'weekly' }, reminder: {} } },
      {
        'title': 'A {$.sleep.minut}, relax 15 minutes before bed: meditation, yoga, reading, listening to music, or any activity you enjoy.', 'enable': true,
        id: 1, params: { repeat: { kind: 'daily', repeat: 1 }, reminder: {} }
      },
      { 'title': 'Schedule 45-60 minutes of exercise every day.', 'enable': true, id: 1, params: { repeat: { kind: 'daily', repeat: 1 }, reminder: {} } }
    ]
  },
  welcome_finish: {
    'title': 'Everything is ready for you!',
    'content': 'If anything falls short of your expectations in the app, please don\'t hesitate to share your experience with us. We are always willing to listen and improve. Wishing you success in every step ahead!'
  },
  smart_goal: {
    'desc': `<p>To create successful goals, we recommend using the SMART method to set your goals</p>
        <ul>
        <li><b>Specific:</b> Well defined, clear, and unambiguous</li>
        <li><b>Measurable:</b> With specific criteria that measure your progress toward the accomplishment of the goal</li>
        <li><b>Achievable:</b> Attainable and not impossible to achieve</li>
        <li><b>Realistic:</b> Within reach, realistic, and relevant to your life purpose</li>
        <li><b>Timely:</b> With a clearly defined timeline, including a starting date and a target date. The purpose is to create urgency.</li>
        </ul>
        `
  }


};