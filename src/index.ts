import { Molecule } from './molecule';
import { doReaction } from './reaction';

// Export everything for the consumer
export { Molecule, doReaction };

export type { Atom, Bond, Angle, FunctionalGroups, MoleculeModel } from './molecule';

import { QUICK_DB } from './quick';

/**
 * Standard pre-loaded molecular data embedded for fast startup.
 */
export const DEFAULT_TO_PARSE = QUICK_DB;


