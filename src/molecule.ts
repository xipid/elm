import { QUICK_DB } from './quick';

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
    order: number; // 1 = Single, 2 = Double, 3 = Triple, 1.5 = Aromatic
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
export class Molecule {



    public parsed: boolean = false;
    public fetched: boolean = false;

    public smiles: string = "";
    public iupac: string = "";
    public formula: string = "";
    public semiFormula: string = "";

    // Metadata
    public cid: number | null = null;
    public name: string = "";
    public molWeight: number = 0;
    public link: string = "";

    public model!: MoleculeModel;

    // Cache to track all molecules and enforce immutability & reference matching
    public static cache: Map<string, Molecule> = new Map();

    private constructor() {
        // Private constructor. Use static factories.
    }

    /**
     * Canonicalizes SMILES to a standard form.
     * (A complete canonicalizer is complex; here we mock it using string normalization rules).
     */
    public static canocSmiles(smiles: string): string {
        // Simplified Canonicalization: Uppercase non-aromatic, sort branches (mock implementation)
        return smiles.trim().replace(/\s+/g, "");
    }

    /**
     * Canonicalizes IUPAC naming into a standard molecule representation.
     */
    public static canocIUPAC(iupacName: string): Molecule | null {
        // Searches cache for a matching IUPAC name (case-insensitive)
        const nameL = iupacName.toLowerCase();
        for (const mol of this.cache.values()) {
            if (mol.iupac.toLowerCase() === nameL || mol.name.toLowerCase() === nameL) {
                return mol;
            }
        }
        return null;
    }

    // --- Async Factories (Cache Aware) ---

    public static async fromSmiles(smiles: string): Promise<Molecule> {
        const canoc = this.canocSmiles(smiles);
        if (this.cache.has(canoc)) return this.cache.get(canoc)!;

        const mol = new Molecule();
        mol.smiles = canoc;
        this.cache.set(canoc, mol);
        const results = await mol.fetch();
        return results[0] || mol;
    }

    public static async fromIUPAC(iupacName: string): Promise<Molecule> {
        const existing = this.canocIUPAC(iupacName);
        if (existing) return existing;

        const mol = new Molecule();
        mol.iupac = iupacName;
        // Temporary key until we get SMILES
        const tempKey = `IUPAC:${iupacName}`;
        this.cache.set(tempKey, mol);
        const results = await mol.fetch();
        this.cache.delete(tempKey); // Clean up temp key
        return results[0] || mol;
    }

    public static async fromName(name: string): Promise<Molecule[]> {
        return this.fromPubChemSearch('name', name);
    }

    public static async fromFormula(formula: string): Promise<Molecule[]> {
        return this.fromPubChemSearch('fastformula', formula);
    }

    public static async fromSemiFormula(semiFormula: string): Promise<Molecule[]> {
        return this.fromPubChemSearch('fastformula', semiFormula); // Best approximation for PubChem
    }

    public static async fromAny(query: string | number): Promise<Molecule[]> {
        const qStr = String(query);
        // Try Cache first
        if (this.cache.get(qStr)) return [this.cache.get(qStr)!];

        // 1. Try Formula/Semi-Formula search FIRST (especially if it looks like a formula)
        // This addresses user request to prioritize formulas before falling back to SMILES.
        let results = await this.fromFormula(qStr);
        if (results.length > 0) return results;

        results = await this.fromSemiFormula(qStr);
        if (results.length > 0) return results;

        // 2. Try Name search
        results = await this.fromName(qStr);
        if (results.length > 0) return results;

        // 3. Fallback: try to construct directly if it looks like SMILES
        // Only do this if it's NOT a suspicious formula string that failed above
        try {
            const m = await this.fromSmiles(qStr);
            return [m];
        } catch {
            return [];
        }
    }

