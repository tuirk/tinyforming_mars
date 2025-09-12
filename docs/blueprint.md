# **App Name**: Tinyformers

## Core Features:

- Hex Map Visualization: Visually represent the 19-hex map, rendering land and water hexes differently. Supports the optional Tharsis or Elysium map layouts. When rendering in 3D, use transparency and subtle animations.
- Cube Placement: Allow users to click on hexes to place Water, Greenery, and Heat cubes. Enforce placement rules based on hex type and adjacency. After user action, have AI determine and implement its move.
- Project Card Activation: Enable players to view drafted project cards. Then have the player click a project card to activate it. Apply the card's effects. LLM as tool to provide move explanations.
- Standard Projects: Implement standard project actions (Sell Patent, Build City, etc.) with resource and placement validation.
- Resource and Credit Tracking: Display and manage player resources (Nature, Production, Science), credits, and Parameter Cubes (Heat, Greenery, Water).
- AI Opponent: Implement an AI opponent that follows the game rules to place cubes, activate projects, and complete standard projects. Use logic for maximizing VP and resource efficiency. Passes when no beneficial moves are available.
- Victory Point Calculation: Calculate victory points based on cities, adjacency, and heat cubes at game end.

## Style Guidelines:

- Primary color: HSL 210, 60%, 50% (RGB hex: #3399CC), a vibrant blue suggestive of planet-forming and progress.
- Background color: HSL 210, 20%, 20% (RGB hex: #333F47), a dark blue to enhance focus on the game board.
- Accent color: HSL 180, 50%, 50% (RGB hex: #40BFBF), a bright cyan as a spot color for interactive elements and highlights.
- Font pairing: 'Space Grotesk' (sans-serif) for headings and short information displays, paired with 'Inter' (sans-serif) for the longer form and descriptions.
- Use clear, geometric icons to represent resources, actions, and cube types, with a style consistent with 'Space Grotesk'.
- Employ a modular layout with clearly defined panels for the map, player information, resources, and available actions. Make effective use of negative space to avoid a cluttered interface.
- Use subtle transitions and animations to provide feedback on player actions and highlight important changes, but avoid overly distracting effects. Use CSS keyframes.