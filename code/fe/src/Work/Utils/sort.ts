import { sortBy } from "sort-by-typescript";
import { Work } from "../Entities";
const map = {
    'CREATED': 0,
    'PLAN': 3,
    'DOING': 1,
    'PAUSE': 2,
    'DONE': 4
};
export const workSort = (data: Work[]) => {
    return data.map(d => ({ ...d, _sortByStatus: map[d.status] })).sort(sortBy('_sortByStatus', '-modified_date'));

};