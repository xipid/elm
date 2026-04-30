// ester.test.ts
import { expect, test, describe, beforeAll } from "bun:test";
import { Molecule, MoleculeInstance } from "../src/molecule";
import { doReaction } from "../src/reaction";


describe("🧪 Advanced Chemistry Engine Features", () => {



    test("Esterification: Formic Acid + Decanol -> Decyl Formate", async () => {
        const formicAcid = Molecule.cache.get("C(=O)O")!;
        const decanolResults = await Molecule.fromName("Decanol");
        const decanol = decanolResults[0];

        expect(formicAcid.name).toBe("Formic Acid");
        expect(decanol.name).toBe("Decanol");

        const beaker: MoleculeInstance[] = [
            { type: formicAcid, heatEnergy: 100 },
            { type: decanol, heatEnergy: 100 }
        ];
        const products = doReaction(beaker);
        const productMols = products.map(inst => inst.type);

        const ester = productMols.find(m => m.name.includes("Decyl"));
        expect(ester).toBeDefined();
        expect(ester?.name).toBe("Decyl formate");
        expect(ester?.formula).toBe("C11H22O2");
    });

    test("Redox: Magnesium + Hydrochloric Acid -> Magnesium Chloride + Hydrogen", async () => {
        const mgResults = await Molecule.fromName("Magnesium");
        const hclResults = await Molecule.fromName("Hydrochloric Acid");
        const mg = mgResults[0];
        const hcl = hclResults[0];

        const beaker: MoleculeInstance[] = [
            { type: mg, heatEnergy: 50 },
            { type: hcl, heatEnergy: 50 }
        ];
        const products = doReaction(beaker);
        const names = products.map(inst => inst.type.name);

        expect(names).toContain("Magnesium Chloride");
        expect(names).toContain("Hydrogen Gas");
    });

    test("Ionization: HCl dissociation", async () => {
        const hclResults = await Molecule.fromName("Hydrochloric Acid");
        const hcl = hclResults[0];

        const beaker: MoleculeInstance[] = [
            { type: hcl, heatEnergy: 200 }
        ];
        const products = doReaction(beaker);
        const formulas = products.map(inst => inst.type.formula);

        expect(formulas).toContain("H"); // H+
        expect(formulas).toContain("Cl"); // Cl-
    });
});
