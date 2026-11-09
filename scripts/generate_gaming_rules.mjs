import fs from 'node:fs';
import gaming from '../js/gaming.js';
const file = new URL('../config/monitoring_rules.json', import.meta.url);
const config = JSON.parse(fs.readFileSync(file, 'utf8'));
config.version = gaming.version;
for (const incoming of gaming.rules) {
    const existing = config.rules.find(rule => rule.id === incoming.id);
    if (existing) Object.assign(existing, incoming); else config.rules.push(incoming);
    if (!config.automatic_publication_rule_ids.includes(incoming.id)) config.automatic_publication_rule_ids.push(incoming.id);
}
const platform = config.rules.find(rule => rule.id === 'industry-game-platform');
const international = config.rules.find(rule => rule.id === 'competitor-global-game');
international.required_any_groups[1] = [...new Set([...international.required_any_groups[1].filter(term => !['人人', '傳奇'].includes(term)), '人人遊戲', '人人游戏', '傳奇網路'])];
platform.required_any_groups[0] = ['遊戲', '游戏'];
platform.required_any_groups[1] = platform.required_any_groups[1].filter(term => !['玩家', '會員', '粉絲經營', '放置', '女性向', '博弈', '區塊鏈', '二次元'].includes(term));
platform.scope_note = '遊戲語境＋明確平台／技術詞；玩家、會員與遊戲類型只作輔助標籤';
const approval = config.rules.find(rule => rule.id === 'industry-cn-game-approval');
approval.required_any_groups[0] = [...new Set([...approval.required_any_groups[0], '遊戲審批撤銷', '游戏审批撤销'])];
approval.required_any_groups[1] = [...new Set([...approval.required_any_groups[1], ...gaming.products.flatMap(([, aliases]) => aliases)])];
for (const folder of config.folders.filter(folder => ['folder_3', 'folder_4'].includes(folder.id))) folder.region_scope = [...new Set([...folder.region_scope, 'CN_HK_MAC', 'JP', 'KR', 'GLOBAL'])];
const compact = value => '{\n' + Object.entries(value).map(([key,item]) => `  ${JSON.stringify(key)}: ` + (['rules','folders','sources'].includes(key) && Array.isArray(item) ? '[\n'+item.map(row=>'    '+JSON.stringify(row)).join(',\n')+'\n  ]' : JSON.stringify(item))).join(',\n') + '\n}\n';
fs.writeFileSync(file, compact(config));
const sourceFile = new URL('../config/fintech_media_sources.json',import.meta.url);
fs.writeFileSync(sourceFile,compact(JSON.parse(fs.readFileSync(sourceFile,'utf8'))));
const quote = value => "'" + String(value).replaceAll("'", "''") + "'";
const sql = ['-- Gaming v2: idempotent rule updates; preserve articles and manual review.'];
for (const rule of config.rules) {
    const columns = ['id','folder_id','scope','any_of_json','all_of_json','exclude_any_json','version','auto_publish','auto_publish_allowed_terms_json','active'];
    const values = [rule.id,rule.folder_id,rule.scope,JSON.stringify(rule.required_any_groups[0]),JSON.stringify(rule.required_any_groups[1] || []),JSON.stringify([...new Set([...(config.global_exclude_any || []), ...(rule.exclude_any || [])])]),config.version,config.automatic_publication_rule_ids.includes(rule.id)?1:0,JSON.stringify(config.automatic_publication_allowed_terms?.[rule.id] || []),1];
    sql.push(`INSERT INTO monitoring_rules (${columns.join(',')}) VALUES (${values.map(quote).join(',')}) ON CONFLICT(id) DO UPDATE SET ${columns.slice(1).map(column=>`${column}=excluded.${column}`).join(',')};`);
}
for (const folder of config.folders) sql.push(`UPDATE monitoring_folders SET region_scope_json=${quote(JSON.stringify(folder.region_scope))},version=${quote(config.version)} WHERE id=${quote(folder.id)};`);
fs.writeFileSync(new URL('../worker/migrations/0011_gaming_v2.sql', import.meta.url), sql.join('\n')+'\n');
const wrangler = new URL('../worker/wrangler.jsonc', import.meta.url);
fs.writeFileSync(wrangler, fs.readFileSync(wrangler,'utf8').replace(/"RULES_VERSION":\s*"[^"]+"/, `"RULES_VERSION": "${gaming.version}"`));
console.log(`Generated ${gaming.rules.length} gaming rules and migration ${config.version}`);
