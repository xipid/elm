import type { MoleculeData, AtomData, BondData } from './molecules'
import { ELEMENT_DATA } from './molecules'

// ── Functional Group Detection ──
// Scans molecule bond/atom structures to identify reactive sites

export interface FunctionalGroupMatch {
  type: string
  atomIds: number[] // atom IDs involved in the match
}

// ── Helper: build adjacency info ──

interface AtomNeighbor {
  atomId: number
  element: number
  bondOrder: number
}

function buildAdjacency(mol: MoleculeData): Map<number, AtomNeighbor[]> {
  const adj = new Map<number, AtomNeighbor[]>()
  const atomMap = new Map<number, AtomData>()

  for (const atom of mol.atoms) {
    adj.set(atom.id, [])
    atomMap.set(atom.id, atom)
  }

  for (const bond of mol.bonds) {
    const a1 = atomMap.get(bond.atom1)
    const a2 = atomMap.get(bond.atom2)
    if (!a1 || !a2) continue

    adj.get(bond.atom1)!.push({ atomId: bond.atom2, element: a2.element, bondOrder: bond.order })
    adj.get(bond.atom2)!.push({ atomId: bond.atom1, element: a1.element, bondOrder: bond.order })
  }

  return adj
}

function getElement(mol: MoleculeData, atomId: number): number {
  return mol.atoms.find(a => a.id === atomId)?.element ?? 0
}

// ── Hydroxyl group: -OH (alcohol, NOT part of carboxyl) ──

export function findHydroxyl(mol: MoleculeData): FunctionalGroupMatch | null {
  const adj = buildAdjacency(mol)

  for (const atom of mol.atoms) {
    if (atom.element !== 8) continue // Must be oxygen

    const neighbors = adj.get(atom.id) ?? []

    // O bonded to exactly one H (single bond) and one C (single bond)
    const hBonds = neighbors.filter(n => n.element === 1 && n.bondOrder === 1)
    const cBonds = neighbors.filter(n => n.element === 6 && n.bondOrder === 1)

    if (hBonds.length >= 1 && cBonds.length >= 1) {
      // Exclude carboxyl: the C must NOT also have a double bond to another O
      const carbonNeighbors = adj.get(cBonds[0].atomId) ?? []
      const doubleO = carbonNeighbors.filter(n => n.element === 8 && n.bondOrder === 2)

      if (doubleO.length === 0) {
        return {
          type: 'hydroxyl',
          atomIds: [atom.id, hBonds[0].atomId, cBonds[0].atomId],
        }
      }
    }
  }
  return null
}

// ── Carboxyl group: -C(=O)(OH) ──

export function findCarboxyl(mol: MoleculeData): FunctionalGroupMatch | null {
  const adj = buildAdjacency(mol)

  for (const atom of mol.atoms) {
    if (atom.element !== 6) continue // Must be carbon

    const neighbors = adj.get(atom.id) ?? []
    const doubleO = neighbors.filter(n => n.element === 8 && n.bondOrder === 2)
    const singleO = neighbors.filter(n => n.element === 8 && n.bondOrder === 1)

    if (doubleO.length >= 1 && singleO.length >= 1) {
      // Check the single-bonded O has an H attached
      for (const oNeighbor of singleO) {
        const oNeighbors = adj.get(oNeighbor.atomId) ?? []
        const hBonds = oNeighbors.filter(n => n.element === 1 && n.bondOrder === 1)
        if (hBonds.length >= 1) {
          return {
            type: 'carboxyl',
            atomIds: [atom.id, doubleO[0].atomId, oNeighbor.atomId, hBonds[0].atomId],
          }
        }
      }
    }
  }
  return null
}

// ── Ester linkage: -C(=O)-O-C- ──

export function findEsterLinkage(mol: MoleculeData): FunctionalGroupMatch | null {
  const adj = buildAdjacency(mol)

  for (const atom of mol.atoms) {
    if (atom.element !== 6) continue

    const neighbors = adj.get(atom.id) ?? []
    const doubleO = neighbors.filter(n => n.element === 8 && n.bondOrder === 2)
    const singleO = neighbors.filter(n => n.element === 8 && n.bondOrder === 1)

    if (doubleO.length >= 1 && singleO.length >= 1) {
      for (const oNeighbor of singleO) {
        const oNeighbors = adj.get(oNeighbor.atomId) ?? []
        // O bonded to another C (not H — that would be carboxyl)
        const otherC = oNeighbors.filter(
          n => n.element === 6 && n.atomId !== atom.id && n.bondOrder === 1,
        )
        const hBonds = oNeighbors.filter(n => n.element === 1)

        if (otherC.length >= 1 && hBonds.length === 0) {
          return {
            type: 'ester',
            atomIds: [atom.id, doubleO[0].atomId, oNeighbor.atomId, otherC[0].atomId],
          }
        }
      }
    }
  }
  return null
}

// ── Amino group: -NH2 bonded to carbon ──

export function findAmino(mol: MoleculeData): FunctionalGroupMatch | null {
  const adj = buildAdjacency(mol)

  for (const atom of mol.atoms) {
    if (atom.element !== 7) continue // Nitrogen

    const neighbors = adj.get(atom.id) ?? []
    const hBonds = neighbors.filter(n => n.element === 1 && n.bondOrder === 1)
    const cBonds = neighbors.filter(n => n.element === 6 && n.bondOrder === 1)

    if (hBonds.length >= 2 && cBonds.length >= 1) {
      return {
        type: 'amino',
        atomIds: [atom.id, ...hBonds.map(h => h.atomId), cBonds[0].atomId],
      }
    }
  }
  return null
}

