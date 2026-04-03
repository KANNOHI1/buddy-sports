const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlPath = path.resolve(__dirname, '../index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

function getModuleScript(source) {
  const match = source.match(/<script type="module">([\s\S]*?)<\/script>/);
  if (!match) {
    throw new Error('Could not find module script in buddy_sports_guide.html');
  }
  return match[1];
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function assertMatches(pattern, message) {
  assert.match(html, pattern, message);
}

function assertCardFee(title, label, value) {
  const pattern = new RegExp(
    `<h3>${escapeRegex(title)}</h3>[\\s\\S]*?<span class="fn">${escapeRegex(label)}</span><span class="fv">${escapeRegex(value)}</span>`
  );
  assertMatches(pattern, `${title} の ${label} が ${value} であること`);
}

function loadBusBadgeApi(scriptSource) {
  const normalizeTextSource = scriptSource.match(/function normalizeText\(text\) \{[\s\S]*?\n\}/)?.[0];
  const shouldShowBusBadgeSource = scriptSource.match(/function shouldShowBusBadge\(age, badge\) \{[\s\S]*?\n\}/)?.[0];
  const syncBusBadgeSource = scriptSource.match(/function syncBusBadgeWithAge\(age, badge\) \{[\s\S]*?\n\}/)?.[0];

  if (!normalizeTextSource || !shouldShowBusBadgeSource || !syncBusBadgeSource) {
    throw new Error('Could not extract bus badge helpers from module script');
  }

  const context = vm.createContext({});
  const script = new vm.Script(`
    ${normalizeTextSource}
    ${shouldShowBusBadgeSource}
    ${syncBusBadgeSource}
    globalThis.__busBadgeTest = { shouldShowBusBadge, syncBusBadgeWithAge };
  `);
  script.runInContext(context);
  return context.__busBadgeTest;
}

function createBadge(text, className = 'bus bus-y') {
  const attrs = new Map();
  return {
    className,
    textContent: text,
    style: {},
    get innerText() {
      return this.textContent;
    },
    getAttribute(name) {
      return attrs.has(name) ? attrs.get(name) : null;
    },
    setAttribute(name, value) {
      attrs.set(name, String(value));
    },
    hasAttribute(name) {
      return attrs.has(name);
    }
  };
}

function testStaticContent() {
  assertMatches(/\.control-select\s*\{[\s\S]*?max-width:220px;/, 'control-select に max-width:220px が必要');
  assertMatches(/<span class="info-box-title">費用・月謝について（共通）<\/span>/, 'info-box の h2 絵文字は削除されているべき');
  assertMatches(/<span class="info-box-title">クラブとスクールの違い<\/span>/, 'info-box のタイトルはテキストのみであるべき');
  assertMatches(/<span class="info-box-indicator" aria-hidden="true">▶<\/span>/, 'accordion のデフォルトインジケーターは ▶');
  assertMatches(
    /\.info-box-content\s*\{[\s\S]*?max-height:0;[\s\S]*?transition:max-height 0\.25s ease, padding-bottom 0\.25s ease;/,
    'accordion は max-height アニメーションで開閉するべき'
  );
  assertMatches(
    /<li><strong>送迎バス（シャトルバス）<\/strong>：小学生以上対象。停留所は①お台場海浜公園駅・②豊洲駅。幼児は対象外。<\/li>/,
    'クラブとスクールの違いに送迎バスの説明が必要'
  );
}

function testMonthlyFees() {
  assertCardFee('⚽ バディクラブ サッカー', '小学生週2回A（1・2年のみ）/ B', '¥17,050 / ¥13,200');
  assertCardFee('⚽ バディクラブ サッカー', '小学生週3回A / B', '¥20,350 / ¥16,500');
  assertCardFee('🤸 バディクラブ 器械体操', '小学生一般 週1A/B', '¥13,750 / ¥9,900');
  assertCardFee('🤸 バディクラブ 器械体操', '小学生一般 週2A/B', '¥17,050 / ¥13,200');
  assertCardFee('🏀 バディクラブ バスケットボール', '小学生 週1A/B', '¥13,750 / ¥9,900');
  assertCardFee('🏀 バディクラブ バスケットボール', '小学生 週2A/B', '¥17,050 / ¥13,200');
  assertCardFee('🏀 バディクラブ バスケットボール', '小学生 週3A/B', '¥20,350 / ¥16,500');
  assertCardFee('🏃 バディクラブ 陸上競技', '小学生 週1A/B', '¥13,750 / ¥9,900');
  assertCardFee('🏃 バディクラブ 陸上競技', '小学生 週2A/B', '¥17,050 / ¥13,200');
  assertCardFee('🏃 バディクラブ 陸上競技', '小学生 週3A/B', '¥20,350 / ¥16,500');
  assertCardFee('🥋 バディクラブ 柔道', '小学生 週1A/B', '¥13,750 / ¥9,900');
  assertCardFee('🥋 バディクラブ 柔道', '小学生 週2A/B', '¥17,050 / ¥13,200');
  assertCardFee('⚾ バディクラブ 野球', '小学生 週1A/B', '¥15,070 / ¥11,220');
  assertCardFee('🧗 バディクラブ ボルダリング', '小学生 週1A', '¥18,910');
  assertCardFee('🧗 バディクラブ ボルダリング', '小学生 週2A/B', '¥26,110 / ¥22,260');
  assertCardFee('🧗 バディクラブ ボルダリング', '小学生 週3A/B', '¥33,310 / ¥29,460');
  assertCardFee('🏐 バディクラブ ドッジボール', '小学生 週1A/B', '¥13,750 / ¥9,900');
}

function testModuleWiring() {
  const moduleScript = getModuleScript(html);

  assert.match(moduleScript, /function setInfoBoxOpen\(box, open\)/, 'accordion 開閉関数が必要');
  assert.match(moduleScript, /indicator\.textContent = open \? '▼' : '▶';/, 'accordion のインジケーター切替が必要');
  assert.match(moduleScript, /content\.style\.maxHeight = open \? `\$\{content\.scrollHeight\}px` : '0px';/, 'accordion は max-height を更新するべき');
  assert.match(moduleScript, /initializeInfoBoxes\(\);/, 'module script で accordion 初期化を呼ぶべき');
  assert.match(
    moduleScript,
    /window\.addEventListener\('resize', \(\) => \{\s*infoBoxes[\s\S]*?content\.style\.maxHeight = `\$\{content\.scrollHeight\}px`;/,
    '開いている accordion は resize 時に max-height を再計算するべき'
  );

  const applyAgeFilterMatch = moduleScript.match(/function applyAgeFilter\(\) \{[\s\S]*?\n\}/);
  assert.ok(applyAgeFilterMatch, 'applyAgeFilter が見つからない');
  assert.match(
    applyAgeFilterMatch[0],
    /card\.querySelectorAll\('\.bus'\)\.forEach\(\(badge\) => \{\s*syncBusBadgeWithAge\(age, badge\);\s*\}\);/,
    'applyAgeFilter はバスバッジの見た目を age filter と連動させるべき'
  );
}

function testBusBadgeBehavior() {
  const api = loadBusBadgeApi(getModuleScript(html));
  const badge = createBadge('🚌 バスあり（1〜3年生 B・Cエリア）');

  api.syncBusBadgeWithAge('semi', badge);
  assert.equal(badge.className, 'bus bus-n', '幼児フィルタ時は bus-n に切り替えるべき');
  assert.equal(badge.textContent, 'バスなし（小学生以上対象）', '幼児フィルタ時は文言を差し替えるべき');
  assert.equal(badge.style.display, '', '差し替え時はバッジを表示したままにするべき');

  api.syncBusBadgeWithAge('elementary', badge);
  assert.equal(badge.className, 'bus bus-y', '小学生フィルタ時は元の class に戻るべき');
  assert.equal(badge.textContent, '🚌 バスあり（1〜3年生 B・Cエリア）', '小学生フィルタ時は元の文言に戻るべき');
  assert.equal(badge.style.display, '', '小学生フィルタ時は表示されるべき');

  api.syncBusBadgeWithAge('all', badge);
  assert.equal(badge.className, 'bus bus-y', 'all でも元の class を維持するべき');
  assert.equal(badge.textContent, '🚌 バスあり（1〜3年生 B・Cエリア）', 'all でも元の文言を維持するべき');

  // 「高学年」バッジ: 幼児フィルタ時は非表示
  const badgeHighGrade = createBadge('🚌 バスあり（高学年 シャトルバス①お台場 ②豊洲）');
  api.syncBusBadgeWithAge('junior', badgeHighGrade);
  assert.equal(badgeHighGrade.style.display, 'none', '幼児フィルタ時は高学年バッジを非表示にするべき');

  // 「高学年」バッジ: 小学生フィルタ時は表示
  api.syncBusBadgeWithAge('elementary', badgeHighGrade);
  assert.equal(badgeHighGrade.style.display, '', '小学生フィルタ時は高学年バッジを表示するべき');
}

function main() {
  testStaticContent();
  testMonthlyFees();
  testModuleWiring();
  testBusBadgeBehavior();
  console.log('buddy_sports_guide regression tests passed');
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
