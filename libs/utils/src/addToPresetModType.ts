import { PresetMod } from '@app/db/entity/PresetMod';
import { Mod } from '@app/db/entity/Mod';
import { ModPresetType } from '@dto/PublicFullUserDTO';

export default function(mods: (PresetMod | Mod)[], type: 'mod' | 'preset'): ModPresetType {
  return mods.map((mod) => {
    return {
      ...mod,
      type
    }
  });
}