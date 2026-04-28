// ── Atom data (CPK coloring + van der Waals radii) ──
import { Molecule as ChemMolecule } from '../../../src/molecule'

/** Element info indexed by atomic number */
export interface AtomInfo {
  symbol: string
  name: string
  color: string
  radius: number // van der Waals radius in Ångströms, scaled for display
}

export const ELEMENT_DATA: Record<number, AtomInfo> = {
  1: { symbol: 'H', name: 'Hydrogen', color: '#f1f5f9', radius: 0.31 },
  6: { symbol: 'C', name: 'Carbon', color: '#374151', radius: 0.77 },
  7: { symbol: 'N', name: 'Nitrogen', color: '#3b82f6', radius: 0.75 },
  8: { symbol: 'O', name: 'Oxygen', color: '#ef4444', radius: 0.73 },
  9: { symbol: 'F', name: 'Fluorine', color: '#22c55e', radius: 0.72 },
  15: { symbol: 'P', name: 'Phosphorus', color: '#f97316', radius: 1.06 },
  16: { symbol: 'S', name: 'Sulfur', color: '#eab308', radius: 1.02 },
  17: { symbol: 'Cl', name: 'Chlorine', color: '#22c55e', radius: 0.99 },
  35: { symbol: 'Br', name: 'Bromine', color: '#991b1b', radius: 1.14 },
  53: { symbol: 'I', name: 'Iodine', color: '#6b21a8', radius: 1.33 },
}

/** Get atom info, with a fallback for unknown elements */
export function getAtomInfo(atomicNumber: number): AtomInfo {
  return ELEMENT_DATA[atomicNumber] ?? {
    symbol: '?',
    name: 'Unknown',
    color: '#94a3b8',
    radius: 0.8,
  }
}

// ── Molecule data structures ──

export interface AtomData {
  id: number
  element: number
  x: number
  y: number
  z: number
}

export interface BondData {
  atom1: number
  atom2: number
  order: number
}

export interface MoleculeData {
  cid: number
  name: string
  iupac?: string
  smiles?: string
  formula: string
  atoms: AtomData[]
  bonds: BondData[]
  maxEnergy: number
}

// ── PubChem API ──

const PUBCHEM_BASE = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug'

/** Rate-limiter: max 4 requests/second */
let lastRequestTime = 0
async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now()
  const elapsed = now - lastRequestTime
  if (elapsed < 250) {
    await new Promise(r => setTimeout(r, 250 - elapsed))
  }
  lastRequestTime = Date.now()
  return fetch(url)
}

/** Fetch 3D conformer data from PubChem by compound name */
export async function fetchMolecule3D(nameOrCid: string | number): Promise<MoleculeData | null> {
  try {
    const identifier = typeof nameOrCid === 'number'
      ? `cid/${nameOrCid}`
      : `name/${encodeURIComponent(nameOrCid)}`

    // Fetch 3D coordinates
    const res3d = await rateLimitedFetch(
      `${PUBCHEM_BASE}/compound/${identifier}/record/JSON/?record_type=3d`
    )
    if (!res3d.ok) return null

    const data = await res3d.json()
    const compound = data.PC_Compounds?.[0]
    if (!compound) return null

    // Parse atoms
    const atomIds: number[] = compound.atoms.aid
    const elements: number[] = compound.atoms.element
    const coords = compound.coords?.[0]?.conformers?.[0]
    if (!coords) return null

    const atoms: AtomData[] = atomIds.map((id: number, i: number) => ({
      id,
      element: elements[i],
      x: coords.x[i],
      y: coords.y[i],
      z: coords.z[i],
    }))

    // Parse bonds
    const bonds: BondData[] = []
    if (compound.bonds) {
      const { aid1, aid2, order } = compound.bonds
      for (let i = 0; i < aid1.length; i++) {
        bonds.push({
          atom1: aid1[i],
          atom2: aid2[i],
          order: order[i],
        })
      }
    }

    // Get the name and formula
    let name = typeof nameOrCid === 'string' ? nameOrCid : `CID:${nameOrCid}`
    let formula = ''

    try {
      const propsRes = await rateLimitedFetch(
        `${PUBCHEM_BASE}/compound/${identifier}/property/MolecularFormula,IUPACName/JSON`
      )
      if (propsRes.ok) {
        const propsData = await propsRes.json()
        const props = propsData.PropertyTable?.Properties?.[0]
        if (props) {
          formula = props.MolecularFormula ?? ''
          if (props.IUPACName) name = props.IUPACName
        }
      }
    } catch {
      // Properties are optional, continue without them
    }

    return {
      cid: compound.id.id.cid,
      name,
      formula,
      atoms,
      bonds,
      maxEnergy: atoms.length * 40,
    }
  } catch (err) {
    console.error(`[Isomer] Failed to fetch molecule "${nameOrCid}":`, err)
    return null
  }
}

// ── Local fallbacks for atoms and radicals (no 3D in PubChem) ──

