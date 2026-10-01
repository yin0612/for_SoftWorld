import test from 'node:test';
import assert from 'node:assert/strict';
import { domainMatches, verifyItemSource } from './source-verification.mjs';

test('publisher domain boundaries and safe protocols', () => {
  assert.equal(domainMatches('https://ec.ltn.com.tw/a', ['ltn.com.tw']), true);
  for (const url of ['https://ltn.com.tw.evil.test', 'https://ltn.com.tw@evil.test', 'javascript:alert(1)']) {
    assert.equal(domainMatches(url, ['ltn.com.tw']), false);
  }
});
test('Google and RSS retain different provenance checks', () => {
  const source = { domains: ['udn.com'] };
  const item = { link: 'https://news.google.com/rss/articles/test', publisherName: '聯合新聞網', publisherUrl: 'https://udn.com' };
  assert.equal(verifyItemSource(item, source, true), true);
  assert.equal(verifyItemSource({ ...item, publisherUrl: 'https://evil.test' }, source, true), false);
  assert.equal(verifyItemSource({ link: 'https://udn.com/news/a' }, source), true);
  assert.equal(verifyItemSource(item, source), false);
});
