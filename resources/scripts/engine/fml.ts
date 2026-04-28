// fml.ts

import type { MoleculeData, AtomData, BondData } from './molecules'

/**
 * FML (Formula Molecule Library)
 * World-Class SMILES/IUPAC Parser and 3D Generator
 */

export const ATOM_VALENCY: Record<number, number> = {
  1: 1, 6: 4, 7: 3, 8: 2, 9: 1, 15: 5, 16: 6, 17: 1, 35: 1, 53: 1
}

const SYMBOL_TO_NUM: Record<string, number> = {
  H: 1, C: 6, N: 7, O: 8, F: 9, P: 15, S: 16, Cl: 17, Br: 35, I: 53, Na: 11, K: 19, Mg: 12
}

export const NUM_TO_SYMBOL: Record<number, string> = Object.fromEntries(
  Object.entries(SYMBOL_TO_NUM).map(([k, v]) => [v, k])
)

const NAME_TO_NUM: Record<string, number> = {
  meth: 1, eth: 2, prop: 3, but: 4, pent: 5, hex: 6, hept: 7, oct: 8, non: 9, dec: 10,
  undec: 11, dodec: 12, icos: 20
}

export function generateFromFormula(input: string): MoleculeData | null {
  const cleanInput = input.trim()

  // 0. Handle single atoms directly (O, H, C, etc.)
  // This prevents them from being auto-saturated into molecules
  if (/^[A-Z][a-z]?$/.test(cleanInput)) {
    const elNum = SYMBOL_TO_NUM[cleanInput]
    if (elNum) {
      const b = new MolBuilder(cleanInput)
      b.addAtom(elNum, 0, 0, 0)
      return b.getResult(cleanInput) // No saturation
    }
  }

  // 1. Try SMILES (contains brackets, =, #, or numbers for rings)
  if (/^[A-Za-z0-9@#\=\-\(\)\[\]\+\.\/\\]+$/.test(cleanInput) && cleanInput.match(/[=\(\)\[\]#1-9]/)) {
    const smilesMol = parseSmiles(cleanInput)
    if (smilesMol) return smilesMol
  }

  // 2. Try Advanced IUPAC Name
  const nameMol = parseName(cleanInput.toLowerCase())
  if (nameMol) return nameMol

  // 3. Try Chemical Formula / Common names
  return parseFormulaToMolecule(cleanInput)
}

// ── SMILES PARSER ──

export function parseSmiles(smiles: string, name: string = smiles): MoleculeData | null {
  const b = new MolBuilder(name)
  // Robust regex supporting brackets, halogens, common organics, and rings
  const regex = /([\[][^\]]+[\]]|Br|Cl|I|F|O|N|C|P|S|H|c|n|o|p|s|\(|\)|[1-9]|%[0-9]{2}|=|#|\.)/g

  let match
  let currentAtom = -1
  const branchStack: number[] = []
  const rings: Record<string, number> = {}
  let nextBondOrder = 1

  while ((match = regex.exec(smiles)) !== null) {
    let token = match[0]

    if (token === '(') {
      if (currentAtom !== -1) branchStack.push(currentAtom)
    } else if (token === ')') {
      if (branchStack.length > 0) currentAtom = branchStack.pop()!
    } else if (token === '=') {
      nextBondOrder = 2
    } else if (token === '#') {
      nextBondOrder = 3
    } else if (token === '.') {
      currentAtom = -1 // Disconnected part
    } else if (!isNaN(parseInt(token.replace('%', '')))) {
      // Ring closure
      const ringId = token.replace('%', '')
      if (rings[ringId] !== undefined) {
        b.addBond(currentAtom, rings[ringId], nextBondOrder)
        delete rings[ringId]
        nextBondOrder = 1
      } else {
        rings[ringId] = currentAtom
      }
    } else {
      // Atom token (extract from brackets if present)
      let elementStr = token.match(/[A-Za-z]+/)?.[0] || 'C'
      elementStr = elementStr.charAt(0).toUpperCase() + elementStr.slice(1).toLowerCase()
      const elNum = SYMBOL_TO_NUM[elementStr] || 6

      const id = b.addAtom(elNum, Math.random() * 2, Math.random() * 2, Math.random() * 2)

      if (currentAtom !== -1) {
        b.addBond(currentAtom, id, nextBondOrder)
        nextBondOrder = 1
      }
      currentAtom = id
    }
  }

  // Only auto-saturate if we didn't explicitly use brackets for everything
  if (!smiles.includes('[')) {
    b.saturate()
  }

  b.relaxCoordinates()
  b.centerCoordinates()
  return b.getResult(toFormula(b.atoms))
}

// ── IUPAC PARSER ──

function parseName(nameOriginal: string): MoleculeData | null {
  let name = nameOriginal.toLowerCase().replace(/\s+/g, '')

  // 1. Condensations & Esters (Recursive parsing)
  // e.g. "ethyl acetate", "2-methylpropyl 3-methylbutanoate"
  const esterMatch = nameOriginal.toLowerCase().match(/^([\w,\s-]+)yl\s+([\w,\s-]+)oate$/)
  if (esterMatch) {
    const alcName = esterMatch[1].replace(/\s+/g, '') + 'yl'
    const acidName = esterMatch[2].replace(/\s+/g, '') + 'ane' // Trick parser to build acid backbone
    const alcMol = parseName(alcName)
    const acidMol = parseName(acidName)
    if (alcMol && acidMol) {
      // Stitch: Acid gets (=O) and connects to Alc via O
      const acidSmiles = acidMol.formula.replace(/C$/, 'C(=O)') // Naive string replace for ester gen
      const alcSmiles = alcMol.formula
      return parseSmiles(`${acidSmiles}O${alcSmiles}`, nameOriginal)
    }
  }

  // 2. Identify Backbone
  const backboneRegex = /(meth|eth|prop|but|pent|hex|hept|oct|non|dec|undec|dodec|icos)(ane|ene|yne|anol|al|one|oicacid|amine|yl|oate)/g
  let n = 0
  let mainChainEnd = 0
  let suffixType = 'ane'
  let match
  while ((match = backboneRegex.exec(name)) !== null) {
      n = NAME_TO_NUM[match[1]]
      suffixType = match[2]
      mainChainEnd = match.index
  }
  if (n === 0) return null

  const backbone = Array.from({ length: n }, () => ({ branches: [] as string[] }))

  // Helper to attach group
  const attach = (pos: number, smiles: string) => {
    let p = pos - 1
    if (p < 0 || p >= n) p = 0 // Default to pos 1 if invalid
    backbone[p].branches.push(`(${smiles})`)
  }

  // 3. Suffix positions (e.g. pentan-2-one or 2-pentanone)
  const mainPrefix = name.slice(0, mainChainEnd)
  const posRegex = /([\d,]+)[-]*$/
  const posMatch = mainPrefix.match(posRegex)
  let mainPos = 1
  if (posMatch) {
    mainPos = parseInt(posMatch[1].split(',')[0])
  } else {
    // maybe like 2-methyl-3-pentanone
    const allNums = name.match(/\d+/g)
    if (allNums && allNums.length > 0) mainPos = parseInt(allNums[allNums.length - 1])
  }

  // Assign Main Functional Suffix
  if (suffixType === 'oicacid') backbone[n-1].branches.push('(=O)OH')
  else if (suffixType === 'al') backbone[n-1].branches.push('=O')
  else if (suffixType === 'one') {
      let p = mainPos - 1
      if (p < 0 || p >= n) p = Math.floor(n/2)
      backbone[p].branches.push('=O')
  }
  else if (suffixType === 'anol' || name.includes('alcohol')) {
      let p = mainPos - 1
      if (p < 0 || p >= n) p = n - 1 // Default primary
      backbone[p].branches.push('O')
  }
  else if (suffixType === 'amine') backbone[n-1].branches.push('N')

  // 4. Prefix Substituents (methyl, ethyl, fluoro, chloro...)
  // Match forms like "2,2-dimethyl", "3-ethyl"
  const prefixRegex = /([\d,]+)-?(di|tri|tetra|penta)?(methyl|ethyl|propyl|butyl|fluoro|chloro|bromo|iodo|hydroxy|amino)/gi
  let pm
  while ((pm = prefixRegex.exec(nameOriginal)) !== null) {
    const positions = pm[1].split(',').map(Number)
    const sub = pm[3].toLowerCase()
    
    let subSmiles = 'C'
    if (sub === 'methyl') subSmiles = 'C'
    else if (sub === 'ethyl') subSmiles = 'CC'
    else if (sub === 'propyl') subSmiles = 'CCC'
    else if (sub === 'butyl') subSmiles = 'CCCC'
    else if (sub === 'fluoro') subSmiles = 'F'
    else if (sub === 'chloro') subSmiles = 'Cl'
    else if (sub === 'bromo') subSmiles = 'Br'
    else if (sub === 'iodo') subSmiles = 'I'
    else if (sub === 'hydroxy') subSmiles = 'O'
    else if (sub === 'amino') subSmiles = 'N'

    for (const pos of positions) {
      attach(pos, subSmiles)
    }
  }

  // 5. Build SMILES string
  let smiles = ''
  for (let i = 0; i < n; i++) {
    smiles += 'C'
    backbone[i].branches.forEach(b => smiles += b)
  }

  // Apply ene/yne globally (simplification without exact pos)
  if (suffixType.includes('ene')) smiles = smiles.replace('CC', 'C=C')
  if (suffixType.includes('yne')) smiles = smiles.replace('CC', 'C#C')

  return parseSmiles(smiles, nameOriginal)
}

function prefixToNum(prefix: string): number | null {
  for (const [key, val] of Object.entries(NAME_TO_NUM)) {
    if (prefix.startsWith(key)) return val
  }
  return null
}

function parseFormulaToMolecule(formula: string): MoleculeData | null {
  const counts = new Map<string, number>()
  // Case-insensitive regex that handles atoms and numbers
  const regex = /([A-Z][a-z]?|[a-z]+)(\d*)/gi
  let match
  while ((match = regex.exec(formula)) !== null) {
    let sym = match[1]
    // Normalize case: H2o -> H2O
    sym = sym.charAt(0).toUpperCase() + sym.slice(1).toLowerCase()
    const count = match[2] === '' ? 1 : parseInt(match[2])
    counts.set(sym, (counts.get(sym) ?? 0) + count)
  }

  const nC = counts.get('C') ?? 0; const nH = counts.get('H') ?? 0
  const nO = counts.get('O') ?? 0; const nN = counts.get('N') ?? 0

  const upper = formula.toUpperCase()

  // 1. Standard inorganic overrides (Check these before any procedural guessing)
  if (upper === 'H2O' || upper === 'WATER') return buildSMILESMolecule('O', 'water')
  if (upper === 'O2' || upper === 'OXYGEN') return buildSMILESMolecule('O=O', 'molecular oxygen')
  if (upper === 'H2' || upper === 'HYDROGEN') return buildSMILESMolecule('[H][H]', 'molecular hydrogen')
  if (upper === 'N2' || upper === 'NITROGEN') return buildSMILESMolecule('N#N', 'molecular nitrogen')
  if (upper === 'CO2') return buildSMILESMolecule('O=C=O', 'carbon dioxide')
  if (upper === 'CO') return buildSMILESMolecule('[C-]#[O+]', 'carbon monoxide')
  if (upper === 'CH4' || upper === 'METHANE') return buildSMILESMolecule('C', 'methane')
  if (upper === 'CH2O' || upper === 'FORMALDEHYDE') return buildSMILESMolecule('C=O', 'formaldehyde')
  if (upper === 'C') return buildSMILESMolecule('[C]', 'atomic carbon')

  if (nC === 0) {
    return null
  }

  // Procedural Guessing based on saturation limits
  if (nO === 0 && nN === 0 && nH === 2 * nC + 2) return buildSMILESMolecule('C'.repeat(nC), formula)
  if (nO === 1 && nN === 0 && nH === 2 * nC + 2) return buildSMILESMolecule('C'.repeat(nC) + 'O', formula)
  if (nO === 2 && nN === 0 && nH === 2 * nC) return buildSMILESMolecule('C'.repeat(nC - 1) + 'C(=O)OH', formula)
  if (nO === 0 && nN === 1 && nH === 2 * nC + 3) return buildSMILESMolecule('C'.repeat(nC) + 'N', formula)

  // Ultimate Procedural Fallback: Just link everything in a chain
  // This allows radicals and small clusters (like HO, CH3) to always resolve
  const builder = new MolBuilder(formula)
  const ids: number[] = []
  for (const [sym, count] of counts.entries()) {
    const el = SYMBOL_TO_NUM[sym] || 6
    for (let i = 0; i < count; i++) {
      ids.push(builder.addAtom(el, Math.random(), Math.random(), Math.random()))
    }
  }
  for (let i = 0; i < ids.length - 1; i++) {
    builder.addBond(ids[i], ids[i + 1], 1)
  }
  builder.relaxCoordinates()
  return builder.getResult(formula)
}

function buildSMILESMolecule(smiles: string, name: string): MoleculeData | null {
  return parseSmiles(smiles, name)
}

export function toFormula(atoms: AtomData[]): string {
  const counts: Record<string, number> = {}
  atoms.forEach(a => {
    const sym = NUM_TO_SYMBOL[a.element] || 'C'
    counts[sym] = (counts[sym] || 0) + 1
  })
  let formula = ''
  if (counts['C']) { formula += `C${counts['C'] > 1 ? counts['C'] : ''}`; delete counts['C'] }
  if (counts['H']) { formula += `H${counts['H'] > 1 ? counts['H'] : ''}`; delete counts['H'] }
  for (const [sym, count] of Object.entries(counts).sort()) {
    formula += `${sym}${count > 1 ? count : ''}`
  }
  return formula
}

// ── 3D BUILDER WITH FORCE-DIRECTED LAYOUT ──

export class MolBuilder {
  atoms: AtomData[] = []
  bonds: BondData[] = []
  name: string
  formula: string = ''

  constructor(name: string) {
    this.name = name
  }

  addAtom(element: number, x: number, y: number, z: number): number {
    const id = this.atoms.length + 1
    this.atoms.push({ id, element, x, y, z })
    return id
  }

  addBond(id1: number, id2: number, order: number = 1) {
    // Avoid duplicate bonds
    if (this.bonds.some(b => (b.atom1 === id1 && b.atom2 === id2) || (b.atom1 === id2 && b.atom2 === id1))) return
    this.bonds.push({ atom1: id1, atom2: id2, order })
  }

  saturate() {
    const currentAtoms = [...this.atoms]
    for (const atom of currentAtoms) {
      const valency = ATOM_VALENCY[atom.element]
      if (!valency) continue

      const currentBonds = this.bonds.filter(b => b.atom1 === atom.id || b.atom2 === atom.id)
      const currentOrder = currentBonds.reduce((sum, b) => sum + b.order, 0)

      const needed = valency - currentOrder
      for (let i = 0; i < needed; i++) {
        // Spread hydrogens in a shell around the atom
        const phi = Math.acos(-1 + (2 * i) / needed)
        const theta = Math.sqrt(needed * Math.PI) * phi
        const hId = this.addAtom(1,
          atom.x + Math.sin(phi) * Math.cos(theta) * 0.8,
          atom.y + Math.sin(phi) * Math.sin(theta) * 0.8,
          atom.z + Math.cos(phi) * 0.8
        )
        this.addBond(atom.id, hId)
      }
    }
  }

  relaxCoordinates() {
    const ITERATIONS = 200
    const K_BOND = 0.6
    const K_REP = 0.4
    const REST_LEN = 1.4

    for (let iter = 0; iter < ITERATIONS; iter++) {
      const forces = this.atoms.map(() => ({ x: 0, y: 0, z: 0 }))

      // Repulsion (Coulombic-like)
      for (let i = 0; i < this.atoms.length; i++) {
        for (let j = i + 1; j < this.atoms.length; j++) {
          const dx = this.atoms[i].x - this.atoms[j].x
          const dy = this.atoms[i].y - this.atoms[j].y
          const dz = this.atoms[i].z - this.atoms[j].z
          const distSq = dx * dx + dy * dy + dz * dz + 0.01
          const dist = Math.sqrt(distSq)

          const force = K_REP / distSq
          forces[i].x += force * (dx / dist); forces[i].y += force * (dy / dist); forces[i].z += force * (dz / dist)
          forces[j].x -= force * (dx / dist); forces[j].y -= force * (dy / dist); forces[j].z -= force * (dz / dist)
        }
      }

      for (const bond of this.bonds) {
        const a1 = this.atoms.findIndex(a => a.id === bond.atom1)
        const a2 = this.atoms.findIndex(a => a.id === bond.atom2)
        if (a1 === -1 || a2 === -1) continue

        const dx = this.atoms[a2].x - this.atoms[a1].x
        const dy = this.atoms[a2].y - this.atoms[a1].y
        const dz = this.atoms[a2].z - this.atoms[a1].z
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.001

        const force = K_BOND * (dist - REST_LEN)
        forces[a1].x += force * (dx / dist); forces[a1].y += force * (dy / dist); forces[a1].z += force * (dz / dist)
        forces[a2].x -= force * (dx / dist); forces[a2].y -= force * (dy / dist); forces[a2].z -= force * (dz / dist)
      }

      const damp = 0.1 * (1 - iter / ITERATIONS)
      for (let i = 0; i < this.atoms.length; i++) {
        this.atoms[i].x += forces[i].x * damp
        this.atoms[i].y += forces[i].y * damp
        this.atoms[i].z += forces[i].z * damp
      }
    }
  }

  centerCoordinates() {
    if (this.atoms.length === 0) return
    let cx = 0, cy = 0, cz = 0
    for (const a of this.atoms) { cx += a.x; cy += a.y; cz += a.z }
    cx /= this.atoms.length; cy /= this.atoms.length; cz /= this.atoms.length
    for (const a of this.atoms) { a.x -= cx; a.y -= cy; a.z -= cz }
  }

  getResult(formula: string): MoleculeData {
    this.formula = formula
    return {
      cid: 0,
      name: this.name,
      formula: this.formula,
      atoms: this.atoms,
      bonds: this.bonds,
      // Technical Energy scale (appx 400 kJ/mol per bond + base stability)
      maxEnergy: Math.max(100, (this.atoms.length - 1) * 400) + 200
    }
  }
}