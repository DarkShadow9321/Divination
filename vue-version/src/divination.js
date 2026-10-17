// 由上爻到初爻：陽=1，陰=0；前三位為上卦，後三位為下卦。
export const trigrams = {
  "111": ["☰", "乾", "天"], "011": ["☱", "兌", "澤"],
  "101": ["☲", "離", "火"], "001": ["☳", "震", "雷"],
  "110": ["☴", "巽", "風"], "010": ["☵", "坎", "水"],
  "100": ["☶", "艮", "山"], "000": ["☷", "坤", "地"]
};
export const hexagramEntries = [
  ["111111","乾",1], ["000000","坤",2], ["010001","屯",3], ["100010","蒙",4],
  ["010111","需",5], ["111010","訟",6], ["000010","師",7], ["010000","比",8],
  ["110111","小畜",9], ["111011","履",10], ["000111","泰",11], ["111000","否",12],
  ["111101","同人",13], ["101111","大有",14], ["000100","謙",15], ["001000","豫",16],
  ["011001","隨",17], ["100110","蠱",18], ["000011","臨",19], ["110000","觀",20],
  ["101001","噬嗑",21], ["100101","賁",22], ["100000","剝",23], ["000001","復",24],
  ["111001","無妄",25], ["100111","大畜",26], ["100001","頤",27], ["011110","大過",28],
  ["010010","坎",29], ["101101","離",30], ["011100","咸",31], ["001110","恆",32],
  ["111100","遯",33], ["001111","大壯",34], ["101000","晉",35], ["000101","明夷",36],
  ["110101","家人",37], ["101011","睽",38], ["010100","蹇",39], ["001010","解",40],
  ["100011","損",41], ["110001","益",42], ["011111","夬",43], ["111110","姤",44],
  ["011000","萃",45], ["000110","升",46], ["011010","困",47], ["010110","井",48],
  ["011101","革",49], ["101110","鼎",50], ["001001","震",51], ["100100","艮",52],
  ["110100","漸",53], ["001011","歸妹",54], ["001101","豐",55], ["101100","旅",56],
  ["110110","巽",57], ["011011","兌",58], ["110010","渙",59], ["010011","節",60],
  ["110011","中孚",61], ["001100","小過",62], ["010101","既濟",63], ["101010","未濟",64]
];
export const hexagramMap = Object.fromEntries(hexagramEntries.map(([bits,name,number]) => {
  const top = trigrams[bits.slice(0,3)];
  const bottom = trigrams[bits.slice(3)];
  const fullName = top[2] === bottom[2] ? `${top[1]}為${top[2]}` : `${top[2]}${bottom[2]}${name}`;
  return [bits, { number, name, fullName, symbols: top[0] + bottom[0] }];
}));
export const coinImages = {
  "正正反":"/image/zzf.webp", "正反正":"/image/zfz.webp", "反正正":"/image/fzz.webp",
  "正正正":"/image/zzz.webp", "反反正":"/image/ffz.webp", "反正反":"/image/fzf.webp",
  "正反反":"/image/zff.webp", "反反反":"/image/fff.webp"
};
export const yaoNames = ["初爻","二爻","三爻","四爻","五爻","上爻"];
export const yaoKinds = {6:"老陰",7:"少陽",8:"少陰",9:"老陽"};

export function coinSide() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return value[0] % 2 === 0 ? "正" : "反";
  }
  return Math.random() < 0.5 ? "正" : "反";
}
export function createLine() {
  const coins = Array.from({length:3}, coinSide);
  const sum = coins.reduce((acc,side) => acc + (side === "正" ? 3 : 2), 0);
  return {
    coins:coins.join(""), sum, kind:yaoKinds[sum],
    original:(sum === 7 || sum === 9) ? 1 : 0,
    changed:sum === 6 ? 1 : sum === 9 ? 0 : sum === 7 ? 1 : 0,
    moving:sum === 6 || sum === 9
  };
}
export function calculateResult(lines) {
  if (lines.length !== 6) return null;
  const base = [...lines].reverse().map(l => l.original).join("");
  const changed = [...lines].reverse().map(l => l.changed).join("");
  const movingIndices = lines.flatMap((l,i) => l.moving ? [i] : []);
  return { base, changed, movingIndices, baseInfo:hexagramMap[base], changedInfo:hexagramMap[changed] };
}
export function describeHex(info) {
  return `第 ${info.number} 卦｜${info.symbols} ${info.fullName}`;
}
export function validateHexagrams() {
  const keys = Object.keys(hexagramMap);
  return keys.length === 64 && Array.from({length:64},(_,i)=>i.toString(2).padStart(6,"0")).every(k => k in hexagramMap);
}
