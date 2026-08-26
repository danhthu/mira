
import * as Entity from './Entities';

import * as Model from './Models';
import * as Repo from './Repositories';
import * as Utitl from './Utils/common';

import * as Hook from './Hooks';

import { debug, error, getLogger, info } from './Utils/getLogger';


import { BORDER_ROUND, FONTSIZE, ICONSIZE, MARGIN, PADDING } from '../../theme/Constraints';


export { debug, error, getLogger, info };

export { Entity, Hook, Model, Repo, Utitl };

export { BORDER_ROUND, FONTSIZE, ICONSIZE, MARGIN, PADDING };

export const Common = { Entity, Repo, Model, Utitl, Hook };


export const debugProps = { style: { borderWidth: 1, borderColor: 'red', flex: 1 } };