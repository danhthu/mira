import iconifyAssets from './iconifyAssets';

export const AssetManagement = {
  ...iconifyAssets,
  card: require('./card.jpg'),
  cat_default: require('./cat_default.png'),
  habit_default: require('./habit_default.png'),

  no_habit_tracker: require('./no_habit_tracker.png'),
  no_habit: require('./no_habit.png'),
  work: require('./work.jpg'),
  empty: require('./work.jpg'),
  relationship: require('./collections/relationship.png'),
  beauty: require('./collections/beauty.png'),
  hapiness: require('./collections/happiness.png'),
  anxiety: require('./collections/anxiety.png'),
  negative: require('./collections/negative.png'),
  nutrition: require('./collections/nutrition.png'),
  personalfinance: require('./collections/personalfinance.png'),
  stressrelief: require('./collections/stressrelief.png'),
  popular: require('./collections/popular.png'),

  //group
  'morning': require('./groups/morning.png'),
  'clean-home': require('./groups/clean-home.png'),

  'better-sleep': require('./groups/better-sleep.png'),
  'body-care': require('./groups/body-care.png'),
  'learn-explore': require('./groups/learn-explore.png'),
  'exercite': require('./groups/exercite.png'),

};
export async function findAssets(name, def) {
  //check
  //nêu ko có thì load online
  return AssetManagement[name] || def;
}