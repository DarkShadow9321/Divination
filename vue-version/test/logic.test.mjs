import assert from 'node:assert/strict';
import { hexagramMap, validateHexagrams, calculateResult, createLine } from '../src/divination.js';
assert.equal(validateHexagrams(), true, '必須包含不重複的 64 卦');
assert.equal(hexagramMap['010001'].number, 3);
assert.equal(hexagramMap['010100'].number, 39);
assert.equal(hexagramMap['110111'].fullName, '風天小畜');
assert.equal(hexagramMap['010101'].number, 63);
for (const sum of [6,7,8,9]) {
  const original = sum === 7 || sum === 9 ? 1 : 0;
  const changed = sum === 6 ? 1 : sum === 9 ? 0 : original;
  const simulated = {original,changed,moving:sum === 6 || sum === 9};
  const result = calculateResult(Array(6).fill(simulated));
  assert.equal(result.base, String(original).repeat(6));
  assert.equal(result.changed, String(changed).repeat(6));
}
for (let i=0;i<1000;i++) {
  const line=createLine();
  assert.ok([6,7,8,9].includes(line.sum));
  assert.equal(line.coins.length,3);
  assert.equal(line.moving, line.sum===6 || line.sum===9);
}
console.log('通過：64 卦完整性、老陰少陰少陽老陽變化、1000 次擲幣資料檢查');
