<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import { createLine, calculateResult, describeHex, coinImages, yaoNames, validateHexagrams } from './divination.js';

const question = ref('');
const shellImage = `${import.meta.env.BASE_URL}image/shell.webp`;
const sessionQuestion = ref('');
const lines = ref([]);
const tossing = ref(false);
const coinImage = ref('');
const status = ref('點擊龜殼，開始擲初爻（共六次）');
const stageTitle = ref('準備起卦');
let sessionId = 0;
let pendingTimer = null;
const result = computed(() => calculateResult(lines.value));
const locked = computed(() => lines.value.length > 0 || tossing.value);
const finished = computed(() => lines.value.length === 6);
const historyTopDown = computed(() => [...lines.value].map((line,index) => ({...line,index})).reverse());

if (!validateHexagrams()) console.error('六十四卦資料不完整！');
function tossNext() {
  if (tossing.value || finished.value) return;
  const id = sessionId;
  const currentIndex = lines.value.length;
  if (currentIndex === 0) sessionQuestion.value = question.value.trim();
  tossing.value = true;
  coinImage.value = '';
  stageTitle.value = `正在擲${yaoNames[currentIndex]}`;
  status.value = '搖動龜殼中……';
  pendingTimer = setTimeout(() => {
    pendingTimer = null;
    if (sessionId !== id) return;
    const line = createLine();
    lines.value = [...lines.value, line];
    tossing.value = false;
    coinImage.value = `${import.meta.env.BASE_URL}${coinImages[line.coins].replace(/^\//, '')}`;
    status.value = `${yaoNames[currentIndex]}：${line.coins} → ${line.kind}${line.moving ? '（動爻）' : ''}`;
    if (lines.value.length === 6) {
      stageTitle.value = '六爻完成';
      status.value += '。已完成起卦，請查看下方卦象。';
    } else {
      stageTitle.value = `已完成 ${lines.value.length} / 6 爻`;
      status.value += `。請再次點擊龜殼，擲${yaoNames[lines.value.length]}。`;
    }
  }, 850);
}
function resetToss() {
  sessionId++;
  if (pendingTimer !== null) clearTimeout(pendingTimer);
  pendingTimer = null;
  tossing.value = false;
  lines.value = [];
  question.value = '';
  sessionQuestion.value = '';
  coinImage.value = '';
  stageTitle.value = '準備起卦';
  status.value = '點擊龜殼，開始擲初爻（共六次）';
}
onBeforeUnmount(() => { sessionId++; if (pendingTimer !== null) clearTimeout(pendingTimer); });
function lineClass(bit, index) {
  return ['hex-line', bit === '1' ? 'yang' : 'yin', result.value.movingIndices.includes(5-index) ? 'changed' : ''];
}
</script>

<template>
  <main class="container">
    <h1>六爻卜卦系統</h1>
    <p class="subtitle">三枚銅錢・六次起爻・本卦與變卦</p>
    <label for="question">想問的事情</label>
    <textarea id="question" v-model="question" :disabled="locked" placeholder="把想問的事情輸入，並在點選圖片卜卦時，內心虔誠的念著問題。"></textarea>
    <p class="hint">請先想好問題，再點擊龜殼。開始後問題將暫時鎖定，直到重新起卦。點選圖片卜卦時，內心虔誠的念著問題。</p>
    <section class="stage" aria-label="擲銅錢起卦區">
      <p class="stage-title">{{ stageTitle }}</p>
      <button class="shell-button" :class="{shaking:tossing}" :disabled="tossing || finished" type="button" aria-label="點擊龜殼擲出下一爻" @click="tossNext">
        <img :src="shellImage" alt="手持龜殼的示意圖">
      </button>
      <p class="status" role="status" aria-live="polite">{{ status }}</p>
      <img v-if="coinImage && !tossing" :key="coinImage + lines.length" class="coin-result visible" :src="coinImage" :alt="`三枚銅錢：${lines[lines.length-1].coins}`">
      <div class="buttons"><button class="btn secondary" type="button" @click="resetToss">重新起卦</button></div>
    </section>
    <h2 class="section-title">六爻紀錄（上爻在上、初爻在下）</h2>
    <div class="history">
      <div v-if="!lines.length" class="empty">尚未開始起卦</div>
      <div v-for="line in historyTopDown" :key="line.index" class="history-row">
        <strong>{{ yaoNames[line.index] }}</strong>
        <div class="detail">{{ line.coins }}（{{ line.kind }}）{{ line.moving ? '・動爻' : '' }}</div>
        <div class="yao-line" :class="{moving:line.moving}">{{ line.original ? '⚊' : '⚋' }}{{ line.moving ? (line.sum === 9 ? ' ○' : ' ×') : '' }}</div>
      </div>
    </div>
    <section v-if="result" class="results visible">
      <h2 class="section-title">卜卦結果</h2>
      <div class="hex-grid">
        <article v-for="(item, i) in [{title:'本卦',bits:result.base,info:result.baseInfo},{title:'變卦',bits:result.changed,info:result.changedInfo}]" :key="i" class="hex-card">
          <h3>{{ item.title }}</h3>
          <div class="hex-lines" :aria-label="`${item.title}六爻`">
            <div v-for="(bit,index) in item.bits.split('')" :key="index" :class="lineClass(bit,index)" :aria-label="`${6-index}爻${bit === '1' ? '陽' : '陰'}${result.movingIndices.includes(5-index) ? '，動爻' : ''}`">
              <span v-for="n in (bit === '1' ? 1 : 2)" :key="n"></span>
            </div>
          </div>
          <p class="hex-name">{{ describeHex(item.info) }}</p>
        </article>
      </div>
      <div class="summary">
        <p>所問之事：{{ sessionQuestion || '（未填寫）' }}</p>
        <p>本卦的卦象：{{ describeHex(result.baseInfo) }}</p>
        <p>變卦的卦象：{{ describeHex(result.changedInfo) }}</p>
        <p>動爻：{{ result.movingIndices.length ? result.movingIndices.map(i => yaoNames[i]).join('、') : '無（本卦與變卦相同）' }}</p>
        <p>紅色爻線代表動爻；老陽由陽變陰，老陰由陰變陽。</p>
      </div>
    </section>
    <p class="note">本工具模擬傳統三枚銅錢起卦。銅錢圖片是對應結果的示意；解讀僅供文化體驗與個人反思，不應取代重要決策所需的專業判斷。</p>
  </main>
</template>
