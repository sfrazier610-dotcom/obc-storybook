/* Locks the eight accessibility fixes that must not drift.
   Run: node scripts/check_a11y_eight.mjs */
import fs from 'fs';
import assert from 'assert';

const story = fs.readFileSync(new URL('../storybook/index.html', import.meta.url), 'utf8');
const ritual = fs.readFileSync(new URL('../storybook/match-ritual.js', import.meta.url), 'utf8');
const shared = fs.readFileSync(new URL('../storybook/quiet-shared.js', import.meta.url), 'utf8');
const nav = fs.readFileSync(new URL('../professional/nav.js', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../shared/app.js', import.meta.url), 'utf8');

for (const name of ['age', 'format', 'setting', 'office', 'gender']) {
  assert.equal(story.includes(`name="${name}"`) && story.includes(`name="${name}" value=`) , true, name);
  assert.equal(new RegExp(`name="${name}"[^>]*checked`).test(story), false, name + ' is prechecked');
}
assert.equal(story.includes('id="pr" aria-live'), false);
assert.equal(story.includes('id="chapter-status" aria-live="polite"'), true);
assert.equal(story.includes('function pageNavFocused'), true);
assert.equal(story.includes("t.closest('#prev,#next,.mnav .tbtn')"), true);
assert.equal(story.includes('setUnfurl'), true);
assert.equal(story.includes('panel.inert=true'), true);
assert.equal(story.includes("note.setAttribute('aria-modal','true')"), true);
assert.equal(story.includes('setNoteInert'), true);
assert.equal(story.includes('href="/professional/request-appointment.html"'), true);
assert.equal(story.includes('href="/professional/intake.html"'), false);
assert.equal(shared.includes('Request an appointment with'), true);
assert.equal(shared.includes('/professional/intake.html'), false);
assert.equal(ritual.includes("setRadio('age','adult')"), false);
assert.equal(ritual.includes('if(!stepOk(qi))'), true);
assert.equal(nav.includes("e.key!=='Escape'"), true);
assert.equal(app.includes("e.key!=='Escape'"), true);
assert.equal(app.includes('/professional/request-appointment.html'), true);
assert.equal(app.includes('/professional/intake.html'), false);
console.log('a11y eight checks passed');
