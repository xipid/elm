# ELM (Element)

ELM is a hardened, high-fidelity chemistry simulation library designed for real-time 3D applications. 

## Vision
The goal of this project is to provide a robust core library (`elm/`) for molecular modeling, energy dynamics, and IUPAC validation, accompanied by a world-class visual testing playground.

## Project Structure
- `src/chem/` (alias `elm/`): The core chemistry engine.
- `resources/`: The visual testing website (built with Vue 3 + TresJS).
- `resources/scripts/engine/`: The bridge between the raw chem library and the testing UI.

## Core Features
- **IUPAC Nomenclature**: Comprehensive parsing and generation for branched hydrocarbons and functional groups.
- **3D Generation**: Real-time 3D coordinates generation based on VSEPR theory.
- **Reaction Engine**: Mass and energy-conserving reaction simulation.
- **Thermal Dynamics**: Accurate energy transfer and phase-splitting logic.
