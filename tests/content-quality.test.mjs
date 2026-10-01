import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('company attribution avoids unrelated Astro hardware, fruit and previously sold IP', () => {
  const context = vm.createContext({ URL, document: {}, window: {} });
  vm.runInContext(read('../js/coverage.js') + '\n' + read('../js/compare.js'), context);
  const matches = context.companyMatchesArticle;
  assert.equal(matches({ id: 'astro', name: '泰偉電子', enName: 'Astro Corp.' }, { title: '羅技推出 Astro 遊戲耳機' }), false);
  assert.equal(matches({ id: 'astro', name: '泰偉電子', enName: 'Astro Corp.' }, { title: '泰偉電子發布營運訊息' }), true);
  assert.equal(matches({ id: 'gamania', name: '橘子', enName: 'Gamania' }, { title: '橘子價格上漲' }), false);
  assert.equal(matches({ id: 'softstar', name: '大宇資訊', enName: 'Softstar' }, { title: '仙劍新遊戲上市' }), false);
  assert.equal(matches({ id: 'ecpay', name: '綠界科技', enName: 'ECPay' }, { title: 'ECPay 推出金流服務' }), true);
});

test('counter animation cannot overwrite a newer dataset count', () => {
  let callback;
  const context = vm.createContext({ document: { addEventListener() {} }, window: { requestAnimationFrame(fn) { callback = fn; } } });
  vm.runInContext(read('../js/animations.js'), context);
  const counter = { getAttribute: () => '1800', textContent: '0' };
  context.animateValue(counter, 0, 0, 2000);
  callback(100);
  assert.equal(counter.textContent, '1,800');
});
