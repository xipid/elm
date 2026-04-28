// ester.test.ts
import { expect, test, describe, beforeAll } from "bun:test";
import { Molecule } from "../src/molecule";
import { doReaction } from "../src/reaction";


describe("🧪 Advanced Chemistry Engine Features", () => {



    test("Esterification: Formic Acid + Decanol -> Decyl Formate", async () => {
        const formicAcid = Molecule.cache.get("C(=O)O")!;
        const decanolResults = await Molecule.fromName("Decanol");
        const decanol = decanolResults[0];

        expect(formicAcid.name).toBe("Formic Acid");
        expect(decanol.name).toBe("Decanol");

        const beaker = new Map<Molecule, number>();
        beaker.set(formicAcid, 100);
        beaker.set(decanol, 100);

        const products = doReaction(beaker);
        const productMols = Array.from(products.keys());

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

        const beaker = new Map<Molecule, number>();
        beaker.set(mg, 50);
        beaker.set(hcl, 50);

        const products = doReaction(beaker);
        const names = Array.from(products.keys()).map(m => m.name);

        expect(names).toContain("Magnesium Chloride");
        expect(names).toContain("Hydrogen Gas");
    });

    test("Ionization: HCl dissociation", async () => {
        const hclResults = await Molecule.fromName("Hydrochloric Acid");
        const hcl = hclResults[0];

        const beaker = new Map<Molecule, number>();
        beaker.set(hcl, 200); // High energy triggers ionization

        const products = doReaction(beaker);
        const formulas = Array.from(products.keys()).map(m => m.formula);

        expect(formulas).toContain("H"); // H+
        expect(formulas).toContain("Cl"); // Cl-
    });
});
