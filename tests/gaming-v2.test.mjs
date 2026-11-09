import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import gaming from '../js/gaming.js';
import {configuredRules,evaluateRule} from '../worker/src/rule-engine.mjs';
import {backfillArticle,backfillSql} from '../scripts/reclassify_gaming.mjs';
const config=JSON.parse(fs.readFileSync(new URL('../config/monitoring_rules.json',import.meta.url),'utf8'));
const rules=configuredRules(config);
const cases=[
    ['中國9月國產遊戲版號公布，同批進口遊戲獲批','approval','domestic'],
    ['YouTube推出遊戲角落Playables，提供免下載遊戲','platform','instant'],
    ['紅心辣椒代理《無職轉生 迴響編年史》開放事前預約','competitor','new'],
    ['Gravity授權《RO仙境傳說：口袋戰記》台港澳正式上市','competitor','new'],
    ['Gravity申請《RO仙境傳說城堡》新商標','competitor','ip'],
    ['昱泉國際代理《我在三國當村長》展開公測','competitor','new'],
    ['Google與Apple因App內第三方支付限制遭韓國裁罰','platform','policy'],
    ['中國10月國產遊戲版號及進口遊戲審批公布','approval','import'],
    ['Apple宣布台灣App Store抽成由30%降至26%','platform','policy'],
    ['Nexon公開《天翼之鍊MOBILE》並於韓國開放測試報名','competitor','new'],
    ['LYTO首度公開《RO仙境傳說城堡》，預計2027年Q2推出','competitor','new'],
    ['Gravity公開RAGLAND玩家創作平台，提供免寫程式工具','platform','ugc'],
    ['Game Tech公開網頁服務RO PlayZone，預計明年試營運','platform','instant']
];
test('13 requested scenarios enter the gaming page and their detailed filters',()=>{
    for(const [title,parent,topic] of cases){
        const hits=rules.filter(rule=>evaluateRule({title},rule).matched).map(rule=>rule.id);
        const article={title,ruleIds:hits};
        assert.ok(hits.some(id=>gaming.allRuleIds.includes(id)),title);
        assert.ok(gaming.classify(article).parents.includes(parent),title);
        assert.ok(gaming.matches(article,{mode:parent,topic}),title);
    }
});
test('unknown games are discoverable without becoming high-grossing games; ambiguity is rejected',()=>{
    const good='全新MMORPG手遊《陌生星球》開放事前預約';
    const hit=rules.filter(rule=>evaluateRule({title:good},rule).matched).map(rule=>rule.id);
    assert.ok(hit.includes('industry-game-release'));
    assert.equal(gaming.matches({title:good,ruleIds:hit},{mode:'all',topic:'new'}),true);
    assert.equal(gaming.classify({title:good,ruleIds:hit}).parents.includes('mobile'),false);
    for(const title of ['Apple發表新手機','Apple Pay信用卡優惠','無職轉生動畫新篇公開','詭秘之主小說公開','現代坦克軍事測試','餐廳開放事前預約','無程式碼辦公工具推出','人人都在討論這款遊戲','玩家用遊戲麥克風演奏神曲','標籤: Xbox遊戲','討論牆 | YouTube遊戲角落']) {
        const hits=rules.filter(rule=>gaming.allRuleIds.includes(rule.id)&&evaluateRule({title},rule).matched);
        assert.equal(hits.length,0,title);
    }
});
test('planned launch, recruitment and geographical mentions retain their meaning',()=>{
    const result=gaming.classify({title:'Nexon公開《天翼之鍊MOBILE》韓國測試報名，預計明年正式上市',ruleIds:['competitor-game-event']});
    assert.ok(result.events.includes('recruit')); assert.ok(result.events.includes('planned')); assert.ok(!result.events.includes('launch'));
    assert.deepEqual(result.markets,['韓國']);
    const google=gaming.classify({title:'RAGLAND首次曝光',excerpt:'台灣正式上市',sourceKind:'google_news_rss'});
    assert.ok(!google.events.includes('launch')); assert.deepEqual(google.markets,[]);
    assert.ok(!google.topics.includes('new')); assert.ok(google.events.includes('serviceAnnounce'));
});
test('snapshot and D1 backfill preserve approvals, provenance and reject protection',()=>{
    const row={id:'old',title:cases[8][0],source_id:'technews',review_status:'approved',rule_ids:'industry-platform-business',folder_ids:'folder_4',published_at:'2026-10-30T00:00:00Z'};
    const source=JSON.parse(fs.readFileSync(new URL('../config/core_media_sources.json',import.meta.url),'utf8')).sources.find(s=>s.enabled&&s.auto_publish&&s.region==='TW');
    row.source_id=source.id;
    assert.ok(backfillArticle(row).rule_ids.includes('industry-game-store-policy'));
    assert.match(backfillSql([row]),/ON CONFLICT\(article_id,rule_id\) DO NOTHING/);
    assert.equal(backfillArticle({...row,review_status:'rejected'}),null);
});
test('frontend keeps all five modes and includes new thematic rules',()=>{
    const context=vm.createContext({document:{addEventListener(){}},window:{GamingMonitoring:gaming},console});
    vm.runInContext(fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8'),context);
    for(const id of gaming.allRuleIds) assert.equal(context.isGamingMonitoringArticle({ruleIds:[id],title:'有效文章'}),true,id);
    assert.equal(context.isGamingMonitoringArticle({ruleIds:['industry-game-platform'],title:'標籤: Xbox雲端遊戲'}),false);
    assert.deepEqual(Object.keys(gaming.parentRules),['softworld','competitor','mobile','platform','approval']);
    for(const definition of gaming.rules) assert.deepEqual(config.rules.find(rule=>rule.id===definition.id).required_any_groups,definition.required_any_groups);
});
test('exact same-day syndicated headlines group without merging products, markets or lifecycle events',()=>{
    const rows=gaming.groupArticles([
        {title:'《RO 仙境傳說》首度公開專屬連動計畫「RO PlayZone」',date:'2026-11-07',url:'https://original.test/a',sourceKind:'official_rss',ruleIds:['industry-game-product']},
        {title:'《RO仙境傳說》首度公開專屬連動計畫「RO PlayZone」- 遊戲新聞',date:'2026-11-07',url:'https://syndication.test/a',sourceKind:'google_news_rss',ruleIds:['industry-game-instant']},
        {title:'《RO仙境傳說城堡》開放事前預約',date:'2026-11-07',url:'https://original.test/b'},
        {title:'《RO仙境傳說城堡》正式上市',date:'2026-11-07',url:'https://original.test/c'}
    ]);
    assert.equal(rows.length,3); assert.equal(rows[0].relatedReports.length,1); assert.equal(rows[0].sourceKind,'official_rss');
    assert.ok(rows[0].ruleIds.includes('industry-game-instant'));
});
