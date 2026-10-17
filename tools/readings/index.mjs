/**
 * What to study, unit by unit, for the degrees whose catalog only says "use the
 * primary resource". Each entry names the lectures, chapters or sections that
 * cover the unit and links to them; tools/import-atlas.mjs writes them into the
 * catalog. Only the importer and the tests read these files, so they are not
 * shipped to the app.
 *
 *   READINGS[degree-slug][course-key][unit order] = { url, where }
 */
import { MATH_READINGS } from './math.mjs';
import { PHYS_READINGS } from './phys.mjs';
import { EE_READINGS } from './ee.mjs';
import { ME_READINGS } from './me.mjs';

export const READINGS = {
  mathematics: MATH_READINGS,
  physics: PHYS_READINGS,
  'electrical-engineering': EE_READINGS,
  'mechanical-engineering': ME_READINGS,
};