    /**
     * Helper to instantiate synchronously for high-speed Reactions.
     * Marks as parsed but NOT fetched.
     */
    public static fromSmilesSync(smiles: string): Molecule {
        const canoc = this.canocSmiles(smiles);
        if (this.cache.has(canoc)) return this.cache.get(canoc)!;

        const mol = new Molecule();
        mol.smiles = canoc;
        mol.buildModelFromSmiles(); // Instantly builds internal graph
        this.cache.set(canoc, mol);
        return mol;
    }

    // --- PubChem Fetching Logic ---

    private static async fromPubChemSearch(domain: string, query: string): Promise<Molecule[]> {

        const queryL = query.toLowerCase();
        const mockMatch = QUICK_DB.find(m => 
            m.name.toLowerCase() === queryL || 
            m.formula === query || 
            m.fastFormula === query
        );

        if (mockMatch) {
            const m = await this.fromSmiles(mockMatch.smiles);
            m.name = mockMatch.name;
            m.cid = mockMatch.cid || m.cid;
            m.iupac = mockMatch.iupac || m.iupac;
            m.formula = mockMatch.formula || m.formula;
            m.molWeight = mockMatch.molWeight || m.molWeight;
            m.fetched = true;
            return [m];
        }

        const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/${domain}/${encodeURIComponent(query)}/property/CanonicalSMILES,IsomericSMILES,ConnectivitySMILES,IUPACName,MolecularWeight/JSON`;
        try {
            const res = await fetch(url);
            if (!res.ok) return [];
            const data = await res.json();
            const results: Molecule[] = [];

            for (const prop of data.PropertyTable.Properties) {
                const smiles = prop.CanonicalSMILES || prop.IsomericSMILES || prop.ConnectivitySMILES;
                if (!smiles) continue;

                let mol = this.cache.get(smiles);
                if (!mol) {
                    mol = new Molecule();
                    mol.smiles = smiles;
                    this.cache.set(smiles, mol);
                }

                // Update properties from PubChem
                mol.cid = prop.CID;
                mol.iupac = prop.IUPACName || mol.iupac;
                mol.molWeight = parseFloat(prop.MolecularWeight) || mol.molWeight;
                mol.link = `https://pubchem.ncbi.nlm.nih.gov/compound/${mol.cid}`;
                mol.fetched = true; // Mark as fetched to prevent recursion

                if (!mol.parsed) mol.buildModelFromSmiles();
                
                // If it's a formula search, ensure the formula actually matches
                if (domain === 'fastformula' && mol.formula !== query) continue;
                
                results.push(mol);
            }
            return results;
        } catch (e) {
            return [];
        }
    }

    /**
     * Populates all missing data. 
     * Uses PubChem to resolve SMILES/IUPAC/Metadata.
     */
    public async fetch(): Promise<Molecule[]> {
        if (this.fetched && this.parsed) return [this];

        let identifier = "";
        let domain = "";

        if (this.cid) { identifier = this.cid.toString(); domain = 'cid'; }
        else if (this.smiles) { identifier = this.smiles; domain = 'smiles'; }
        else if (this.iupac) { identifier = this.iupac; domain = 'name'; }
        else if (this.name) { identifier = this.name; domain = 'name'; }
        else return []; // Not enough data to fetch

        const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/${domain}/${encodeURIComponent(identifier)}/property/CanonicalSMILES,IUPACName,MolecularWeight,Title/JSON`;

        try {
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                const props = data.PropertyTable.Properties[0];

                // Update Local Instance
                this.cid = props.CID || this.cid;
                const newSmiles = props.CanonicalSMILES || this.smiles;
                this.iupac = props.IUPACName || this.iupac;
                this.molWeight = parseFloat(props.MolecularWeight) || this.molWeight;
                this.name = props.Title || this.name;
                this.link = `https://pubchem.ncbi.nlm.nih.gov/compound/${this.cid}`;

                // Handle Cache key updates & Intelligent Deduping
                if (newSmiles) {
                    const normalized = Molecule.canocSmiles(newSmiles);
                    const existing = Molecule.cache.get(normalized);
                    if (existing && existing !== this) {
                        // MERGE: Transfer data to existing instance and return it
                        existing.cid = existing.cid || this.cid;
                        existing.iupac = existing.iupac || this.iupac;
                        existing.name = existing.name || this.name;
                        existing.molWeight = existing.molWeight || this.molWeight;
                        existing.fetched = true;
                        
                        this.smiles = normalized;
                        this.model = existing.model;
                        this.formula = existing.formula;
                        this.parsed = true;
                        return [existing];
                    }

                    if (normalized !== this.smiles) {
                        Molecule.cache.delete(this.smiles);
                        this.smiles = normalized;
                        Molecule.cache.set(this.smiles, this);
                    }
                }
                this.fetched = true;
            }
        } catch (error) {
            console.warn(`Fetch failed for ${identifier}`, error);
        }

        if (!this.parsed && this.smiles) {
            this.buildModelFromSmiles();
        }

        return [this];
    }


    // --- Local Chemical Graph Modeling Engine ---

    private buildModelFromSmiles() {
        this.model = {
            atoms: new Map(),
            bonds: new Map(),
            angles: [],
            groups: {
                alkane: false, alkene: false, alkyne: false, alcohol: false,
                carboxylicAcid: false, ester: false, ketone: false, aldehyde: false, amine: false, ether: false
            }
        };

        let atomCounter = 0;
        let bondCounter = 0;
        let prevAtomId = -1;
        let bondOrder = 1;
        const stack: number[] = [];
        const ringClosures = new Map<number, number>();

        const regex = /(\[[^\]]+\]|Br|Cl|C|N|O|P|S|F|I|B|c|n|o|s|p|\(|\)|[1-9]|=|\#|\.)/g;
        let match;
        let matchedLen = 0;

        while ((match = regex.exec(this.smiles)) !== null) {
            const token = match[0];
            matchedLen += token.length;

            if (token === '=') {
                bondOrder = 2;
                continue;
            } else if (token === '#') {
                bondOrder = 3;
                continue;
            } else if (token === '(') {
                if (prevAtomId !== -1) stack.push(prevAtomId);
                continue;
            } else if (token === ')') {
                if (stack.length > 0) prevAtomId = stack.pop()!;
                continue;
            } else if (/\d/.test(token)) {
                const ringNum = parseInt(token);
                if (ringClosures.has(ringNum)) {
                    const target = ringClosures.get(ringNum)!;
                    this.model.bonds.set(bondCounter++, { id: bondCounter, source: prevAtomId, target, order: bondOrder });
                    ringClosures.delete(ringNum);
                } else {
                    ringClosures.set(ringNum, prevAtomId);
                }
                bondOrder = 1; 
                continue;
            } else if (token === '.') {
                prevAtomId = -1;
                bondOrder = 1;
                continue;
            }

            // Parse Atom
            let element = token;
            let charge = 0;
            let explicitH = -1;

            if (token.startsWith('[')) {
                const inner = token.replace(/[\[\]]/g, '');
                const elemMatch = inner.match(/^[A-Z][a-z]?/);
                element = elemMatch ? elemMatch[0] : 'C';
                if (inner.includes('+')) charge = 1;
                if (inner.includes('-')) charge = -1;
                
                const rest = inner.slice(element.length);
                const hMatch = rest.match(/H(\d*)/);
                if (hMatch) {
                    explicitH = hMatch[1] ? parseInt(hMatch[1]) : 1;
                } else {
                    explicitH = 0; 
                }
            }

            const isAromatic = token === token.toLowerCase() && token.length === 1 && /[cnosp]/.test(token);
            if (isAromatic) element = element.toUpperCase();

            const atom: Atom = {
                id: atomCounter++,
                element,
                charge,
                aromatic: isAromatic,
                implicitHydrogens: explicitH >= 0 ? explicitH : 0,
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2,
                z: (Math.random() - 0.5) * 2
            };
            (atom as any)._hasExplicitH = explicitH >= 0;

            this.model.atoms.set(atom.id, atom);

            if (prevAtomId !== -1) {
                const prevAtom = this.model.atoms.get(prevAtomId);
                let actualBondOrder = bondOrder;
                if (isAromatic && prevAtom?.aromatic && bondOrder === 1) {
                    actualBondOrder = 1.5;
                }
                this.model.bonds.set(bondCounter++, { id: bondCounter, source: prevAtomId, target: atom.id, order: actualBondOrder });
            }
            prevAtomId = atom.id;
            bondOrder = 1; 
        }

        // --- Ring Closure Validation ---
        if (ringClosures.size > 0) {
            throw new Error(`Invalid SMILES: Unclosed ring(s) ${Array.from(ringClosures.keys()).join(", ")}`);
        }

        // --- VALIDATION ---
        if (matchedLen < this.smiles.length) {
            throw new Error(`SMILES parsing failed at: ${this.smiles.slice(matchedLen)}`);
        }

        this.calculateFormulas();
        this.detectFunctionalGroups();
        this.makeHydrogensExplicit(); // New: Convert implicit to explicit
        this.calculate3DAngles();
        this.generate3DCoordinates();
        this.parsed = true;
    }

    private calculateFormulas() {
        const counts: Record<string, number> = {};
        for (const atom of this.model.atoms.values()) {
            counts[atom.element] = (counts[atom.element] || 0) + 1;
        }

        const valences: Record<string, number> = { C: 4, N: 3, O: 2, S: 2, F: 1, Cl: 1, Br: 1, I: 1, Mg: 2, Na: 1, K: 1 };
        const atomicWeights: Record<string, number> = { 
            H: 1.008, C: 12.011, N: 14.007, O: 15.999, P: 30.974, S: 32.06, 
            F: 18.998, Cl: 35.45, Br: 79.904, I: 126.904, Na: 22.99, Mg: 24.305, K: 39.098 
        };

        let totalH = counts['H'] || 0;

        for (const atom of this.model.atoms.values()) {
            if (atom.element === 'H') continue;
            
            if ((atom as any)._hasExplicitH) {
                totalH += atom.implicitHydrogens;
                continue;
            }

            let currentValence = 0;
            for (const bond of this.model.bonds.values()) {
                if (bond.source === atom.id || bond.target === atom.id) currentValence += bond.order;
            }
            const expectedValence = valences[atom.element] || 0;
            const hNeeded = Math.max(0, Math.round(expectedValence - currentValence - Math.abs(atom.charge)));
            atom.implicitHydrogens = hNeeded;
            totalH += hNeeded;
        }
        counts['H'] = totalH;

        // Calculate Molecular Weight
        let weight = 0;
        for (const [elem, count] of Object.entries(counts)) {
            weight += (atomicWeights[elem] || 0) * count;
        }
        this.molWeight = Math.round(weight * 1000) / 1000;

        let f = "";
        if (counts['C']) {
            f += `C${counts['C'] > 1 ? counts['C'] : ''}`;
            delete counts['C'];
            if (counts['H']) {
                f += `H${counts['H'] > 1 ? counts['H'] : ''}`;
                delete counts['H'];
            }
        }
        for (const elem of Object.keys(counts).sort()) {
            if (counts[elem] > 0) {
                f += `${elem}${counts[elem] > 1 ? counts[elem] : ''}`;
            }
        }
        if (f === "H2O") f = "H2O"; 
        if (f === "O2") f = "O2";
        if (f === "H2") f = "H2";
        if (f === "H3N") f = "NH3"; 
        if (f === "HO") f = "OH";   

        if (f === "HNaO") f = "NaOH";
        if (f === "HKO") f = "KOH";
        if (f === "ClH") f = "HCl";
        this.formula = f;

        let semi = "";
        const visited = new Set<number>();
        let startNode = Array.from(this.model.atoms.values()).find(a => a.element === 'C');
        if (!startNode && this.model.atoms.size > 0) startNode = this.model.atoms.values().next().value;

        if (startNode) {
            const dfs = (nodeId: number) => {
                visited.add(nodeId);
                const atom = this.model.atoms.get(nodeId)!;
                if (atom.element !== 'H') {
                    semi += atom.element;
                    if (atom.implicitHydrogens > 0) {
                        semi += `H${atom.implicitHydrogens > 1 ? atom.implicitHydrogens : ''}`;
                    }
                }
                const neighbors = Array.from(this.model.bonds.values())
                    .filter(b => b.source === nodeId || b.target === nodeId)
                    .map(b => b.source === nodeId ? b.target : b.source);

                for (const n of neighbors) {
                    if (!visited.has(n) && this.model.atoms.get(n)!.element !== 'H') {
                        dfs(n);
                    }
                }
            };
            dfs(startNode.id);
        }

        for (const atom of this.model.atoms.values()) {
            if (!visited.has(atom.id) && atom.element !== 'H') {
                semi += atom.element;
                if (atom.implicitHydrogens > 0) semi += `H${atom.implicitHydrogens > 1 ? atom.implicitHydrogens : ''}`;
            }
        }
        this.semiFormula = semi || this.formula;
    }

    private detectFunctionalGroups() {
        const { atoms, bonds, groups } = this.model;
        const adj = new Map<number, { target: number, order: number }[]>();
        for (const atom of atoms.values()) adj.set(atom.id, []);
        for (const bond of bonds.values()) {
            adj.get(bond.source)!.push({ target: bond.target, order: bond.order });
            adj.get(bond.target)!.push({ target: bond.source, order: bond.order });
            if (bond.order === 2) groups.alkene = true;
            if (bond.order === 3) groups.alkyne = true;
        }

        for (const [id, atom] of atoms.entries()) {
            const neighbors = adj.get(id)!;
            if (atom.element === 'C') {
                let singleO = -1;
                let doubleO = -1;
                let singleN = -1;
                for (const n of neighbors) {
                    if (atoms.get(n.target)!.element === 'O') {
                        if (n.order === 1) singleO = n.target;
                        if (n.order === 2) doubleO = n.target;
                    }
                    if (atoms.get(n.target)!.element === 'N' && n.order === 1) singleN = n.target;
                }
                if (singleO !== -1 && doubleO !== -1) {
                    const singleONeighbors = adj.get(singleO)!;
                    let isEster = false;
                    for (const on of singleONeighbors) {
                        if (on.target !== id && atoms.get(on.target)!.element === 'C') isEster = true;
                    }
                    if (isEster) groups.ester = true;
                    else groups.carboxylicAcid = true;
                } else if (doubleO !== -1) {
                    let cNeighbors = 0;
                    for (const n of neighbors) if (atoms.get(n.target)!.element === 'C') cNeighbors++;
                    if (cNeighbors >= 2) groups.ketone = true;
                    else groups.aldehyde = true;
                } else if (singleO !== -1) {
                    const singleONeighbors = adj.get(singleO)!;
                    let cCount = 0;
                    for (const on of singleONeighbors) if (atoms.get(on.target)!.element === 'C') cCount++;
                    if (cCount >= 2) groups.ether = true;
                    else groups.alcohol = true;
                }
                if (singleN !== -1) groups.amine = true;
            }
        }
    }

    private calculate3DAngles() {
        const groupValence: Record<string, number> = { C: 4, N: 5, O: 6, S: 6, P: 5, F: 7, Cl: 7, Br: 7, I: 7, H: 1 };
        for (const [centerId, centerAtom] of this.model.atoms.entries()) {
            const connectedBonds = Array.from(this.model.bonds.values()).filter(b => b.source === centerId || b.target === centerId);
            if (connectedBonds.length < 2) continue;
            let bondElectrons = 0;
            for (const b of connectedBonds) bondElectrons += b.order;
            const totalBondedAtoms = connectedBonds.length + centerAtom.implicitHydrogens;
            bondElectrons += centerAtom.implicitHydrogens;
            const valenceE = groupValence[centerAtom.element] || 0;
            const remainingE = valenceE - bondElectrons - centerAtom.charge;
            const lonePairs = Math.max(0, Math.floor(remainingE / 2));
            const stericNumber = totalBondedAtoms + lonePairs;
            let baseAngle = 109.5;
            if (centerAtom.aromatic) baseAngle = 120;
            else if (stericNumber <= 2) baseAngle = 180;
            else if (stericNumber === 3) baseAngle = 120;
            else if (stericNumber === 4) {
                baseAngle = 109.5;
                if (lonePairs === 1) baseAngle = 107.3;
                if (lonePairs === 2) baseAngle = 104.5;
            }
            const neighbors = connectedBonds.map(b => b.source === centerId ? b.target : b.source);
            for (let i = 0; i < neighbors.length; i++) {
                for (let j = i + 1; j < neighbors.length; j++) {
                    this.model.angles.push({ atom1: neighbors[i], center: centerId, atom2: neighbors[j], angleDegrees: baseAngle });
                }
            }
        }
    }

    private generate3DCoordinates() {
        const ITERATIONS = 250;
        const K_BOND = 0.8; const K_REP = 0.6; const K_ANGLE = 0.4; const REST_LEN = 1.6;
        for (let iter = 0; iter < ITERATIONS; iter++) {
            const forces = new Map<number, { x: number, y: number, z: number }>();
            for (const id of this.model.atoms.keys()) forces.set(id, { x: 0, y: 0, z: 0 });
            const atoms = Array.from(this.model.atoms.values());
            for (let i = 0; i < atoms.length; i++) {
                for (let j = i + 1; j < atoms.length; j++) {
                    const a = atoms[i]; const b = atoms[j];
                    const dx = a.x - b.x; const dy = a.y - b.y; const dz = a.z - b.z;
                    const d2 = dx * dx + dy * dy + dz * dz + 0.01; const d = Math.sqrt(d2);
                    const f = K_REP / d2;
                    const fx = (dx / d) * f; const fy = (dy / d) * f; const fz = (dz / d) * f;
                    const fi = forces.get(a.id)!; fi.x += fx; fi.y += fy; fi.z += fz;
                    const fj = forces.get(b.id)!; fj.x -= fx; fj.y -= fy; fj.z -= fz;
                }
            }
            for (const bond of this.model.bonds.values()) {
                const a = this.model.atoms.get(bond.source)!; const b = this.model.atoms.get(bond.target)!;
                const dx = b.x - a.x; const dy = b.y - a.y; const dz = b.z - a.z;
                const d = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.01;
                const f = K_BOND * (d - REST_LEN);
                const fx = (dx / d) * f; const fy = (dy / d) * f; const fz = (dz / d) * f;
                const fi = forces.get(a.id)!; fi.x += fx; fi.y += fy; fi.z += fz;
                const fj = forces.get(b.id)!; fj.x -= fx; fj.y -= fy; fj.z -= fz;
            }
            for (const ang of this.model.angles) {
                const center = this.model.atoms.get(ang.center)!;
                const a1 = this.model.atoms.get(ang.atom1)!; const a2 = this.model.atoms.get(ang.atom2)!;
                const v1 = { x: a1.x - center.x, y: a1.y - center.y, z: a1.z - center.z };
                const v2 = { x: a2.x - center.x, y: a2.y - center.y, z: a2.z - center.z };
                const d1 = Math.sqrt(v1.x**2 + v1.y**2 + v1.z**2) + 0.01;
                const d2 = Math.sqrt(v2.x**2 + v2.y**2 + v2.z**2) + 0.01;
                const dot = (v1.x * v2.x + v1.y * v2.y + v1.z * v2.z) / (d1 * d2);
                const currentAngle = Math.acos(Math.max(-1, Math.min(1, dot))) * (180 / Math.PI);
                const angleDiff = (ang.angleDegrees - currentAngle) * (Math.PI / 180);
                const f = angleDiff * K_ANGLE;
                const dx = a1.x - a2.x; const dy = a1.y - a2.y; const dz = a1.z - a2.z;
                const d = Math.sqrt(dx*dx + dy*dy + dz*dz) + 0.01;
                const fA1 = forces.get(a1.id)!; fA1.x += (dx/d) * f; fA1.y += (dy/d) * f; fA1.z += (dz/d) * f;
                const fA2 = forces.get(a2.id)!; fA2.x -= (dx/d) * f; fA2.y -= (dy/d) * f; fA2.z -= (dz/d) * f;
            }
            const damp = 0.2 * (1 - iter / ITERATIONS);
            for (const [id, f] of forces.entries()) {
                const atom = this.model.atoms.get(id)!;
                atom.x += f.x * damp; atom.y += f.y * damp; atom.z += f.z * damp;
            }
        }
        this.centerCoordinates();
    }

    private makeHydrogensExplicit() {
        let maxId = Math.max(...Array.from(this.model.atoms.keys()), -1);
        let bondCounter = Math.max(...Array.from(this.model.bonds.keys()), -1) + 1;

        for (const atom of Array.from(this.model.atoms.values())) {
            if (atom.element === 'H') continue;
            
            const numH = atom.implicitHydrogens;
            for (let i = 0; i < numH; i++) {
                const hId = ++maxId;
                const hAtom: Atom = {
                    id: hId,
                    element: 'H',
                    charge: 0,
                    aromatic: false,
                    implicitHydrogens: 0,
                    x: atom.x + (Math.random() - 0.5) * 0.5,
                    y: atom.y + (Math.random() - 0.5) * 0.5,
                    z: atom.z + (Math.random() - 0.5) * 0.5
                };
                this.model.atoms.set(hId, hAtom);
                this.model.bonds.set(bondCounter++, { id: bondCounter, source: atom.id, target: hId, order: 1 });
            }
            atom.implicitHydrogens = 0; // successfully made explicit
        }
    }

    private centerCoordinates() {
        let cx = 0, cy = 0, cz = 0;
        const count = this.model.atoms.size;
        for (const a of this.model.atoms.values()) { cx += a.x; cy += a.y; cz += a.z; }
        cx /= count; cy /= count; cz /= count;
        for (const a of this.model.atoms.values()) { a.x -= cx; a.y -= cy; a.z -= cz; }
    }

    public isIsomerOf(other: Molecule): boolean {
        return this.formula === other.formula && this.name !== other.name;
    }

    public clone(): Molecule {
        const mol = new Molecule();
        mol.smiles = this.smiles;
        mol.iupac = this.iupac;
        mol.formula = this.formula;
        mol.semiFormula = this.semiFormula;
        mol.cid = this.cid;
        mol.name = this.name;
        mol.molWeight = this.molWeight;
        mol.link = this.link;
        mol.model = this.model; 
        mol.parsed = true;
        mol.fetched = this.fetched;
        return mol;
    }

    public toMoleculeData(): any {
        const symbolToNum: Record<string, number> = {
            H: 1, C: 6, N: 7, O: 8, F: 9, P: 15, S: 16, Cl: 17, Br: 35, I: 53, Na: 11, K: 19, Mg: 12
        };
        return {
            cid: this.cid || 0,
            name: this.name || this.formula,
            iupac: this.iupac,
            smiles: this.smiles,
            formula: this.formula,
            atoms: Array.from(this.model.atoms.values()).map(a => ({
                id: a.id, element: symbolToNum[a.element] || 6,
                x: a.x, y: a.y, z: a.z
            })),
            bonds: Array.from(this.model.bonds.values()).map(b => ({
                atom1: b.source, atom2: b.target, order: b.order
            })),
            maxEnergy: Math.max(100, (this.model.atoms.size - 1) * 400) + 200
        };
    }
}