// ── Carbonyl group: C=O (not part of carboxyl or ester) ──

export function findCarbonyl(mol: MoleculeData): FunctionalGroupMatch | null {
  const adj = buildAdjacency(mol)

  for (const atom of mol.atoms) {
    if (atom.element !== 6) continue

    const neighbors = adj.get(atom.id) ?? []
    const doubleO = neighbors.filter(n => n.element === 8 && n.bondOrder === 2)
    const singleO = neighbors.filter(n => n.element === 8 && n.bondOrder === 1)

    // Must have C=O but NOT also single O (that's carboxyl or ester)
    if (doubleO.length >= 1 && singleO.length === 0) {
      return {
        type: 'carbonyl',
        atomIds: [atom.id, doubleO[0].atomId],
      }
    }
  }
  return null
}

// ── Simple molecule identity checks ──

export function isWater(mol: MoleculeData): boolean {
  return mol.formula === 'H2O'
}

export function isHydronium(mol: MoleculeData): boolean {
  // H3O+ — PubChem CID 123332
  return mol.cid === 123332 || mol.formula === 'H3O'
}

export function isHydroxide(mol: MoleculeData): boolean {
  // OH- — PubChem CID 961
  return mol.cid === 961 || (mol.atoms.length === 2 &&
    mol.atoms.filter(a => a.element === 1).length === 1 &&
    mol.atoms.filter(a => a.element === 8).length === 1 &&
    !isWater(mol))
}

export function isHalide(mol: MoleculeData): boolean {
  // Single halogen atom or HX molecules
  const halogens = [9, 17, 35, 53] // F, Cl, Br, I
  return mol.atoms.some(a => halogens.includes(a.element))
}

// ── Bond analysis for thermal splitting ──

/**
 * Find the "best" bond to break for thermal splitting.
 * Prefers single bonds between non-hydrogen heavy atoms for interesting fragments.
 */
export function findWeakestBond(mol: MoleculeData): BondData | null {
  if (mol.bonds.length <= 1) return mol.bonds[0] ?? null

  // Score each bond — lower is "weaker" / more breakable
  let bestBond = mol.bonds[0]
  let bestScore = Infinity

  for (const bond of mol.bonds) {
    const e1 = getElement(mol, bond.atom1)
    const e2 = getElement(mol, bond.atom2)

    // Base score from bond order (single=1, double=2, triple=3)
    let score = bond.order * 100

    // Penalize bonds involving hydrogen (breaking C-H is boring)
    if (e1 === 1 || e2 === 1) score += 50

    // Prefer C-C, C-O, C-N bonds (interesting fragments)
    if ((e1 === 6 || e2 === 6) && e1 !== 1 && e2 !== 1) score -= 20

    if (score < bestScore) {
      bestScore = score
      bestBond = bond
    }
  }

  return bestBond
}

/**
 * Split a molecule's atom IDs into two connected fragments at the given bond.
 * Uses BFS from one side of the cut.
 */
export function splitAtBond(mol: MoleculeData, bond: BondData): [number[], number[]] {
  const visited = new Set<number>()
  const queue = [bond.atom1]
  visited.add(bond.atom1)

  while (queue.length > 0) {
    const current = queue.shift()!
    for (const b of mol.bonds) {
      // Don't cross the cut bond (in either direction)
      if ((b.atom1 === bond.atom1 && b.atom2 === bond.atom2) ||
          (b.atom1 === bond.atom2 && b.atom2 === bond.atom1)) continue

      let neighbor: number | null = null
      if (b.atom1 === current) neighbor = b.atom2
      else if (b.atom2 === current) neighbor = b.atom1

      if (neighbor !== null && !visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)
      }
    }
  }

  const fragment1 = Array.from(visited)
  const fragment2 = mol.atoms.filter(a => !visited.has(a.id)).map(a => a.id)

  return [fragment1, fragment2]
}

/**
 * Compute a molecular formula from a subset of atom IDs.
 * Uses Hill system ordering (C first, H second, then alphabetical).
 */
export function computeFragmentFormula(mol: MoleculeData, atomIds: number[]): string {
  const counts = new Map<number, number>()
  for (const id of atomIds) {
    const atom = mol.atoms.find(a => a.id === id)
    if (atom) {
      counts.set(atom.element, (counts.get(atom.element) ?? 0) + 1)
    }
  }

  const elements = Array.from(counts.entries()).map(([el, count]) => ({
    symbol: ELEMENT_DATA[el]?.symbol ?? '?',
    count,
    el,
  }))

  // Hill system: C first, then H, then alphabetical
  elements.sort((a, b) => {
    if (a.el === 6) return -1
    if (b.el === 6) return 1
    if (a.el === 1) return -1
    if (b.el === 1) return 1
    return a.symbol.localeCompare(b.symbol)
  })

  return elements.map(e => e.symbol + (e.count > 1 ? e.count : '')).join('')
}

/**
 * Run all structural scanners on a molecule and return all detected groups.
 */
export function scanAllGroups(mol: MoleculeData): FunctionalGroupMatch[] {
  const groups: FunctionalGroupMatch[] = []

  const hydroxyl = findHydroxyl(mol)
  if (hydroxyl) groups.push(hydroxyl)

  const carboxyl = findCarboxyl(mol)
  if (carboxyl) groups.push(carboxyl)

  const ester = findEsterLinkage(mol)
  if (ester) groups.push(ester)

  const amino = findAmino(mol)
  if (amino) groups.push(amino)

  const carbonyl = findCarbonyl(mol)
  if (carbonyl) groups.push(carbonyl)

  return groups
}
