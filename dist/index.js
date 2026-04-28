var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const QUICK_DB = [
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
const _Molecule = class _Molecule {
  constructor() {
    __publicField(this, "parsed", false);
    __publicField(this, "fetched", false);
    __publicField(this, "smiles", "");
    __publicField(this, "iupac", "");
    __publicField(this, "formula", "");
    __publicField(this, "semiFormula", "");
    // Metadata
    __publicField(this, "cid", null);
    __publicField(this, "name", "");
    __publicField(this, "molWeight", 0);
    __publicField(this, "link", "");
    __publicField(this, "model");
  }
  /**
   * Canonicalizes SMILES to a standard form.
   * (A complete canonicalizer is complex; here we mock it using string normalization rules).
   */
  static canocSmiles(smiles) {
    return smiles.trim().replace(/\s+/g, "");
  }
  /**
   * Canonicalizes IUPAC naming into a standard molecule representation.
   */
  static canocIUPAC(iupacName) {
    const nameL = iupacName.toLowerCase();
    for (const mol of this.cache.values()) {
      if (mol.iupac.toLowerCase() === nameL || mol.name.toLowerCase() === nameL) {
        return mol;
      }
    }
    return null;
  }
  // --- Async Factories (Cache Aware) ---
  static async fromSmiles(smiles) {
    const canoc = this.canocSmiles(smiles);
    if (this.cache.has(canoc)) return this.cache.get(canoc);
    const mol = new _Molecule();
    mol.smiles = canoc;
    this.cache.set(canoc, mol);
    const results = await mol.fetch();
    return results[0] || mol;
  }
  static async fromIUPAC(iupacName) {
    const existing = this.canocIUPAC(iupacName);
    if (existing) return existing;
    const mol = new _Molecule();
    mol.iupac = iupacName;
    const tempKey = `IUPAC:${iupacName}`;
    this.cache.set(tempKey, mol);
    const results = await mol.fetch();
    this.cache.delete(tempKey);
    return results[0] || mol;
  }
  static async fromName(name) {
    return this.fromPubChemSearch("name", name);
  }
  static async fromFormula(formula) {
    return this.fromPubChemSearch("fastformula", formula);
  }
  static async fromSemiFormula(semiFormula) {
    return this.fromPubChemSearch("fastformula", semiFormula);
  }
  static async fromAny(query) {
    const qStr = String(query);
    if (this.cache.get(qStr)) return [this.cache.get(qStr)];
    let results = await this.fromFormula(query);
    if (results.length > 0) return results;
    results = await this.fromSemiFormula(query);
    if (results.length > 0) return results;
    results = await this.fromName(query);
    if (results.length > 0) return results;
    try {
      const m = await this.fromSmiles(query);
      return [m];
    } catch {
      return [];
    }
  }
  /**
   * Helper to instantiate synchronously for high-speed Reactions.
   * Marks as parsed but NOT fetched.
   */
  static fromSmilesSync(smiles) {
    const canoc = this.canocSmiles(smiles);
    if (this.cache.has(canoc)) return this.cache.get(canoc);
    const mol = new _Molecule();
    mol.smiles = canoc;
    mol.buildModelFromSmiles();
    this.cache.set(canoc, mol);
    return mol;
  }
  // --- PubChem Fetching Logic ---
  static async fromPubChemSearch(domain, query) {
    const queryL = query.toLowerCase();
    const mockMatch = QUICK_DB.find(
      (m) => m.name.toLowerCase() === queryL || m.formula === query || m.fastFormula === query
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
      const results = [];
      for (const prop of data.PropertyTable.Properties) {
        const smiles = prop.CanonicalSMILES || prop.IsomericSMILES || prop.ConnectivitySMILES;
        if (!smiles) continue;
        let mol = this.cache.get(smiles);
        if (!mol) {
          mol = new _Molecule();
          mol.smiles = smiles;
          this.cache.set(smiles, mol);
        }
        mol.cid = prop.CID;
        mol.iupac = prop.IUPACName || mol.iupac;
        mol.molWeight = parseFloat(prop.MolecularWeight) || mol.molWeight;
        mol.link = `https://pubchem.ncbi.nlm.nih.gov/compound/${mol.cid}`;
        mol.fetched = true;
        if (!mol.parsed) mol.buildModelFromSmiles();
        if (domain === "fastformula" && mol.formula !== query) continue;
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
  async fetch() {
    if (this.fetched && this.parsed) return [this];
    let identifier = "";
    let domain = "";
    if (this.cid) {
      identifier = this.cid.toString();
      domain = "cid";
    } else if (this.smiles) {
      identifier = this.smiles;
      domain = "smiles";
    } else if (this.iupac) {
      identifier = this.iupac;
      domain = "name";
    } else if (this.name) {
      identifier = this.name;
      domain = "name";
    } else return [];
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/${domain}/${encodeURIComponent(identifier)}/property/CanonicalSMILES,IUPACName,MolecularWeight,Title/JSON`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const props = data.PropertyTable.Properties[0];
        this.cid = props.CID || this.cid;
        const newSmiles = props.CanonicalSMILES || this.smiles;
        this.iupac = props.IUPACName || this.iupac;
        this.molWeight = parseFloat(props.MolecularWeight) || this.molWeight;
        this.name = props.Title || this.name;
        this.link = `https://pubchem.ncbi.nlm.nih.gov/compound/${this.cid}`;
        if (newSmiles) {
          const normalized = _Molecule.canocSmiles(newSmiles);
          const existing = _Molecule.cache.get(normalized);
          if (existing && existing !== this) {
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
            _Molecule.cache.delete(this.smiles);
            this.smiles = normalized;
            _Molecule.cache.set(this.smiles, this);
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
  buildModelFromSmiles() {
    this.model = {
      atoms: /* @__PURE__ */ new Map(),
      bonds: /* @__PURE__ */ new Map(),
      angles: [],
      groups: {
        alkane: false,
        alkene: false,
        alkyne: false,
        alcohol: false,
        carboxylicAcid: false,
        ester: false,
        ketone: false,
        aldehyde: false,
        amine: false,
        ether: false
      }
    };
    let atomCounter = 0;
    let bondCounter = 0;
    let prevAtomId = -1;
    let bondOrder = 1;
    const stack = [];
    const ringClosures = /* @__PURE__ */ new Map();
    const regex = /(\[[^\]]+\]|Br|Cl|C|N|O|P|S|F|I|B|c|n|o|s|p|\(|\)|[1-9]|=|\#|\.)/g;
    let match;
    let matchedLen = 0;
    while ((match = regex.exec(this.smiles)) !== null) {
      const token = match[0];
      matchedLen += token.length;
      if (token === "=") {
        bondOrder = 2;
        continue;
      } else if (token === "#") {
        bondOrder = 3;
        continue;
      } else if (token === "(") {
        if (prevAtomId !== -1) stack.push(prevAtomId);
        continue;
      } else if (token === ")") {
        if (stack.length > 0) prevAtomId = stack.pop();
        continue;
      } else if (/\d/.test(token)) {
        const ringNum = parseInt(token);
        if (ringClosures.has(ringNum)) {
          const target = ringClosures.get(ringNum);
          this.model.bonds.set(bondCounter++, { id: bondCounter, source: prevAtomId, target, order: bondOrder });
          ringClosures.delete(ringNum);
        } else {
          ringClosures.set(ringNum, prevAtomId);
        }
        bondOrder = 1;
        continue;
      } else if (token === ".") {
        prevAtomId = -1;
        bondOrder = 1;
        continue;
      }
      let element = token;
      let charge = 0;
      let explicitH = -1;
      if (token.startsWith("[")) {
        const inner = token.replace(/[\[\]]/g, "");
        const elemMatch = inner.match(/^[A-Z][a-z]?/);
        element = elemMatch ? elemMatch[0] : "C";
        if (inner.includes("+")) charge = 1;
        if (inner.includes("-")) charge = -1;
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
      const atom = {
        id: atomCounter++,
        element,
        charge,
        aromatic: isAromatic,
        implicitHydrogens: explicitH >= 0 ? explicitH : 0,
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 2
      };
      atom._hasExplicitH = explicitH >= 0;
      this.model.atoms.set(atom.id, atom);
      if (prevAtomId !== -1) {
        const prevAtom = this.model.atoms.get(prevAtomId);
        let actualBondOrder = bondOrder;
        if (isAromatic && (prevAtom == null ? void 0 : prevAtom.aromatic) && bondOrder === 1) {
          actualBondOrder = 1.5;
        }
        this.model.bonds.set(bondCounter++, { id: bondCounter, source: prevAtomId, target: atom.id, order: actualBondOrder });
      }
      prevAtomId = atom.id;
      bondOrder = 1;
    }
    if (ringClosures.size > 0) {
      throw new Error(`Invalid SMILES: Unclosed ring(s) ${Array.from(ringClosures.keys()).join(", ")}`);
    }
    if (matchedLen < this.smiles.length) {
      throw new Error(`SMILES parsing failed at: ${this.smiles.slice(matchedLen)}`);
    }
    this.calculateFormulas();
    this.detectFunctionalGroups();
    this.makeHydrogensExplicit();
    this.calculate3DAngles();
    this.generate3DCoordinates();
    this.parsed = true;
  }
  calculateFormulas() {
    const counts = {};
    for (const atom of this.model.atoms.values()) {
      counts[atom.element] = (counts[atom.element] || 0) + 1;
    }
    const valences = { C: 4, N: 3, O: 2, S: 2, F: 1, Cl: 1, Br: 1, I: 1, Mg: 2, Na: 1, K: 1 };
    const atomicWeights = {
      H: 1.008,
      C: 12.011,
      N: 14.007,
      O: 15.999,
      P: 30.974,
      S: 32.06,
      F: 18.998,
      Cl: 35.45,
      Br: 79.904,
      I: 126.904,
      Na: 22.99,
      Mg: 24.305,
      K: 39.098
    };
    let totalH = counts["H"] || 0;
    for (const atom of this.model.atoms.values()) {
      if (atom.element === "H") continue;
      if (atom._hasExplicitH) {
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
    counts["H"] = totalH;
    let weight = 0;
    for (const [elem, count] of Object.entries(counts)) {
      weight += (atomicWeights[elem] || 0) * count;
    }
    this.molWeight = Math.round(weight * 1e3) / 1e3;
    let f = "";
    if (counts["C"]) {
      f += `C${counts["C"] > 1 ? counts["C"] : ""}`;
      delete counts["C"];
      if (counts["H"]) {
        f += `H${counts["H"] > 1 ? counts["H"] : ""}`;
        delete counts["H"];
      }
    }
    for (const elem of Object.keys(counts).sort()) {
      if (counts[elem] > 0) {
        f += `${elem}${counts[elem] > 1 ? counts[elem] : ""}`;
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
    const visited = /* @__PURE__ */ new Set();
    let startNode = Array.from(this.model.atoms.values()).find((a) => a.element === "C");
    if (!startNode && this.model.atoms.size > 0) startNode = this.model.atoms.values().next().value;
    if (startNode) {
      const dfs = (nodeId) => {
        visited.add(nodeId);
        const atom = this.model.atoms.get(nodeId);
        if (atom.element !== "H") {
          semi += atom.element;
          if (atom.implicitHydrogens > 0) {
            semi += `H${atom.implicitHydrogens > 1 ? atom.implicitHydrogens : ""}`;
          }
        }
        const neighbors = Array.from(this.model.bonds.values()).filter((b) => b.source === nodeId || b.target === nodeId).map((b) => b.source === nodeId ? b.target : b.source);
        for (const n of neighbors) {
          if (!visited.has(n) && this.model.atoms.get(n).element !== "H") {
            dfs(n);
          }
        }
      };
      dfs(startNode.id);
    }
    for (const atom of this.model.atoms.values()) {
      if (!visited.has(atom.id) && atom.element !== "H") {
        semi += atom.element;
        if (atom.implicitHydrogens > 0) semi += `H${atom.implicitHydrogens > 1 ? atom.implicitHydrogens : ""}`;
      }
    }
    this.semiFormula = semi || this.formula;
  }
  detectFunctionalGroups() {
    const { atoms, bonds, groups } = this.model;
    const adj = /* @__PURE__ */ new Map();
    for (const atom of atoms.values()) adj.set(atom.id, []);
    for (const bond of bonds.values()) {
      adj.get(bond.source).push({ target: bond.target, order: bond.order });
      adj.get(bond.target).push({ target: bond.source, order: bond.order });
      if (bond.order === 2) groups.alkene = true;
      if (bond.order === 3) groups.alkyne = true;
    }
    for (const [id, atom] of atoms.entries()) {
      const neighbors = adj.get(id);
      if (atom.element === "C") {
        let singleO = -1;
        let doubleO = -1;
        let singleN = -1;
        for (const n of neighbors) {
          if (atoms.get(n.target).element === "O") {
            if (n.order === 1) singleO = n.target;
            if (n.order === 2) doubleO = n.target;
          }
          if (atoms.get(n.target).element === "N" && n.order === 1) singleN = n.target;
        }
        if (singleO !== -1 && doubleO !== -1) {
          const singleONeighbors = adj.get(singleO);
          let isEster = false;
          for (const on of singleONeighbors) {
            if (on.target !== id && atoms.get(on.target).element === "C") isEster = true;
          }
          if (isEster) groups.ester = true;
          else groups.carboxylicAcid = true;
        } else if (doubleO !== -1) {
          let cNeighbors = 0;
          for (const n of neighbors) if (atoms.get(n.target).element === "C") cNeighbors++;
          if (cNeighbors >= 2) groups.ketone = true;
          else groups.aldehyde = true;
        } else if (singleO !== -1) {
          const singleONeighbors = adj.get(singleO);
          let cCount = 0;
          for (const on of singleONeighbors) if (atoms.get(on.target).element === "C") cCount++;
          if (cCount >= 2) groups.ether = true;
          else groups.alcohol = true;
        }
        if (singleN !== -1) groups.amine = true;
      }
    }
  }
  calculate3DAngles() {
    const groupValence = { C: 4, N: 5, O: 6, S: 6, P: 5, F: 7, Cl: 7, Br: 7, I: 7, H: 1 };
    for (const [centerId, centerAtom] of this.model.atoms.entries()) {
      const connectedBonds = Array.from(this.model.bonds.values()).filter((b) => b.source === centerId || b.target === centerId);
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
      const neighbors = connectedBonds.map((b) => b.source === centerId ? b.target : b.source);
      for (let i = 0; i < neighbors.length; i++) {
        for (let j = i + 1; j < neighbors.length; j++) {
          this.model.angles.push({ atom1: neighbors[i], center: centerId, atom2: neighbors[j], angleDegrees: baseAngle });
        }
      }
    }
  }
  generate3DCoordinates() {
    const ITERATIONS = 250;
    const K_BOND = 0.8;
    const K_REP = 0.6;
    const K_ANGLE = 0.4;
    const REST_LEN = 1.6;
    for (let iter = 0; iter < ITERATIONS; iter++) {
      const forces = /* @__PURE__ */ new Map();
      for (const id of this.model.atoms.keys()) forces.set(id, { x: 0, y: 0, z: 0 });
      const atoms = Array.from(this.model.atoms.values());
      for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
          const a = atoms[i];
          const b = atoms[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dz = a.z - b.z;
          const d2 = dx * dx + dy * dy + dz * dz + 0.01;
          const d = Math.sqrt(d2);
          const f = K_REP / d2;
          const fx = dx / d * f;
          const fy = dy / d * f;
          const fz = dz / d * f;
          const fi = forces.get(a.id);
          fi.x += fx;
          fi.y += fy;
          fi.z += fz;
          const fj = forces.get(b.id);
          fj.x -= fx;
          fj.y -= fy;
          fj.z -= fz;
        }
      }
      for (const bond of this.model.bonds.values()) {
        const a = this.model.atoms.get(bond.source);
        const b = this.model.atoms.get(bond.target);
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dz = b.z - a.z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.01;
        const f = K_BOND * (d - REST_LEN);
        const fx = dx / d * f;
        const fy = dy / d * f;
        const fz = dz / d * f;
        const fi = forces.get(a.id);
        fi.x += fx;
        fi.y += fy;
        fi.z += fz;
        const fj = forces.get(b.id);
        fj.x -= fx;
        fj.y -= fy;
        fj.z -= fz;
      }
      for (const ang of this.model.angles) {
        const center = this.model.atoms.get(ang.center);
        const a1 = this.model.atoms.get(ang.atom1);
        const a2 = this.model.atoms.get(ang.atom2);
        const v1 = { x: a1.x - center.x, y: a1.y - center.y, z: a1.z - center.z };
        const v2 = { x: a2.x - center.x, y: a2.y - center.y, z: a2.z - center.z };
        const d1 = Math.sqrt(v1.x ** 2 + v1.y ** 2 + v1.z ** 2) + 0.01;
        const d2 = Math.sqrt(v2.x ** 2 + v2.y ** 2 + v2.z ** 2) + 0.01;
        const dot = (v1.x * v2.x + v1.y * v2.y + v1.z * v2.z) / (d1 * d2);
        const currentAngle = Math.acos(Math.max(-1, Math.min(1, dot))) * (180 / Math.PI);
        const angleDiff = (ang.angleDegrees - currentAngle) * (Math.PI / 180);
        const f = angleDiff * K_ANGLE;
        const dx = a1.x - a2.x;
        const dy = a1.y - a2.y;
        const dz = a1.z - a2.z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.01;
        const fA1 = forces.get(a1.id);
        fA1.x += dx / d * f;
        fA1.y += dy / d * f;
        fA1.z += dz / d * f;
        const fA2 = forces.get(a2.id);
        fA2.x -= dx / d * f;
        fA2.y -= dy / d * f;
        fA2.z -= dz / d * f;
      }
      const damp = 0.2 * (1 - iter / ITERATIONS);
      for (const [id, f] of forces.entries()) {
        const atom = this.model.atoms.get(id);
        atom.x += f.x * damp;
        atom.y += f.y * damp;
        atom.z += f.z * damp;
      }
    }
    this.centerCoordinates();
  }
  makeHydrogensExplicit() {
    let maxId = Math.max(...Array.from(this.model.atoms.keys()), -1);
    let bondCounter = Math.max(...Array.from(this.model.bonds.keys()), -1) + 1;
    for (const atom of Array.from(this.model.atoms.values())) {
      if (atom.element === "H") continue;
      const numH = atom.implicitHydrogens;
      for (let i = 0; i < numH; i++) {
        const hId = ++maxId;
        const hAtom = {
          id: hId,
          element: "H",
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
      atom.implicitHydrogens = 0;
    }
  }
  centerCoordinates() {
    let cx = 0, cy = 0, cz = 0;
    const count = this.model.atoms.size;
    for (const a of this.model.atoms.values()) {
      cx += a.x;
      cy += a.y;
      cz += a.z;
    }
    cx /= count;
    cy /= count;
    cz /= count;
    for (const a of this.model.atoms.values()) {
      a.x -= cx;
      a.y -= cy;
      a.z -= cz;
    }
  }
  isIsomerOf(other) {
    return this.formula === other.formula && this.name !== other.name;
  }
  clone() {
    const mol = new _Molecule();
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
  toMoleculeData() {
    const symbolToNum = {
      H: 1,
      C: 6,
      N: 7,
      O: 8,
      F: 9,
      P: 15,
      S: 16,
      Cl: 17,
      Br: 35,
      I: 53,
      Na: 11,
      K: 19,
      Mg: 12
    };
    return {
      cid: this.cid || 0,
      name: this.name || this.formula,
      iupac: this.iupac,
      smiles: this.smiles,
      formula: this.formula,
      atoms: Array.from(this.model.atoms.values()).map((a) => ({
        id: a.id,
        element: symbolToNum[a.element] || 6,
        x: a.x,
        y: a.y,
        z: a.z
      })),
      bonds: Array.from(this.model.bonds.values()).map((b) => ({
        atom1: b.source,
        atom2: b.target,
        order: b.order
      })),
      maxEnergy: Math.max(100, (this.model.atoms.size - 1) * 400) + 200
    };
  }
};
// Cache to track all molecules and enforce immutability & reference matching
__publicField(_Molecule, "cache", /* @__PURE__ */ new Map());
let Molecule = _Molecule;
const doReaction = (instances) => {
  if (instances.length === 0) return instances;
  const validInstances = instances.filter((inst) => inst.type && inst.type.parsed);
  if (validInstances.length === 0) return instances;
  const mols = validInstances.map((inst) => inst.type);
  const totalEnergy = validInstances.reduce((sum, inst) => sum + inst.heatEnergy, 0);
  const molA = mols[0];
  const molB = mols[1];
  const wrapProducts = (productMols) => {
    const finalMols = conserveAtoms(mols, productMols);
    const energyPerInstance = totalEnergy / finalMols.length;
    return finalMols.map((m) => ({ type: m, heatEnergy: energyPerInstance }));
  };
  const oxidants = validInstances.filter((inst) => inst.type.formula === "O2" || inst.type.formula === "O");
  const fuels = validInstances.filter(
    (inst) => !oxidants.includes(inst) && Array.from(inst.type.model.atoms.values()).every((a) => ["C", "H", "O"].includes(a.element)) && inst.type.model.atoms.size > 0
  );
  if (fuels.length > 0 && oxidants.length > 0 && totalEnergy > 400) {
    const totalC = fuels.reduce((sum, f) => sum + Array.from(f.type.model.atoms.values()).filter((a) => a.element === "C").length, 0);
    const totalH = fuels.reduce((sum, f) => sum + Array.from(f.type.model.atoms.values()).filter((a) => a.element === "H").length, 0);
    const totalO = instances.reduce((sum, inst) => sum + Array.from(inst.type.model.atoms.values()).filter((a) => a.element === "O").length, 0);
    const products = [];
    let remainingO = totalO;
    const waterToMake = Math.min(totalH / 2, remainingO);
    for (let j = 0; j < Math.floor(waterToMake); j++) products.push(Molecule.fromSmilesSync("O"));
    remainingO -= Math.floor(waterToMake);
    if (remainingO >= totalC * 2) {
      for (let i = 0; i < totalC; i++) products.push(Molecule.fromSmilesSync("O=C=O"));
      remainingO -= totalC * 2;
    } else if (remainingO >= totalC) {
      for (let i = 0; i < totalC; i++) products.push(Molecule.fromSmilesSync("[C-]#[O+]"));
      remainingO -= totalC;
    } else {
      for (let i = 0; i < totalC; i++) products.push(Molecule.fromSmilesSync("[C]"));
    }
    return wrapProducts(products);
  }
  if (mols.length >= 1 && mols.every((m) => m.formula === "H2O") && totalEnergy > 1e3) {
    const h3o = Molecule.fromSmilesSync("[OH3+]");
    const oh = Molecule.fromSmilesSync("[OH-]");
    return wrapProducts([h3o, oh]);
  }
  if (mols.length >= 2) {
    const fA = molA.formula;
    const fB = molB.formula;
    if (fA === "HO" && fB === "H" || fA === "H" && fB === "HO") return wrapProducts([Molecule.fromSmilesSync("O")]);
    if (fA === "H" && fB === "H") return wrapProducts([Molecule.fromSmilesSync("[H][H]")]);
    if (fA === "O" && fB === "O") return wrapProducts([Molecule.fromSmilesSync("O=O")]);
    if (fA === "C" && fB === "O") return wrapProducts([Molecule.fromSmilesSync("[C-]#[O+]")]);
  }
  if (totalEnergy > 800) {
    if (molA.formula === "O2") return wrapProducts([Molecule.fromSmilesSync("[O]"), Molecule.fromSmilesSync("[O]")]);
    if (molA.formula === "H2") return wrapProducts([Molecule.fromSmilesSync("[H]"), Molecule.fromSmilesSync("[H]")]);
    if (molA.model.atoms.size > 5) {
      const atoms = Array.from(molA.model.atoms.values());
      const cAtoms = atoms.filter((a) => a.element === "C");
      if (cAtoms.length >= 2) {
        const splitIdx = Math.floor(cAtoms.length / 2);
        const frag1 = Molecule.fromSmilesSync("C".repeat(splitIdx));
        const frag2 = Molecule.fromSmilesSync("C".repeat(cAtoms.length - splitIdx));
        return wrapProducts([frag1, frag2]);
      }
    }
  }
  if (mols.length === 2) {
    if (molA.model.groups.carboxylicAcid && molB.model.groups.alcohol) return wrapInstances(generateEsterification(molA, molB, totalEnergy));
    if (molB.model.groups.carboxylicAcid && molA.model.groups.alcohol) return wrapInstances(generateEsterification(molB, molA, totalEnergy));
    if (molA.model.groups.ester && molB.formula === "H2O") return wrapInstances(generateHydrolysis(molA, totalEnergy));
    if (molB.model.groups.ester && molA.formula === "H2O") return wrapInstances(generateHydrolysis(molB, totalEnergy));
    const isStrongBase = (m) => m.formula === "NaOH" || m.formula === "KOH";
    if (molA.model.groups.ester && isStrongBase(molB)) return wrapInstances(generateSaponification(molA, molB, totalEnergy));
    if (molB.model.groups.ester && isStrongBase(molA)) return wrapInstances(generateSaponification(molB, molA, totalEnergy));
  }
  return instances;
};
function wrapInstances(map) {
  const results = [];
  for (const [m, e] of map.entries()) {
    results.push({ type: m, heatEnergy: e });
  }
  return results;
}
function generateEsterification(acid, alcohol, energy) {
  const pMap = /* @__PURE__ */ new Map();
  let acidRadical = acid.smiles.replace(/C\(=O\)OH$/, "C(=O)");
  if (acidRadical === acid.smiles) acidRadical = acid.smiles.replace(/\(=O\)O$/, "(=O)");
  if (acidRadical === acid.smiles) acidRadical = acid.smiles.replace("(=O)OH", "(=O)");
  let alcRadical = alcohol.smiles.replace(/O$/, "");
  if (alcRadical === alcohol.smiles) alcRadical = alcohol.smiles.replace("O", "");
  const ester = Molecule.fromSmilesSync(`${acidRadical}O${alcRadical}`);
  const water = Molecule.fromSmilesSync("O");
  const acidName = acid.name.split(" ")[0] || "Unknown";
  const alcName = alcohol.name.includes("anol") ? alcohol.name.replace("anol", "yl") : alcohol.name + "yl";
  ester.name = `${alcName} ${acidName.toLowerCase()}ate`.replace("formicate", "formate").replace("aceticate", "acetate");
  pMap.set(ester, energy / 2);
  pMap.set(water, energy / 2);
  return pMap;
}
function generateHydrolysis(ester, energy) {
  const parts = ester.smiles.split("(=O)O");
  if (parts.length === 2) {
    const pMap = /* @__PURE__ */ new Map();
    pMap.set(Molecule.fromSmilesSync(`${parts[0]}(=O)OH`), energy / 2);
    pMap.set(Molecule.fromSmilesSync(`${parts[1]}O`), energy / 2);
    return pMap;
  }
  return /* @__PURE__ */ new Map();
}
function generateSaponification(ester, base, energy) {
  const parts = ester.smiles.split("(=O)O");
  const cation = base.formula.includes("Na") ? "[Na+]" : "[K+]";
  if (parts.length === 2) {
    const pMap = /* @__PURE__ */ new Map();
    pMap.set(Molecule.fromSmilesSync(`${parts[0]}(=O)[O-].${cation}`), energy / 2);
    pMap.set(Molecule.fromSmilesSync(`${parts[1]}O`), energy / 2);
    return pMap;
  }
  return /* @__PURE__ */ new Map();
}
function conserveAtoms(reactants, coreProducts) {
  const counts = /* @__PURE__ */ new Map();
  const addMoleculeAtoms = (m, multiplier) => {
    const atoms = Array.from(m.model.atoms.values());
    for (const a of atoms) {
      counts.set(a.element, (counts.get(a.element) || 0) + multiplier);
      counts.set("H", (counts.get("H") || 0) + (a.implicitHydrogens * multiplier || 0));
    }
  };
  reactants.forEach((m) => addMoleculeAtoms(m, 1));
  coreProducts.forEach((m) => addMoleculeAtoms(m, -1));
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
const DEFAULT_TO_PARSE = QUICK_DB;
export {
  DEFAULT_TO_PARSE,
  Molecule,
  doReaction
};
