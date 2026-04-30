// reaction.ts
import { Molecule, MoleculeInstance } from './molecule';

/**
 * Executes a chemical reaction given an array of MoleculeInstances.
 * Returns the provided instances untouched if no reaction criteria are met.
 */
export const doReaction = (instances: MoleculeInstance[]): MoleculeInstance[] => {
    if (instances.length === 0) return instances;

    // Ensure all molecules are parsed
    const validInstances = instances.filter(inst => inst.type && inst.type.parsed);
    if (validInstances.length === 0) return instances;

    const mols = validInstances.map(inst => inst.type);
    const totalEnergy = validInstances.reduce((sum, inst) => sum + inst.heatEnergy, 0);

    const molA = mols[0];
    const molB = mols[1];

    /**
     * Helper to wrap products into instances and redistribute energy.
     */
    const wrapProducts = (productMols: Molecule[]): MoleculeInstance[] => {
        const finalMols = conserveAtoms(mols, productMols);
        finalMols.forEach(m => nameMolecule(m));
        const energyPerInstance = totalEnergy / finalMols.length;
        return finalMols.map(m => ({ type: m, heatEnergy: energyPerInstance }));
    };

    // --- REACTION HEURISTICS ---

    // 1. GAS-PHASE OXIDATION / COMBUSTION (Generalized for hydrocarbons)
    const oxidants = validInstances.filter(inst => inst.type.formula === 'O2' || inst.type.formula === 'O');
    const fuels = validInstances.filter(inst => !oxidants.includes(inst) && 
        Array.from(inst.type.model.atoms.values()).every(a => ['C', 'H', 'O'].includes(a.element)) &&
        inst.type.model.atoms.size > 0 &&
        inst.type.formula !== 'H2O' // Water is not a fuel
    );

    if (fuels.length > 0 && oxidants.length > 0 && totalEnergy > 50) {
        // Collect all atoms from fuels and oxidants
        const totalC = fuels.reduce((sum, f) => sum + Array.from(f.type.model.atoms.values()).filter(a => a.element === 'C').length, 0);
        const totalH = fuels.reduce((sum, f) => sum + Array.from(f.type.model.atoms.values()).filter(a => a.element === 'H').length, 0);
        const totalO = instances.reduce((sum, inst) => sum + Array.from(inst.type.model.atoms.values()).filter(a => a.element === 'O').length, 0);

        // Budgeting:
        // Complete combustion: C + O2 -> CO2, 2H + 0.5O2 -> H2O
        // 1C needs 2O, 1H needs 0.5O
        const oNeededForComplete = totalC * 2 + totalH * 0.5;
        
        const products: Molecule[] = [];
        let remainingO = totalO;

        // Produce Water first (high affinity)
        const waterToMake = Math.min(totalH / 2, remainingO);
        for(let j=0; j<Math.floor(waterToMake); j++) {
            const m = Molecule.fromSmilesSync('O');
            m.name = "Water";
            products.push(m);
        }
        remainingO -= Math.floor(waterToMake);

        // Produce Carbon oxides
        if (remainingO >= totalC * 2) {
            // Complete combustion to CO2
            for(let i=0; i<totalC; i++) {
                const m = Molecule.fromSmilesSync('O=C=O');
                m.name = "Carbon dioxide";
                products.push(m);
            }
            remainingO -= totalC * 2;
        } else if (remainingO >= totalC) {
            // Incomplete combustion to CO
            for(let i=0; i<totalC; i++) {
                const m = Molecule.fromSmilesSync('[C-]#[O+]');
                m.name = "Carbon monoxide";
                products.push(m);
            }
            remainingO -= totalC;
        } else {
            // Very oxygen poor -> Soot (Solid Carbon)
            for(let i=0; i<totalC; i++) {
                const m = Molecule.fromSmilesSync('[C]');
                m.name = "Soot";
                products.push(m);
            }
            // remainingO stays as is or forms CO with whatever is left
        }

        return wrapProducts(products);
    }

    // 2. AUTO-IONIZATION OF WATER (2H2O <-> H3O+ + OH-)
    if (mols.length >= 1 && mols.every(m => m.formula === 'H2O') && totalEnergy > 150) {
        const h3o = Molecule.fromSmilesSync('[OH3+]');
        h3o.name = "Hydronium";
        const oh = Molecule.fromSmilesSync('[OH-]');
        oh.name = "Hydroxide";
        return wrapProducts([h3o, oh]);
    }

    // 2b. DEIONIZATION (H3O+ + OH- -> 2H2O)
    if (mols.length === 2 && 
        ((molA.smiles === '[OH3+]' && molB.smiles === '[OH-]') || 
         (molA.smiles === '[OH-]' && molB.smiles === '[OH3+]'))) {
        return wrapProducts([Molecule.fromSmilesSync('O'), Molecule.fromSmilesSync('O')]);
    }

    // 3. RECOMBINATION (e.g. H + OH -> H2O)
    if (mols.length >= 2) {
        const fA = molA.formula;
        const fB = molB.formula;
        if ((fA === 'HO' && fB === 'H') || (fA === 'H' && fB === 'HO')) return wrapProducts([Molecule.fromSmilesSync('O')]);
        if (fA === 'H' && fB === 'H') return wrapProducts([Molecule.fromSmilesSync('[H][H]')]);
        if (fA === 'O' && fB === 'O') return wrapProducts([Molecule.fromSmilesSync('O=O')]);
        if (fA === 'C' && fB === 'O') return wrapProducts([Molecule.fromSmilesSync('[C-]#[O+]')]);
        if (fA === 'C' && fB === 'O2') return wrapProducts([Molecule.fromSmilesSync('O=C=O')]);
        
        // Recombination to Peroxide (H + O2 -> HO2 or 2OH -> H2O2)
        if (fA === 'OH' && fB === 'OH') return wrapProducts([Molecule.fromSmilesSync('OO')]);
    }

    // 4. COMPLEX TWO-MOLECULE REACTIONS
    if (mols.length === 2) {
        // Esterification
        if (molA.model.groups.carboxylicAcid && molB.model.groups.alcohol) return wrapInstances(generateEsterification(molA, molB, totalEnergy));
        if (molB.model.groups.carboxylicAcid && molA.model.groups.alcohol) return wrapInstances(generateEsterification(molB, molA, totalEnergy));

        // Hydrolysis
        if (molA.model.groups.ester && molB.formula === 'H2O') return wrapInstances(generateHydrolysis(molA, totalEnergy));
        if (molB.model.groups.ester && molA.formula === 'H2O') return wrapInstances(generateHydrolysis(molB, totalEnergy));

        // Saponification
        const isStrongBase = (m: Molecule) => m.formula === 'NaOH' || m.formula === 'KOH';
        if (molA.model.groups.ester && isStrongBase(molB)) return wrapInstances(generateSaponification(molA, molB, totalEnergy));
        if (molB.model.groups.ester && isStrongBase(molA)) return wrapInstances(generateSaponification(molB, molA, totalEnergy));
    }

    // 5. THERMAL CRACKING / DISSOCIATION
    if (totalEnergy > 100) {
        if (molA.formula === 'O2') return wrapProducts([Molecule.fromSmilesSync('[O]'), Molecule.fromSmilesSync('[O]')]);
        if (molA.formula === 'H2') return wrapProducts([Molecule.fromSmilesSync('[H]'), Molecule.fromSmilesSync('[H]')]);
        if (molA.formula === 'H2O2') return wrapProducts([Molecule.fromSmilesSync('[OH]'), Molecule.fromSmilesSync('[OH]')]);
        
        // Large Hydrocarbon Cracking / Reduction (recursive step-down)
        if (molA.model.atoms.size > 3) {
            const atoms = Array.from(molA.model.atoms.values());
            const cAtoms = atoms.filter(a => a.element === 'C');
            if (cAtoms.length >= 2) {
                // Break into two smaller pieces (simplistic split)
                const splitIdx = Math.floor(cAtoms.length / 2);
                const frag1 = Molecule.fromSmilesSync('C'.repeat(splitIdx));
                const frag2 = Molecule.fromSmilesSync('C'.repeat(cAtoms.length - splitIdx));
                return wrapProducts([frag1, frag2]);
            }
        }
    }

    return instances;
};

