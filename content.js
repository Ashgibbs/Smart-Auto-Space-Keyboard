let isEnabled = true;
let isUpdating = false;

const segmentationCache = {};
let segmentationTimer = null;
let wordCompleteTimer = null;

// Timings: segmentation runs after a short debounce; space is added after word completion pause
const SEGMENT_DEBOUNCE_MS = 60;
const WORD_COMPLETE_DELAY_MS = 280;

chrome.storage.sync.get(["enabled"], (result) => {
  if (result.enabled !== undefined) {
    isEnabled = result.enabled;
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    isEnabled = changes.enabled.newValue;
  }
});

// ===============================
// EFFICIENT WORD DETECTION (TRIE)
// ===============================
function smartWordBreak(word) {
  word = word.toLowerCase();

  if (segmentationCache[word]) return segmentationCache[word];

  if (WORD_TRIE.hasWord(word)) {
    segmentationCache[word] = word;
    return word;
  }

  if (word.length < 6) return null;

  const dp = new Array(word.length + 1).fill(null);
  dp[0] = [];

  for (let i = 1; i <= word.length; i++) {
    for (let j = 0; j < i; j++) {
      if (!dp[j]) continue;

      const segment = word.slice(j, i);
      if (!WORD_TRIE.hasWord(segment)) continue;

      const candidate = [...dp[j], segment];

      if (!dp[i] || candidate.length < dp[i].length) {
        dp[i] = candidate;
      }
    }
  }

  if (!dp[word.length]) return null;

  const result = dp[word.length].join(" ");
  segmentationCache[word] = result;

  return result;
}

// ===============================
// CURRENT TOKEN (word at cursor)
// ===============================
function getCurrentTokenBeforeCursor(text, cursor) {
  const before = text.slice(0, cursor);
  const match = before.match(/([a-zA-Z]+)$/);
  return match ? match[1] : "";
}

// ===============================
// REAL-TIME SPACE: INPUT ELEMENT
// ===============================
function tryInsertSpaceInput(element) {
  const cursor = element.selectionStart;
  const text = element.value;
  const token = getCurrentTokenBeforeCursor(text, cursor);
  if (!token || !WORD_TRIE.hasWord(token)) return;
  // Don't add space if next character is already space or end
  if (text[cursor] === " " || cursor >= text.length) return;

  isUpdating = true;
  element.value = text.slice(0, cursor) + " " + text.slice(cursor);
  element.setSelectionRange(cursor + 1, cursor + 1);
  isUpdating = false;
}

// ===============================
// REAL-TIME SPACE: CONTENTEDITABLE
// ===============================
function tryInsertSpaceContentEditable() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  const range = sel.getRangeAt(0);
  const node = range.startContainer;

  if (!node || node.nodeType !== Node.TEXT_NODE) return;

  const text = node.textContent;
  const cursor = range.startOffset;
  const token = getCurrentTokenBeforeCursor(text, cursor);
  if (!token || !WORD_TRIE.hasWord(token)) return;
  if (text[cursor] === " " || cursor >= text.length) return;

  isUpdating = true;
  node.textContent = text.slice(0, cursor) + " " + text.slice(cursor);

  const newRange = document.createRange();
  newRange.setStart(node, cursor + 1);
  newRange.collapse(true);
  sel.removeAllRanges();
  sel.addRange(newRange);
  isUpdating = false;
}

// ===============================
// SEGMENT RUN-TOGETHER: INPUT
// ===============================
function processInput(element) {
  const cursor = element.selectionStart;
  const text = element.value;

  const beforeCursor = text.slice(0, cursor);
  const match = beforeCursor.match(/([a-zA-Z]{6,})$/);

  if (!match) return;

  const word = match[1];

  if (WORD_TRIE.hasWord(word)) return;

  const segmented = smartWordBreak(word);
  if (!segmented || segmented === word) return;

  const start = cursor - word.length;

  isUpdating = true;

  element.value =
    text.slice(0, start) +
    segmented +
    text.slice(cursor);

  element.setSelectionRange(start + segmented.length, start + segmented.length);

  isUpdating = false;
}

// ===============================
// SEGMENT RUN-TOGETHER: CONTENTEDITABLE
// ===============================
function processContentEditable() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  const range = sel.getRangeAt(0);
  const node = range.startContainer;

  if (!node || node.nodeType !== Node.TEXT_NODE) return;

  const text = node.textContent;
  const cursor = range.startOffset;

  const beforeCursor = text.slice(0, cursor);
  const match = beforeCursor.match(/([a-zA-Z]{6,})$/);

  if (!match) return;

  const word = match[1];

  if (WORD_TRIE.hasWord(word)) return;

  const segmented = smartWordBreak(word);
  if (!segmented || segmented === word) return;

  const start = cursor - word.length;

  isUpdating = true;

  node.textContent =
    text.slice(0, start) +
    segmented +
    text.slice(cursor);

  const newRange = document.createRange();
  newRange.setStart(node, start + segmented.length);
  newRange.collapse(true);

  sel.removeAllRanges();
  sel.addRange(newRange);

  isUpdating = false;
}

// ===============================
// WORD-COMPLETE: FIRE AFTER DELAY
// ===============================
function onWordCompleteTimer() {
  if (!isEnabled || isUpdating) return;

  const active = document.activeElement;

  if (active?.isContentEditable) {
    tryInsertSpaceContentEditable();
  } else if (
    active &&
    (active.tagName === "INPUT" || active.tagName === "TEXTAREA") &&
    active.type !== "password"
  ) {
    tryInsertSpaceInput(active);
  }
}

// ===============================
// SEGMENT: FIRE AFTER DEBOUNCE
// ===============================
function onSegmentTimer() {
  if (!isEnabled || isUpdating) return;

  const active = document.activeElement;

  if (active?.isContentEditable) {
    processContentEditable();
  } else if (
    active &&
    (active.tagName === "INPUT" || active.tagName === "TEXTAREA") &&
    active.type !== "password"
  ) {
    processInput(active);
  }
}

// ===============================
// INPUT LISTENER: DUAL BEHAVIOR
// ===============================
document.addEventListener("input", () => {
  if (!isEnabled || isUpdating) return;

  clearTimeout(segmentationTimer);
  clearTimeout(wordCompleteTimer);

  segmentationTimer = setTimeout(onSegmentTimer, SEGMENT_DEBOUNCE_MS);
  wordCompleteTimer = setTimeout(onWordCompleteTimer, WORD_COMPLETE_DELAY_MS);
});
