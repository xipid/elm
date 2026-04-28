// human.test.ts
import { expect, test, describe, beforeAll } from "bun:test";
import { Molecule } from "../src/molecule";
import { doReaction } from "../src/reaction";


describe("🧑‍🔬 Human Interaction API Tests", () => {



    describe("Story 1: The Medical Researcher (Searching Common Names)", () => {
        test("Looks up Aspirin", async () => {
            const results = await Molecule.fromName("Aspirin");
            if (results.length === 0) return; // Skip if network fails
            const aspirin = results[0];
            await aspirin.fetch(); // Ensure full hydration
            expect(aspirin.formula).toBeDefined();
        });

        test("Looks up Aspirin and checks its chemical properties", async () => {
            // A human just types "Aspirin" and expects the engine to figure it out
            const results = await Molecule.fromName("Aspirin");
            expect(results.length).toBeGreaterThan(0);

            const aspirin = results[0];

            // Did it fetch from PubChem properly?
            expect(aspirin.fetched).toBe(true);
            expect(aspirin.cid).toBe(2244); // Aspirin's PubChem CID
            expect(aspirin.molWeight).toBeCloseTo(180.15, 1);

            // Did our local topological engine correctly parse the complex SMILES?
            expect(aspirin.formula).toBe("C9H8O4");

            // Aspirin has an aromatic ring, an ester group, and a carboxylic acid group.
            expect(aspirin.model.groups.ester).toBe(true);
            expect(aspirin.model.groups.carboxylicAcid).toBe(true);

            // Check VSEPR hybridization logic
            const aromatics = Array.from(aspirin.model.atoms.values()).filter(a => a.aromatic);
            expect(aromatics.length).toBeGreaterThanOrEqual(6); // Benzene ring
        });

        test("Looks up Caffeine and verifies molecular weight", async () => {
            const results = await Molecule.fromName("Caffeine");
            const caffeine = results[0];

            expect(caffeine.formula).toBe("C8H10N4O2");
            expect(caffeine.molWeight).toBeCloseTo(194.19, 1);
        });
    });

    describe("Story 2: The High School Student (Using fromAny)", () => {
        test("Types a random chemical formula and gets a result", async () => {
            // Student types a formula instead of a name
            const results = await Molecule.fromAny("C6H12O6"); // Glucose / Fructose
            expect(results.length).toBeGreaterThan(0);

            const sugar = results[0];
            // Since it's fromAny, it should have queried PubChem, populated SMILES, and built the graph
            expect(sugar.parsed).toBe(true);
            expect(sugar.model.atoms.size).toBeGreaterThan(0);
            expect(sugar.formula).toBe("C6H12O6");
        });

        test("Types IUPAC nomenclature directly", async () => {
            // Student types the formal IUPAC name for Glycerol
            const results = await Molecule.fromAny("propane-1,2,3-triol");
            expect(results.length).toBeGreaterThan(0);

            const glycerol = results[0];
            expect(glycerol.formula).toBe("C3H8O3");
            expect(glycerol.model.groups.alcohol).toBe(true); // Should detect the OH groups
        });
    });

    describe("Story 3: The Lab Technician (Bench Chemistry)", () => {
        test("Performs a Titration (Acid + Strong Base)", async () => {
            const aceticAcid = Molecule.fromSmilesSync("CC(=O)O");
            aceticAcid.name = "Acetic Acid";

            const naohResults = await Molecule.fromName("Sodium Hydroxide");
            const naoh = naohResults[0];

            const beaker = new Map<Molecule, number>();
            beaker.set(aceticAcid, 10); // Lower energy
            beaker.set(naoh, 10);

            const products = doReaction(beaker);

            // Assertions
            expect(products).not.toBe(beaker);
            expect(Array.from(products.keys()).some(p => p.formula.includes("Na"))).toBe(true);
        });
    });

    describe("Story 4: The Industrial Chemist (High Energy Reactions)", () => {
        test("Performs Steam Reforming of Methane", async () => {
            // Get Methane and Water
            const methaneResults = await Molecule.fromName("Methane");
            const methane = methaneResults[0];
            const water = Molecule.fromSmilesSync("O");
            water.name = "Water";


            // Cold conditions (No reaction expected without heat)
            const coldReactor = new Map<Molecule, number>();
            coldReactor.set(methane, 50);
            coldReactor.set(water, 50);
            const coldResult = doReaction(coldReactor);
            expect(coldResult).toBe(coldReactor); // Nothing happened

            // Hot conditions (Steam reforming requires > 500 Energy in our heuristic)
            const hotReactor = new Map<Molecule, number>();
            hotReactor.set(methane, 600);
            hotReactor.set(water, 600);
            const hotResult = doReaction(hotReactor);

            // Reaction triggers
            expect(hotResult).not.toBe(hotReactor);

            // Expected industrial products: Carbon Monoxide and Hydrogen Gas
            const productFormulas = Array.from(hotResult.keys()).map(m => m.formula);
            expect(productFormulas).toContain("CO");
            expect(productFormulas).toContain("H2");
        });
    });
});