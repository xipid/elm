import { Molecule } from './molecule';
import { doReaction } from './reaction';
export { Molecule, doReaction };
export type { Atom, Bond, Angle, FunctionalGroups, MoleculeModel } from './molecule';
/**
 * Standard pre-loaded molecular data embedded for fast startup.
 */
export declare const DEFAULT_TO_PARSE: import('./quick').QuickMolecule[];
