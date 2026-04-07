// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_red_firebird.sql';
import m0001 from './0001_charming_thunderball.sql';
import m0002 from './0002_married_dormammu.sql';
import m0003 from './0003_flashy_invisible_woman.sql';
import m0004 from './0004_worthless_human_fly.sql';
import m0005 from './0005_slimy_otto_octavius.sql';
import m0006 from './0006_eminent_human_robot.sql';
import m0007 from './0007_huge_makkari.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003,
m0004,
m0005,
m0006,
m0007
    }
  }
  