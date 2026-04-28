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
        const energyPerInstance = totalEnergy / finalMols.length;
        return finalMols.map(m => ({ type: m, heatEnergy: energyPerInstance }));
    };

    // --- REACTION HEURISTICS ---

    // 1. GAS-PHASE OXIDATION / COMBUSTION (Generalized for hydrocarbons)
    const oxidants = validInstances.filter(inst => inst.type.formula === 'O2' || inst.type.formula === 'O');
    const fuels = validInstances.filter(inst => !oxidants.includes(inst) && 
        Array.from(inst.type.model.atoms.values()).every(a => ['C', 'H', 'O'].includes(a.element)) &&
        inst.type.model.atoms.size > 0
    );

    if (fuels.length > 0 && oxidants.length > 0 && totalEnergy > 400) {
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
        for(let j=0; j<Math.floor(waterToMake); j++) products.push(Molecule.fromSmilesSync('O'));
        remainingO -= Math.floor(waterToMake);

        // Produce Carbon oxides
        if (remainingO >= totalC * 2) {
            // Complete combustion to CO2
            for(let i=0; i<totalC; i++) products.push(Molecule.fromSmilesSync('O=C=O'));
            remainingO -= totalC * 2;
        } else if (remainingO >= totalC) {
            // Incomplete combustion to CO
            for(let i=0; i<totalC; i++) products.push(Molecule.fromSmilesSync('[C-]#[O+]'));
            remainingO -= totalC;
        } else {
            // Very oxygen poor -> Soot (Solid Carbon)
            for(let i=0; i<totalC; i++) products.push(Molecule.fromSmilesSync('[C]'));
            // remainingO stays as is or forms CO with whatever is left
        }

        return wrapProducts(products);
    }

    // 2. AUTO-IONIZATION OF WATER (2H2O <-> H3O+ + OH-)
    if (mols.length >= 1 && mols.every(m => m.formula === 'H2O') && totalEnergy > 1000) {
        const h3o = Molecule.fromSmilesSync('[OH3+]');
        const oh = Molecule.fromSmilesSync('[OH-]');
        return wrapProducts([h3o, oh]);
    }

    // 3. RECOMBINATION (e.g. H + OH -> H2O)
    if (mols.length >= 2) {
        const fA = molA.formula;
        const fB = molB.formula;
        if ((fA === 'HO' && fB === 'H') || (fA === 'H' && fB === 'HO')) return wrapProducts([Molecule.fromSmilesSync('O')]);
        if (fA === 'H' && fB === 'H') return wrapProducts([Molecule.fromSmilesSync('[H][H]')]);
        if (fA === 'O' && fB === 'O') return wrapProducts([Molecule.fromSmilesSync('O=O')]);
        if (fA === 'C' && fB === 'O') return wrapProducts([Molecule.fromSmilesSync('[C-]#[O+]')]);
    }

    // 4. THERMAL CRACKING / DISSOCIATION
    if (totalEnergy > 800) {
        if (molA.formula === 'O2') return wrapProducts([Molecule.fromSmilesSync('[O]'), Molecule.fromSmilesSync('[O]')]);
        if (molA.formula === 'H2') return wrapProducts([Molecule.fromSmilesSync('[H]'), Molecule.fromSmilesSync('[H]')]);
        
        // Large Hydrocarbon Cracking (recursive step-down)
        if (molA.model.atoms.size > 5) {
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

    // --- COMPLEX TWO-MOLECULE REACTIONS ---
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

    return instances;
};

// --- Helper Functions ---

/**
 * Converts Map<Molecule, number> to MoleculeInstance[]
 */
function wrapInstances(map: Map<Molecule, number>): MoleculeInstance[] {
    const results: MoleculeInstance[] = [];
    for (const [m, e] of map.entries()) {
        results.push({ type: m, heatEnergy: e });
    }
    return results;
}

function generateEsterification(acid: Molecule, alcohol: Molecule, energy: number): Map<Molecule, number> {
    const pMap = new Map<Molecule, number>();
    
    // Safely remove terminal OH from acid and alcohol, preserving branches elsewhere
    let acidRadical = acid.smiles.replace(/C\(=O\)OH$/, 'C(=O)');
    if (acidRadical === acid.smiles) acidRadical = acid.smiles.replace(/\(=O\)O$/, '(=O)'); // Fallback
    if (acidRadical === acid.smiles) acidRadical = acid.smiles.replace('(=O)OH', '(=O)'); 
    
    let alcRadical = alcohol.smiles.replace(/O$/, '');
    if (alcRadical === alcohol.smiles) alcRadical = alcohol.smiles.replace('O', ''); // Fallback
    
    const ester = Molecule.fromSmilesSync(`${acidRadical}O${alcRadical}`);
    const water = Molecule.fromSmilesSync('O');
    
    // Name inference
    const acidName = acid.name.split(' ')[0] || 'Unknown';
    const alcName = (alcohol.name.includes('anol') ? alcohol.name.replace('anol', 'yl') : alcohol.name + 'yl');
    ester.name = `${alcName} ${acidName.toLowerCase()}ate`.replace('formicate', 'formate').replace('aceticate', 'acetate');
    
    pMap.set(ester, energy / 2);
    pMap.set(water, energy / 2);
    return pMap;
}

function generateHydrolysis(ester: Molecule, energy: number): Map<Molecule, number> {
    const parts = ester.smiles.split('(=O)O');
    if (parts.length === 2) {
        const pMap = new Map<Molecule, number>();
        pMap.set(Molecule.fromSmilesSync(`${parts[0]}(=O)OH`), energy / 2);
        pMap.set(Molecule.fromSmilesSync(`${parts[1]}O`), energy / 2);
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