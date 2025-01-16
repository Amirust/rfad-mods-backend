export enum ModTags {
  // Optional Mod Tags
  Graphics = 100,
  Clothing,
  Environment,
  Characters,
  Interface,
  Gameplay,
  Audio,
  QoL,
  Locations,

  LastCategory = 119, // Just utility for checking if tag is a category

  // All Category tags start from 120
  // Graphic Mods
  ENB = 120,
  Reshade,
  GraphicsPack,

  // Clothing Mods
  Heavy,
  Light,
  Pack,

  // Environment Mods
  World,
  City,

  // Actors Mods
  Appearance,

  // Interface Mods
  Extended,
  Fonts,
  Reskin,

  // Gameplay Mods
  Animations,

  // Audio Mods
  Music,
  Voice,

  // Quality of Life Mods
  // Just a category

  // Locations Mods
  // Just a category

  // Only for Boosty
  BoostyTier1 = 290,
  BoostyTier2,
  BoostyTier3,
  BoostyTier4,
  BoostyTier5,
}