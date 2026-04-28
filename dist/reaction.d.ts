import { MoleculeInstance } from './molecule';
/**
 * Executes a chemical reaction given an array of MoleculeInstances.
 * Returns the provided instances untouched if no reaction criteria are met.
 */
export declare const doReaction: (instances: MoleculeInstance[]) => MoleculeInstance[];
