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

function loadInfoBoxApi(scriptSource, { infoBoxes = [] } = {}) {
  const setInfoBoxOpenSource = scriptSource.match(/function setInfoBoxOpen\(box, open\) \{[\s\S]*?\n\}/)?.[0];
  const initializeInfoBoxesSource = scriptSource.match(/function initializeInfoBoxes\(\) \{[\s\S]*?\n\}/)?.[0];
  if (!setInfoBoxOpenSource || !initializeInfoBoxesSource) {
    throw new Error('Could not extract info box helpers from module script');
  }

  const context = vm.createContext({ infoBoxes });
  const script = new vm.Script(`
    ${setInfoBoxOpenSource}
    ${initializeInfoBoxesSource}
    globalThis.__infoBoxTest = { setInfoBoxOpen, initializeInfoBoxes };
  `);
  script.runInContext(context);
  return context.__infoBoxTest;
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
  assertMatches(
    /\.control-bar\s*\{[\s\S]*?justify-content:flex-start;/,
    'control-bar should justify filters from the start'
  );
  assertMatches(
    /\.control-group\s*\{[\s\S]*?flex:0 0 auto;/,
    'control-group should not stretch filter blocks'
  );
  assertMatches(/\.control-select\s*\{[\s\S]*?max-width:220px;/, 'control-select に max-width:220px が必要');
  assertMatches(/<span class="info-box-title">費用・月謝について（共通）<\/span>/, 'info-box の h2 絵文字は削除されているべき');
  assertMatches(/<span class="info-box-title">クラブとスクールの違い<\/span>/, 'info-box のタイトルはテキストのみであるべき');
  assertMatches(/class="info-box-indicator"/, 'accordion のインジケーター要素が存在する');
  assertMatches(
    /\.info-box-content\s*\{[\s\S]*?max-height:0;[\s\S]*?transition:max-height 0\.25s ease, padding-bottom 0\.25s ease;/,
    'accordion は max-height アニメーションで開閉するべき'
  );
  assertMatches(
    /<li><strong>送迎バス（シャトルバス）<\/strong>：小学生以上対象。停留所は①お台場海浜公園駅・②豊洲駅。幼児は対象外。<\/li>/,
    'クラブとスクールの違いに送迎バスの説明が必要'
  );
}

function testMobileFilterLayout() {
  assertMatches(
    /@media \(max-width: 767px\)\s*\{[\s\S]*?\.control-bar\{[\s\S]*?align-items:center[\s\S]*?\}/,
    'mobile control-bar should vertically center wrapped filters'
  );
  assertMatches(
    /@media \(max-width: 767px\)\s*\{[\s\S]*?\.control-group\{[\s\S]*?flex:1 1 calc\(50% - 4px\);[\s\S]*?\}/,
    'mobile control-group should use two-column layout'
  );
  assertMatches(
    /@media \(max-width: 767px\)\s*\{[\s\S]*?\.control-group select\{[\s\S]*?min-width:0;[\s\S]*?width:100%[\s\S]*?\}/,
    'mobile control-group select should keep a constrained full-width layout'
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
  assert.match(moduleScript, /box\.classList\.toggle\('is-open'/, 'accordion の開閉は is-open クラスで制御する');
  assert.match(moduleScript, /content\.style\.maxHeight = open \? `\$\{content\.scrollHeight \+ 32\}px` : '0px';/, 'accordion は max-height を更新するべき');
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

function testInfoBoxOpenBehavior() {
  const api = loadInfoBoxApi(getModuleScript(html));
  const attrs = new Map();
  const toggle = {
    setAttribute(name, value) {
      attrs.set(name, String(value));
    }
  };
  const content = {
    scrollHeight: 120,
    style: {}
  };
  const indicator = {};
  const box = {
    classList: {
      toggle() {}
    },
    querySelector(selector) {
      if (selector === '.info-box-toggle') return toggle;
      if (selector === '.info-box-content') return content;
      if (selector === '.info-box-indicator') return indicator;
      return null;
    }
  };

  api.setInfoBoxOpen(box, true);
  assert.equal(content.style.maxHeight, '152px', 'info-box open 時は下余白ぶんを max-height に含める');
  assert.equal(attrs.get('aria-expanded'), 'true', 'info-box open 時は aria-expanded=true にする');

  api.setInfoBoxOpen(box, false);
  assert.equal(content.style.maxHeight, '0px', 'info-box close 時は max-height を 0px に戻す');
  assert.equal(attrs.get('aria-expanded'), 'false', 'info-box close 時は aria-expanded=false にする');
}

function testInfoBoxesToggleTogether() {
  const createMockBox = (scrollHeight = 120) => {
    const attrs = new Map();
    const listeners = new Map();
    const classes = new Set();
    const toggle = {
      setAttribute(name, value) {
        attrs.set(name, String(value));
      },
      addEventListener(type, handler) {
        listeners.set(type, handler);
      },
      click() {
        const handler = listeners.get('click');
        if (handler) handler();
      }
    };
    const content = {
      scrollHeight,
      style: {},
      id: ''
    };
    const indicator = {};
    const box = {
      classList: {
        toggle(name, force) {
          if (force) {
            classes.add(name);
            return true;
          }
          classes.delete(name);
          return false;
        },
        contains(name) {
          return classes.has(name);
        }
      },
      querySelector(selector) {
        if (selector === '.info-box-toggle') return toggle;
        if (selector === '.info-box-content') return content;
        if (selector === '.info-box-indicator') return indicator;
        return null;
      }
    };

    return { attrs, box, content, toggle };
  };

  const first = createMockBox(100);
  const second = createMockBox(140);
  const api = loadInfoBoxApi(getModuleScript(html), { infoBoxes: [first.box, second.box] });

  api.initializeInfoBoxes();

  first.toggle.click();
  assert.equal(first.box.classList.contains('is-open'), true, '1つ目の toggle クリックで1つ目が開く');
  assert.equal(second.box.classList.contains('is-open'), true, '1つ目の toggle クリックで2つ目も開く');
  assert.equal(first.content.style.maxHeight, '132px', '1つ目は open 時の高さになる');
  assert.equal(second.content.style.maxHeight, '172px', '2つ目も open 時の高さになる');
  assert.equal(first.attrs.get('aria-expanded'), 'true', '1つ目の aria-expanded が true になる');
  assert.equal(second.attrs.get('aria-expanded'), 'true', '2つ目の aria-expanded も true になる');

  first.toggle.click();
  assert.equal(first.box.classList.contains('is-open'), false, '再クリックで1つ目が閉じる');
  assert.equal(second.box.classList.contains('is-open'), false, '再クリックで2つ目も閉じる');
  assert.equal(first.content.style.maxHeight, '0px', '1つ目は close 時の高さに戻る');
  assert.equal(second.content.style.maxHeight, '0px', '2つ目も close 時の高さに戻る');
  assert.equal(first.attrs.get('aria-expanded'), 'false', '1つ目の aria-expanded が false に戻る');
  assert.equal(second.attrs.get('aria-expanded'), 'false', '2つ目の aria-expanded も false に戻る');
}

function testBusBadgeBehavior() {
  const api = loadBusBadgeApi(getModuleScript(html));
  const badge = createBadge('🚌 バスあり（1〜3年生 B・Cエリア）');

  api.syncBusBadgeWithAge('semi', badge);
  assert.equal(badge.style.display, 'none', '幼児フィルタ時はバスバッジを非表示にするべき');

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
  testMobileFilterLayout();
  testMonthlyFees();
  testModuleWiring();
  testInfoBoxOpenBehavior();
  testInfoBoxesToggleTogether();
  testBusBadgeBehavior();
  console.log('buddy_sports_guide regression tests passed');
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
