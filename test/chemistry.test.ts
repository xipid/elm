// chemistry.test.ts
import { expect, test, describe } from "bun:test";
import { Molecule, MoleculeInstance } from "../src/molecule";
import { doReaction } from "../src/reaction";

describe("🧪 Chemistry Engine - Pathway Tests", () => {

    test("1 & 2: Fuel + O / O2 Combustion", async () => {
        const methane = Molecule.fromSmilesSync("C");
        const o2 = Molecule.fromSmilesSync("O=O");
        const o = Molecule.fromSmilesSync("[O]");

        // Methane + 2 O2
        const beaker1: MoleculeInstance[] = [
            { type: methane, heatEnergy: 30 },
            { type: o2, heatEnergy: 30 },
            { type: o2, heatEnergy: 30 }
        ];
        const res1 = doReaction(beaker1);
        const formulas1 = res1.map(i => i.type.formula);
        const names1 = res1.map(i => i.type.name);
        expect(formulas1).toContain("H2O");
        expect(formulas1).toContain("CO2");
        expect(names1).toContain("Water");
        expect(names1).toContain("Carbon dioxide");

        // Methane + 4 O
        const beaker2: MoleculeInstance[] = [
            { type: methane, heatEnergy: 30 },
            { type: o, heatEnergy: 30 },
            { type: o, heatEnergy: 30 },
            { type: o, heatEnergy: 30 },
            { type: o, heatEnergy: 30 }
        ];
        const res2 = doReaction(beaker2);
        const formulas2 = res2.map(i => i.type.formula);
        const names2 = res2.map(i => i.type.name);
        expect(formulas2).toContain("H2O");
        expect(formulas2).toContain("CO2");
        expect(names2).toContain("Water");
        expect(names2).toContain("Carbon dioxide");
    });

    test("3 & 4: C + O / O2 -> CO / CO2", async () => {
        const c = Molecule.fromSmilesSync("[C]");
        const o = Molecule.fromSmilesSync("[O]");
        const o2 = Molecule.fromSmilesSync("O=O");

        // C + O
        const res1 = doReaction([{ type: c, heatEnergy: 50 }, { type: o, heatEnergy: 50 }]);
        expect(res1.map(i => i.type.formula)).toContain("CO");
        expect(res1.map(i => i.type.name)).toContain("Carbon monoxide");

        // C + O2
        const res2 = doReaction([{ type: c, heatEnergy: 50 }, { type: o2, heatEnergy: 50 }]);
        expect(res2.map(i => i.type.formula)).toContain("CO2");
        expect(res2.map(i => i.type.name)).toContain("Carbon dioxide");
    });

    test("5: Complex fuel reduction (Cracking)", async () => {
        // Hexane-like
        const hexane = Molecule.fromSmilesSync("CCCCCC");
        const res = doReaction([{ type: hexane, heatEnergy: 200 }]);
        expect(res.length).toBeGreaterThan(1);
        expect(res.every(i => i.type.model.atoms.size < hexane.model.atoms.size)).toBe(true);
    });

    test("6 & 7: Esterification and Reverse Ester (Preserving order)", async () => {
        const propanoicAcid = Molecule.fromSmilesSync("CCC(=O)O");
        propanoicAcid.name = "Propanoic acid";
        const ethanol = Molecule.fromSmilesSync("CCO");
        ethanol.name = "Ethanol";

        // Esterification: Propanoic + Ethanol -> Ethyl Propanoate
        const res1 = doReaction([{ type: propanoicAcid, heatEnergy: 100 }, { type: ethanol, heatEnergy: 100 }]);
        const ester = res1.find(i => i.type.model.groups.ester);
        expect(ester).toBeDefined();
        // Ethyl Propanoate SMILES should be CCC(=O)OCC
        expect(ester?.type.smiles).toBe("CCC(=O)OCC");
        expect(ester?.type.name).toBe("Ethyl propanoate");

        // Hydrolysis (Reverse)
        const res2 = doReaction([{ type: ester!.type, heatEnergy: 100 }, { type: Molecule.fromSmilesSync("O"), heatEnergy: 100 }]);
        const formulas2 = res2.map(i => i.type.formula);
        expect(formulas2).toContain("C3H6O2"); // Propanoic acid
        expect(formulas2).toContain("C2H6O");  // Ethanol
    });

    test("8: From and to Peroxide", async () => {
        const h2o2 = Molecule.fromSmilesSync("OO");
        h2o2.formula = "H2O2"; // Force formula for test

        // Dissociation of Peroxide
        const res1 = doReaction([{ type: h2o2, heatEnergy: 150 }]);
        expect(res1.map(i => i.type.formula)).toContain("OH");

        // Formation of Peroxide
        const oh = Molecule.fromSmilesSync("[OH]");
        const res2 = doReaction([{ type: oh, heatEnergy: 30 }, { type: oh, heatEnergy: 30 }]);
        expect(res2.map(i => i.type.formula)).toContain("H2O2");
    });

    test("9 & 10: Auto-ionization and Deionization of water", async () => {
        const water = Molecule.fromSmilesSync("O");
        
        // Auto-ionization
        const res1 = doReaction([{ type: water, heatEnergy: 200 }, { type: water, heatEnergy: 200 }]);
        const smiles1 = res1.map(i => i.type.smiles);
        const names1 = res1.map(i => i.type.name);
        expect(smiles1).toContain("[OH3+]");
        expect(smiles1).toContain("[OH-]");
        expect(names1).toContain("Hydronium");
        expect(names1).toContain("Hydroxide");

        // Deionization
        const h3o = Molecule.fromSmilesSync("[OH3+]");
        const oh = Molecule.fromSmilesSync("[OH-]");
        const res2 = doReaction([{ type: h3o, heatEnergy: 30 }, { type: oh, heatEnergy: 30 }]);
        expect(res2.every(i => i.type.formula === "H2O")).toBe(true);
    });

    test("11: Split of O2 and reverse", async () => {
        const o2 = Molecule.fromSmilesSync("O=O");
        
        // Split
        const res1 = doReaction([{ type: o2, heatEnergy: 150 }]);
        expect(res1.length).toBe(2);
        expect(res1.every(i => i.type.formula === "O")).toBe(true);

        // Recombine
        const o = Molecule.fromSmilesSync("[O]");
        const res2 = doReaction([{ type: o, heatEnergy: 30 }, { type: o, heatEnergy: 30 }]);
        expect(res2.length).toBe(1);
        expect(res2[0].type.formula === "O2").toBe(true);
    });

});
