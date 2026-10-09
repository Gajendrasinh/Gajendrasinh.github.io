// The inline syntax used in content strings, and the guarantee that content cannot inject markup.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esc, fill, rich } from '../src/templates/helpers.mjs';

const tokens = { name: 'Ada Lovelace', github: 'https://github.com/ada' };

test('esc escapes HTML', () => {
  assert.equal(esc('<b>R&D</b> "x"'), '&lt;b&gt;R&amp;D&lt;/b&gt; &quot;x&quot;');
});

test('fill replaces tokens and rejects unknown ones', () => {
  assert.equal(fill('Hi {name}', tokens), 'Hi Ada Lovelace');
  assert.throws(() => fill('Hi {nmae}', tokens), /Unknown token/);
});

test('rich renders muted, gradient and link syntax', () => {
  assert.equal(rich('Things I\'ve *built.*', tokens), 'Things I&#39;ve <span class="serif">built.</span>');
  assert.equal(rich('Hi, I\'m __{name}.__', tokens), 'Hi, I&#39;m <span class="gname">Ada Lovelace.</span>');
  assert.equal(rich('See [GitHub]({github}).', tokens), 'See <a class="inl" href="https://github.com/ada" target="_blank" rel="noopener">GitHub</a>.');
  assert.equal(rich('Full Stack *&* AI', tokens, { mutedTag: 'i' }), 'Full Stack <i>&amp;</i> AI');
});

test('rich never lets content inject markup', () => {
  assert.equal(rich('<script>alert(1)</script>', tokens), '&lt;script&gt;alert(1)&lt;/script&gt;');
});