// --- Helper Functions ---

/**
 * Converts Map<Molecule, number> to MoleculeInstance[]
 */
function wrapInstances(map: Map<Molecule, number>): MoleculeInstance[] {
    const results: MoleculeInstance[] = [];
    for (const [m, e] of map.entries()) {
        nameMolecule(m);
        results.push({ type: m, heatEnergy: e });
    }
    return results;
}

function nameMolecule(m: Molecule) {
    if (m.name) return;
    const s = m.smiles;
    if (s === 'O') m.name = "Water";
    else if (s === 'O=C=O') m.name = "Carbon dioxide";
    else if (s === '[C-]#[O+]') m.name = "Carbon monoxide";
    else if (s === '[C]') m.name = "Soot";
    else if (s === '[OH3+]') m.name = "Hydronium";
    else if (s === '[OH-]') m.name = "Hydroxide";
    else if (s === 'O=O') m.name = "Oxygen gas";
    else if (s === '[H][H]') m.name = "Hydrogen gas";
    else if (s === 'OO') m.name = "Hydrogen peroxide";
    else if (s === 'CO') m.name = "Methanol";
    else if (s === 'CCO') m.name = "Ethanol";
    else if (s === 'CCCO') m.name = "Propanol";
    else if (s === 'CC(=O)O') m.name = "Acetic acid";
    else if (s === 'CCC(=O)O') m.name = "Propanoic acid";
    else if (s === 'C(=O)O') m.name = "Formic acid";
}

