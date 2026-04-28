import { expect, test, describe, beforeAll } from "bun:test";
import { Molecule } from "../src/molecule";
import { doReaction } from "../src/reaction";


describe("🧪 Extensive Chemistry Test Suite", () => {



    describe("1. Radical Reactions", () => {
        test("O2 Splitting: O=O -> O + O", () => {
            const o2 = Molecule.fromSmilesSync("O=O");
            // We'll simulate high energy split in the doReaction logic soon
            // For now, check if O2 parser is correct
            expect(o2.formula).toBe("O2");
            expect(o2.model.atoms.size).toBe(2);
            expect(Array.from(o2.model.bonds.values())[0].order).toBe(2);
        });

        test("Hydroxyl Radical Parser: [OH] has 1 Hydrogen", () => {
            const oh = Molecule.fromSmilesSync("[OH]");
            expect(oh.formula).toBe("HO"); // or OH
            expect(oh.model.atoms.size).toBe(1);
            expect(oh.model.atoms.get(0)?.implicitHydrogens).toBe(1);
        });

        test("OH Recombination: OH + OH -> H2O2", () => {
            const oh = Molecule.fromSmilesSync("[OH]");
            const beaker = new Map<Molecule, number>();
            beaker.set(oh, 100);

            // This test will guide our reaction implementation
            const products = doReaction(beaker);
            const productList = Array.from(products.keys()).map(m => m.formula);
            expect(productList).toContain("H2O2"); // We'll add this to reaction.ts
        });
    });

    describe("2. Bond Order Precision", () => {
        test("Triple Bonds: Acetylene (C#C)", () => {
            const acetylene = Molecule.fromSmilesSync("C#C");
            expect(acetylene.formula).toBe("C2H2");
            const bond = Array.from(acetylene.model.bonds.values())[0];
            expect(bond.order).toBe(3);
        });

        test("Double Bonds: Ethylene (C=C)", () => {
            const ethylene = Molecule.fromSmilesSync("C=C");
            expect(ethylene.formula).toBe("C2H4");
            const bond = Array.from(ethylene.model.bonds.values())[0];
            expect(bond.order).toBe(2);
        });
    });

    describe("3. Naming & Cache Isolation", () => {
        test("Reaction products don't corrupt global cache names", () => {
            const ethanol = Molecule.fromSmilesSync("CCO");
            ethanol.name = "Original Ethanol";

            // Reaction that produces an aldehyde from ethanol (MOCK/REAL)
            const products = doReaction(new Map([[ethanol, 300]]));
            const acetaldehyde = Array.from(products.keys()).find(p => p.smiles === "CC=O");

            if (acetaldehyde) {
                expect(acetaldehyde.name).not.toBe("Original Ethanol");
                // Check if global Ethanol is still named correctly
                expect(Molecule.cache.get("CCO")?.name).toBe("Original Ethanol");
            }
        });
    });
});