const LOCAL_MOLECULES: Record<string, MoleculeData> = {
  'atomic hydrogen': {
    cid: 23985, name: 'Atomic Hydrogen', formula: 'H',
    atoms: [{ id: 1, element: 1, x: 0, y: 0, z: 0 }], bonds: [], maxEnergy: 40
  },
  'atomic oxygen': {
    cid: 23623, name: 'Atomic Oxygen', formula: 'O',
    atoms: [{ id: 1, element: 8, x: 0, y: 0, z: 0 }], bonds: [], maxEnergy: 40
  },
  'atomic carbon': {
    cid: 23621, name: 'Atomic Carbon', formula: 'C',
    atoms: [{ id: 1, element: 6, x: 0, y: 0, z: 0 }], bonds: [], maxEnergy: 40
  },
  'atomic nitrogen': {
    cid: 23553, name: 'Atomic Nitrogen', formula: 'N',
    atoms: [{ id: 1, element: 7, x: 0, y: 0, z: 0 }], bonds: [], maxEnergy: 40
  },
  'hydroxyl radical': {
    cid: 157350, name: 'Hydroxyl Radical', formula: 'OH',
    atoms: [
      { id: 1, element: 8, x: 0, y: 0, z: 0 },
      { id: 2, element: 1, x: 0.97, y: 0, z: 0 }
    ],
    bonds: [{ atom1: 1, atom2: 2, order: 1 }],
    maxEnergy: 80
  },
  'methyl': {
    cid: 10460, name: 'Methyl Radical', formula: 'CH3',
    atoms: [
      { id: 1, element: 6, x: 0, y: 0, z: 0 },
      { id: 2, element: 1, x: 0.7, y: 0.7, z: 0.7 },
      { id: 3, element: 1, x: -0.7, y: -0.7, z: 0.7 },
      { id: 4, element: 1, x: 0.7, y: -0.7, z: -0.7 }
    ],
    bonds: [
      { atom1: 1, atom2: 2, order: 1 },
      { atom1: 1, atom2: 3, order: 1 },
      { atom1: 1, atom2: 4, order: 1 }
    ],
    maxEnergy: 60
  },
  'water': {
    cid: 962, name: 'Water', formula: 'H2O',
    atoms: [
      { id: 1, element: 8, x: 0, y: 0.12, z: 0 },
      { id: 2, element: 1, x: -0.76, y: -0.47, z: 0 },
      { id: 3, element: 1, x: 0.76, y: -0.47, z: 0 }
    ],
    bonds: [
      { atom1: 1, atom2: 2, order: 1 },
      { atom1: 1, atom2: 3, order: 1 }
    ],
    maxEnergy: 120
  },
  'methyl radical': {
    cid: 123237, name: 'Methyl Radical', formula: 'CH3',
    atoms: [
      { id: 1, element: 6, x: 0, y: 0, z: 0 },
      { id: 2, element: 1, x: 1.08, y: 0, z: 0 },
      { id: 3, element: 1, x: -0.54, y: 0.94, z: 0 },
      { id: 4, element: 1, x: -0.54, y: -0.94, z: 0 }
    ],
    bonds: [
      { atom1: 1, atom2: 2, order: 1 },
      { atom1: 1, atom2: 3, order: 1 },
      { atom1: 1, atom2: 4, order: 1 }
    ],
    maxEnergy: 160
  }
}

/** Search PubChem for compounds by name, returns CIDs */
export async function searchMolecules(query: string, maxResults = 5): Promise<number[]> {
  try {
    const res = await rateLimitedFetch(
      `${PUBCHEM_BASE}/compound/name/${encodeURIComponent(query)}/cids/JSON`
    )
    if (!res.ok) return []
    const data = await res.json()
    const cids: number[] = data.IdentifierList?.CID ?? []
    return cids.slice(0, maxResults)
  } catch {
    return []
  }
}

/** Search PubChem for compounds by formula, returns the first CID found */
export async function searchByFormula(formula: string): Promise<number | null> {
  try {
    const res = await rateLimitedFetch(
      `${PUBCHEM_BASE}/compound/fastformula/${encodeURIComponent(formula)}/cids/JSON`
    )
    if (!res.ok) return null
    const data = await res.json()
    const cids: number[] = data.IdentifierList?.CID ?? []
    return cids[0] ?? null
  } catch {
    return null
  }
}

// ── Cache for fetched molecules ──
const moleculeCache = new Map<string, MoleculeData>()

export async function getMolecule(nameOrCid: string | number): Promise<MoleculeData | null> {
  const key = String(nameOrCid).toLowerCase()
  if (LOCAL_MOLECULES[key]) return LOCAL_MOLECULES[key]

  if (moleculeCache.has(key)) {
    return moleculeCache.get(key)!
  }

  let data: MoleculeData | null = null
  const fmlDisabled = (globalThis as any).DISABLE_FML === true

  // 1. Chem-Engine (Primary: Handles formula prioritization and common inorganic overrides)
  if (typeof nameOrCid === 'string') {
    try {
      const chem = await ChemMolecule.fromAny(nameOrCid);
      if (chem.length > 0) {
        return chem[0].toMoleculeData();
      }
    } catch { }
  }

  // 2. Standard PubChem Resolution (Secondary for detailed 3D coordinates)
  if (typeof nameOrCid === 'number' || typeof nameOrCid === 'string') {
    data = await fetchMolecule3D(nameOrCid)

    // If name search failed, try formula search
    if (!data && typeof nameOrCid === 'string' && nameOrCid.length > 1) {
      const isFormula = /^[A-Z][a-z]?\d*([A-Z][a-z]?\d*)*$/.test(nameOrCid)
      if (isFormula) {
        const cid = await searchByFormula(nameOrCid)
        if (cid) data = await fetchMolecule3D(cid)
      }
    }
  }

  // 3. FML Fallback (Procedural backup)
  if (!data && typeof nameOrCid === 'string' && !fmlDisabled) {
    try {
      const { generateFromFormula } = await import('./fml')
      data = generateFromFormula(nameOrCid)
    } catch { }
  }

  if (data) {
    moleculeCache.set(key, data)
  }
  return data
}

// ── Pre-defined molecules for quick access ──
export const STARTER_MOLECULES = ['water', 'methane', 'ethanol'] as const