function generateEsterification(acid: Molecule, alcohol: Molecule, energy: number): Map<Molecule, number> {
    const pMap = new Map<Molecule, number>();
    
    // Safely remove terminal OH from acid and alcohol, preserving branches elsewhere
    // We use a more robust regex to capture the parts while preserving order
    const acidMatch = acid.smiles.match(/^(.*)C\(=O\)O$/) || acid.smiles.match(/^(.*)C\(=O\)$/);
    const acidRadical = acidMatch ? acidMatch[1] + 'C(=O)' : acid.smiles.replace('(=O)O', '(=O)');
    
    const alcMatch = alcohol.smiles.match(/^(.*)O$/);
    const alcRadical = alcMatch ? alcMatch[1] : alcohol.smiles.replace(/O$/, '');
    
    const ester = Molecule.fromSmilesSync(`${acidRadical}O${alcRadical}`);
    const water = Molecule.fromSmilesSync('O');
    
    // Name inference
    const acidName = acid.name.split(' ')[0] || 'Unknown';
    const alcName = (alcohol.name.includes('anol') ? alcohol.name.replace('anol', 'yl') : alcohol.name + 'yl');
    let esterName = `${alcName} ${acidName.toLowerCase()}ate`
        .replace('formicate', 'formate')
        .replace('aceticate', 'acetate')
        .replace('propanoicate', 'propanoate')
        .replace('butanoicate', 'butanoate');
    ester.name = esterName.charAt(0).toUpperCase() + esterName.slice(1);
    
    pMap.set(ester, energy / 2);
    pMap.set(water, energy / 2);
    return pMap;
}

function generateHydrolysis(ester: Molecule, energy: number): Map<Molecule, number> {
    // Preserving order: split at the ester linkage 'C(=O)O'
    const match = ester.smiles.match(/^(.*C\(=O\))O(.*)$/);
    if (match) {
        const pMap = new Map<Molecule, number>();
        pMap.set(Molecule.fromSmilesSync(`${match[1]}O`), energy / 2);
        pMap.set(Molecule.fromSmilesSync(`${match[2]}O`), energy / 2);
        return pMap;
    }
    return new Map();
}

function generateSaponification(ester: Molecule, base: Molecule, energy: number): Map<Molecule, number> {
    const parts = ester.smiles.split('(=O)O');
    const cation = base.formula.includes('Na') ? '[Na+]' : '[K+]';
    if (parts.length === 2) {
        const pMap = new Map<Molecule, number>();
        pMap.set(Molecule.fromSmilesSync(`${parts[0]}(=O)[O-].${cation}`), energy / 2);
        pMap.set(Molecule.fromSmilesSync(`${parts[1]}O`), energy / 2);
        return pMap;
    }
    return new Map();
}

/**
 * Enforces mass/atom conservation.
 */
function conserveAtoms(reactants: Molecule[], coreProducts: Molecule[]): Molecule[] {
    const counts = new Map<string, number>();
    
    const addMoleculeAtoms = (m: Molecule, multiplier: number) => {
        const atoms = Array.from(m.model.atoms.values());
        for (const a of atoms) {
            counts.set(a.element, (counts.get(a.element) || 0) + multiplier);
            counts.set('H', (counts.get('H') || 0) + ((a as any).implicitHydrogens * multiplier || 0));
        }
    };
    reactants.forEach(m => addMoleculeAtoms(m, 1));
    coreProducts.forEach(m => addMoleculeAtoms(m, -1));

    const finalProducts = [...coreProducts];
    for (const [element, count] of counts.entries()) {
        const roundedCount = Math.round(count);
        if (roundedCount > 0) {
            for (let i = 0; i < roundedCount; i++) {
                finalProducts.push(Molecule.fromSmilesSync(`[${element}]`));
            }
        }
    }
    return finalProducts;
}