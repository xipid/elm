// quick.ts

export interface QuickMolecule {
    name: string;
    formula: string;
    fastFormula: string;
    smiles: string;
    cid?: number;
    iupac?: string;
    molWeight?: number;
}

export const QUICK_DB: QuickMolecule[] = [
    {
        name: "Aspirin",
        formula: "C9H8O4",
        fastFormula: "C9H8O4",
        smiles: "CC(=O)Oc1ccccc1C(=O)O",
        cid: 2244,
        iupac: "2-acetyloxybenzoic acid",
        molWeight: 180.158
    },
    {
        name: "Caffeine",
        formula: "C8H10N4O2",
        fastFormula: "C8H10N4O2",
        smiles: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
        cid: 2519,
        iupac: "1,3,7-trimethylpurine-2,6-dione",
        molWeight: 194.19
    },
    {
        name: "Glucose",
        formula: "C6H12O6",
        fastFormula: "C6H12O6",
        smiles: "C(C1C(C(C(C(O1)O)O)O)O)O",
        cid: 5793,
        iupac: "D-glucopyranose",
        molWeight: 180.156
    },
    {
        name: "propane-1,2,3-triol",
        formula: "C3H8O3",
        fastFormula: "C3H8O3",
        smiles: "C(C(CO)O)O",
        cid: 753,
        iupac: "propane-1,2,3-triol",
        molWeight: 92.09
    },
    {
        name: "Acetic Acid",
        formula: "C2H4O2",
        fastFormula: "C2H4O2",
        smiles: "CC(=O)O",
        cid: 176,
        iupac: "acetic acid",
        molWeight: 60.05
    },
    {
        name: "Sodium Hydroxide",
        formula: "NaOH",
        fastFormula: "NaOH",
        smiles: "[Na+].[OH-]",
        cid: 14798,
        iupac: "sodium hydroxide",
        molWeight: 39.997
    },
    {
        name: "Methane",
        formula: "CH4",
        fastFormula: "CH4",
        smiles: "C",
        cid: 6324,
        iupac: "methane",
        molWeight: 16.04
    },
    {
        name: "Water",
        formula: "H2O",
        fastFormula: "H2O",
        smiles: "O",
        cid: 962,
        iupac: "oxidane",
        molWeight: 18.015
    },
    {
        name: "Carbon Monoxide",
        formula: "CO",
        fastFormula: "CO",
        smiles: "[C-]#[O+]",
        cid: 281,
        iupac: "carbon monoxide",
        molWeight: 28.01
    },
    {
        name: "Hydrogen Gas",
        formula: "H2",
        fastFormula: "H2",
        smiles: "[H][H]",
        cid: 783,
        iupac: "molecular hydrogen",
        molWeight: 2.016
    },
    {
        name: "Oxygen Gas",
        formula: "O2",
        fastFormula: "O2",
        smiles: "O=O",
        cid: 977,
        iupac: "molecular oxygen",
        molWeight: 31.999
    },
    {
        name: "Carbon Dioxide",
        formula: "CO2",
        fastFormula: "CO2",
        smiles: "O=C=O",
        cid: 280,
        iupac: "carbon dioxide",
        molWeight: 44.01
    },
    {
        name: "Acetone",
        formula: "C3H6O",
        fastFormula: "C3H6O",
        smiles: "CC(=O)C",
        cid: 180,
        iupac: "propan-2-one",
        molWeight: 58.08
    },
    {
        name: "Formic Acid",
        formula: "CH2O2",
        fastFormula: "CH2O2",
        smiles: "C(=O)O",
        cid: 284,
        iupac: "formic acid",
        molWeight: 46.03
    },
    {
        name: "Hydrochloric Acid",
        formula: "HCl",
        fastFormula: "HCl",
        smiles: "Cl",
        cid: 313,
        iupac: "chlorane",
        molWeight: 36.46
    },
    {
        name: "Magnesium",
        formula: "Mg",
        fastFormula: "Mg",
        smiles: "[Mg]",
        cid: 5462224,
        iupac: "magnesium",
        molWeight: 24.305
    },
    {
        name: "Ethanol",
        formula: "C2H6O",
        fastFormula: "C2H6O",
        smiles: "CCO",
        cid: 702,
        iupac: "ethanol",
        molWeight: 46.07
    },
    {
        name: "Propane",
        formula: "C3H8",
        fastFormula: "C3H8",
        smiles: "CCC",
        cid: 6334,
        iupac: "propane",
        molWeight: 44.1
    },
    {
        name: "Butane",
        formula: "C4H10",
        fastFormula: "C4H10",
        smiles: "CCCC",
        cid: 7843,
        iupac: "butane",
        molWeight: 58.12
    },
    {
        name: "Ammonia",
        formula: "NH3",
        fastFormula: "NH3",
        smiles: "N",
        cid: 222,
        iupac: "azane",
        molWeight: 17.031
    },
    {
        name: "Decanol",
        formula: "C10H22O",
        fastFormula: "C10H22O",
        smiles: "CCCCCCCCCC O",
        cid: 8174,
        iupac: "decan-1-ol",
        molWeight: 158.28
    },
    {
        name: "Decyl Formate",
        formula: "C11H22O2",
        fastFormula: "C11H22O2",
        smiles: "CCCCCCCCCC OC=O",
        cid: 21200,
        iupac: "decyl formate",
        molWeight: 186.29
    }
];
