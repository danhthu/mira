
import { Store } from 'pullstate';

const configStore = new Store({
  TimeCategoryColories: {
    work: 'green', family: 'red', personal: 'blue',
    balance: 'green',
    wasted: 'black'
  },
  theme: 'light',
  lang: 'en',
  habit_day_previous_allow: 5,
  first_install: false,
  first_install_date: 0
});



export { configStore };
