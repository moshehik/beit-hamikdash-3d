// כותב assets/icons/_map.json: אימוג'י → מפתח איקון, וכינויים (alias) למפתחות. נקרא ע"י tools/pack-icons.py.   node tools/icons-map.cjs
const fs = require('fs'), p = require('path');
const { SHEETS, ALIAS } = require('./icons-catalog.cjs');
const emoji = {};
for (const sh of SHEETS) for (const it of sh.items) if (it.emo) emoji[it.emo.replace(/\uFE0F/g, '')] = it.key;
// אימוג'ים שיש להם כבר איקון חימר ב-UI_ICONS (src/ui_icons.js) או איקון פעולה
Object.assign(emoji, { '🕍': 'har', '🕎': 'tours', '🚶': 'walk', '🗺': 'map', '🧒': 'kids', '🏠': 'home', '🎵': 'music', '🧔': 'kohanim', '🏙': 'yerushalayim', '✨': 'heichal', '📦': 'kodesh', '🐑': 'tag_olat-behema_0',
  '🎲': 'tag_ketoret_0', '🥄': 'tag_ketoret_2', '🔔': 'tag_ketoret_4', '🧹': 'tag_ketoret_5', '💨': 'tag_ketoret_7', '🌫': 'tag_ketoret_8', '🙌': 'tag_ketoret_11', '🧽': 'tag_menorah_1', '🥣': 'tag_minchat-solet_1', '🧂': 'tag_olat-behema_7',
  '✋': 'tag_olat-behema_1', '🔪': 'tag_olat-behema_2', '🩸': 'tag_olat-behema_3', '🪝': 'tag_olat-behema_5', '⬆': 'tag_olat-behema_8', '⬇': 'tag_olat-behema_10', '🔑': 'tag_tamid-shachar_1', '🏃': 'tag_tamid-shachar_5', '🪵': 'tag_tamid-shachar_8',
  '🗝': 'tag_tamid-shachar_14', '🎺': 'tag_tamid-shachar_15', '🧼': 'tag_tamid-shachar_22', '🧍': 'tag_tamid-shachar_23', '🙏': 'tag_tamid-shachar_24', '✅': 'tag_tamid-shachar_27', '↪': 'tag_olat-haof_2', '🤏': 'tag_olat-haof_3' });
const keys = [];
for (const sh of SHEETS) for (const it of sh.items) keys.push(it.key);
fs.writeFileSync(p.join(__dirname, '..', 'assets', 'icons', '_map.json'), JSON.stringify({ emoji, alias: ALIAS, keys }, null, 1));
console.log('emoji mappings:', Object.keys(emoji).length, 'aliases:', Object.keys(ALIAS).length, 'keys:', keys.length);
