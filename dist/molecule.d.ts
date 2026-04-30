export type ElementSymbol = string;
export interface Atom {
    id: number;
    element: ElementSymbol;
    charge: number;
    aromatic: boolean;
    implicitHydrogens: number;
    x: number;
    y: number;
    z: number;
}
export interface Bond {
    id: number;
    source: number;
    target: number;
    order: number;
    energy?: number;
}
export interface Angle {
    atom1: number;
    center: number;
    atom2: number;
    angleDegrees: number;
}
export interface FunctionalGroups {
    alkane: boolean;
    alkene: boolean;
    alkyne: boolean;
    alcohol: boolean;
    carboxylicAcid: boolean;
    ester: boolean;
    ketone: boolean;
    aldehyde: boolean;
    amine: boolean;
    ether: boolean;
}
export interface MoleculeModel {
    atoms: Map<number, Atom>;
    bonds: Map<number, Bond>;
    angles: Angle[];
    groups: FunctionalGroups;
}
export interface MoleculeInstance {
    type: Molecule;
    heatEnergy: number;
}
/**
 * The Molecule class.
 * Expected to be effectively immutable after parsing/fetching.
 */
export declare class Molecule {
    parsed: boolean;
    fetched: boolean;
    smiles: string;
    iupac: string;
    formula: string;
    semiFormula: string;
    cid: number | null;
    name: string;
    molWeight: number;
    link: string;
    model: MoleculeModel;
    static cache: Map<string, Molecule>;
    private constructor();
    /**
     * Canonicalizes SMILES to a standard form.
     * (A complete canonicalizer is complex; here we mock it using string normalization rules).
     */
    static canocSmiles(smiles: string): string;
    /**
     * Canonicalizes IUPAC naming into a standard molecule representation.
     */
    static canocIUPAC(iupacName: string): Molecule | null;
    static fromSmiles(smiles: string): Promise<Molecule>;
    static fromIUPAC(iupacName: string): Promise<Molecule>;
    static fromName(name: string, signal?: AbortSignal): Promise<Molecule[]>;
    static fromFormula(formula: string, signal?: AbortSignal): Promise<Molecule[]>;
    static fromSemiFormula(semiFormula: string, signal?: AbortSignal): Promise<Molecule[]>;
    static fromAny(query: string | number, signal?: AbortSignal): Promise<Molecule[]>;
    /**
     * Helper to instantiate synchronously for high-speed Reactions.
     * Marks as parsed but NOT fetched.
     */
    static fromSmilesSync(smiles: string): Molecule;
    private static fromPubChemSearch;
    /**
     * Populates all missing data.
     * Uses PubChem to resolve SMILES/IUPAC/Metadata.
     */
    fetch(): Promise<Molecule[]>;
    private buildModelFromSmiles;
    private calculateFormulas;
    private detectFunctionalGroups;
    private calculate3DAngles;
    private generate3DCoordinates;
    private makeHydrogensExplicit;
    private centerCoordinates;
    isIsomerOf(other: Molecule): boolean;
    clone(): Molecule;
    toMoleculeData(): any;
}
