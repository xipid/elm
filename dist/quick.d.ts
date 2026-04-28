export interface QuickMolecule {
    name: string;
    formula: string;
    fastFormula: string;
    smiles: string;
    cid?: number;
    iupac?: string;
    molWeight?: number;
}
export declare const QUICK_DB: QuickMolecule[];
