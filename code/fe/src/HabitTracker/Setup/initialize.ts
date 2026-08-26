import iconifyAssets from "../Assets/iconifyAssets";
import { HabitTemplate, habitTemplateRepository } from "../Entities";

export async function initialize() {
    await createHabitTemplates();
}

const createHabitTemplates = async () => {
    const habitColors = [
        '#F5D96E',
        '#DFD9F9',
        '#C5D8FB',
        '#F5BCDD',
        '#CCDE92',
        '#DFD9F9',
    ];
    const iconList = Object.keys(iconifyAssets);
    const collections = [{
        name: 'Relationship',
        icon: 'relationship'
    }, {
        name: 'Negative',
        icon: 'negative'
    }, {
        name: 'Beauty',
        icon: 'beauty'
    }, {
        name: 'Personal finance',
        icon: 'personalfinance',
    },
    {
        name: 'Nutrition',
        icon: 'nutrition',
    },
    {
        name: 'Stress relief',
        icon: 'stressrelief',
    },
    {
        name: 'Hapiness',
        icon: 'hapiness',
    },
    {
        name: 'Anxiety',
        icon: 'anxiety',
    },
    ];

    const groups = [{
        name: 'Miracle morning',
        desc: 'Early morning time is precious',
        icon: 'morning'
    }, {
        name: 'Clean my home',
        desc: 'Bring some traquility back to yourself',
        icon: 'clean-home'
    }, {
        name: 'Better sleep',
        desc: 'Sleep will influence your physical and mental health state.',
        icon: 'better-sleep'
    }, {
        name: 'Body care',
        desc: 'The foundation of your well-being',
        icon: 'body-care'
    }, {
        name: 'Learn and explore',
        desc: 'Stay hungry of knowledge',
        icon: 'learn-explore'
    }, {
        name: 'Exercise',
        desc: 'Be strong and energetic',
        icon: 'exercise'
    },];

    for (let i = 0; i < 50; i++) {
        habitTemplateRepository.add({
            ...new HabitTemplate(),
            name: 'Templates : ' + i,
            description: 'Generated template sample...',
            group: groups[(i % groups.length)].name,
            group_desc: groups[(i % groups.length)].desc,
            group_icon: groups[(i % groups.length)].icon,
            collection: collections[i % collections.length].name,
            collection_icon: collections[i % collections.length].icon,
            color: habitColors[Math.floor(Math.random() * (habitColors.length))],
            icon: iconList[i % iconList.length],
        });
    }
};
