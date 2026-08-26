import { BRepeatComponent } from "./BRepeatComponent";
import { BReminder } from "./BReminder";
import { BButton ,RighButtonSave,RighButtonAdd,RighButtonEdit,ButtonActionSheet} from "./BButton";
import { BTextBox } from "./BTextBox";

import { ImageIconSets } from "./BImageIConSet";
import { BImageIConSet } from "./BImageIConSet";
import { BTag } from "./BTag";
import { BCheckList } from "./BChecklist";
import { BGoalComponent } from "./BGoal";
import { BImageIConDisplay } from "./BImageIConSet";
import { BCircularSlider } from "./BCircularSlider";
import { BHashTag } from "./BHashtag";
import { BPlan } from "./BPlan";
import { BPriority } from "./BPriority";
import { BContext } from "./BContext";
import { BTimeLine } from "./TimeLine";
import { TextBold } from './TextBold'
import { BText,BHtml } from "./BText";
import { BICon } from "./BIcon";
import { BColor } from "./BColor";
import { BInputText,CircleImage ,CheckBox} from "./Input";
import * as Styles  from './Styles'
import { BSection } from "./BSection";
export {BHtml, BButton,CircleImage,RighButtonSave,RighButtonEdit,RighButtonAdd,ButtonActionSheet, BReminder, BRepeatComponent, BTextBox, BICon, ImageIconSets, BImageIConSet, BTag, TextBold, BText,BInputText,Styles }



export const B = {
    Section:BSection,
    Text:BText,
    Html:BHtml,
    CircleImage:CircleImage,
    TextBox: BInputText,
    CheckBox:CheckBox,
    RighButtonSave,
    RighButtonAdd,
    Button: BButton,
    RighButtonEdit,
    ButtonActionSheet,
    Reminder: BReminder,
    Repeater: BRepeatComponent,
    Tag: BTag,
    Goal: BGoalComponent,
    CheckList: BCheckList,
    Awatar: BImageIConDisplay,
    ImageFor: BImageIConDisplay,
    CircularSlider: BCircularSlider,
    Plan: BPlan,
    HashTag: BHashTag,
    Priority: BPriority,
    Context: BContext,
    Timeline: BTimeLine,
    Color:BColor,


    ICon: BICon,
    IConSet: ImageIconSets,
    AssetICon: BImageIConSet,
}


