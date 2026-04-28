// reactions.ts - Unified Engine Bridge
import { getMolecule, type MoleculeData } from './molecules'
import { Molecule as ChemMolecule, MoleculeInstance } from '../../../src/molecule'
import { doReaction as chemDoReaction } from '../../../src/reaction'

export interface ReactionOutcome {
  pathwayId: string
  pathwayName: string
  type: 'exothermic' | 'endothermic' | 'neutral'
  products: (string | MoleculeData)[]
  energyCost: number
  energyDelta: number
}

export interface SplitOutcome {
  pathwayId: string
  pathwayName: string
  fragments: (string | MoleculeData)[]
  energyDelta: number
}

export interface ReactionResult {
  outcome: ReactionOutcome
  reactantUids: string[]
}

/**
 * Bridges UI MoleculeData to the hardened Chem Engine Molecule class.
 */
async function bridgeToChem(data: MoleculeData): Promise<ChemMolecule | null> {
  // Use SMILES if present (fastest, most accurate)
  if (data.smiles) {
    const mol = ChemMolecule.fromSmilesSync(data.smiles)
    mol.name = data.name
    mol.cid = data.cid
    mol.formula = data.formula
    return mol
  }
  // Fallback to searching by any identifier
  const results = await ChemMolecule.fromAny(data.cid || data.name || data.formula)
  return results[0] || null
}

/**
 * Evaluates collision between two molecules using the core hardened chem engine.
 */
export async function evaluateCollision(
  uidA: string, molA: MoleculeData, energyA: number,
  uidB: string, molB: MoleculeData, energyB: number,
): Promise<ReactionResult | null> {
  const chemA = await bridgeToChem(molA)
  const chemB = await bridgeToChem(molB)

  if (!chemA || !chemB) return null

  const instances: MoleculeInstance[] = [
    { type: chemA, heatEnergy: energyA },
    { type: chemB, heatEnergy: energyB }
  ]

  const output = chemDoReaction(instances)

  // If the output is identical to the input, no reaction happened
  if (output === instances) return null

  // Convert chem engine results back to engine-friendly objects
  const productData: MoleculeData[] = output.map(inst => inst.type.toMoleculeData())

  return {
    outcome: {
      pathwayId: 'chem_engine_reaction',
      pathwayName: 'Chemical Reaction',
      type: 'neutral',
      products: productData,
      energyCost: 0,
      energyDelta: 0
    },
    reactantUids: [uidA, uidB]
  }
}

/**
 * Evaluates thermal splitting using the core hardened chem engine.
 */
export async function evaluateSplit(mol: MoleculeData, energy: number): Promise<SplitOutcome | null> {
  const chem = await bridgeToChem(mol)
  if (!chem) return null

  const instances: MoleculeInstance[] = [{ type: chem, heatEnergy: energy }]

  const output = chemDoReaction(instances)
  if (output === instances) return null

  const productData: MoleculeData[] = output.map(inst => inst.type.toMoleculeData())

  return {
    pathwayId: 'chem_engine_split',
    pathwayName: `Thermal Split: ${mol.name}`,
    fragments: productData,
    energyDelta: 0
  }
}

/**
 * Resolves product identifiers into full MoleculeData.
 * The core engine should ideally return full objects now.
 */
export async function resolveProducts(products: (string | MoleculeData)[]): Promise<MoleculeData[]> {
  const results: MoleculeData[] = []
  for (const q of products) {
    if (typeof q !== 'string') {
      results.push(q)
    } else {
      const mol = await getMolecule(q)
      if (mol) results.push(mol)
    }
  }
  return results
}