let isEnabled = true;
let isUpdating = false;

const segmentationCache = {};
let debounceTimer = null;

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
// SMART WORD BREAK (STRICT)
// ===============================
function smartWordBreak(word) {
  word = word.toLowerCase();

  if (segmentationCache[word]) return segmentationCache[word];

  // STRICT RULE: Never split if full word exists
  if (WORD_DICTIONARY[word]) {
    segmentationCache[word] = word;
    return word;
  }

  // Only attempt segmentation for long words
  if (word.length < 8) return null;

  const dp = new Array(word.length + 1).fill(null);
  dp[0] = [];

  for (let i = 1; i <= word.length; i++) {
    for (let j = 0; j < i; j++) {
      if (!dp[j]) continue;

      const segment = word.slice(j, i);
      if (!WORD_DICTIONARY[segment]) continue;

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
// PROCESS INPUT ELEMENT
// ===============================
function processInput(element) {
  const cursor = element.selectionStart;
  const text = element.value;

  const beforeCursor = text.slice(0, cursor);
  const match = beforeCursor.match(/([a-zA-Z]{6,})$/);

  if (!match) return;

  const word = match[1];

  // STRICT FULL WORD CHECK AGAIN
  if (WORD_DICTIONARY[word]) return;

  const segmented = smartWordBreak(word);
  if (!segmented || segmented === word) return;

  const start = cursor - word.length;

  isUpdating = true;

  element.value =
    text.slice(0, start) +
    segmented +
    text.slice(cursor);

  const newCursor = start + segmented.length;
  element.setSelectionRange(newCursor, newCursor);

  isUpdating = false;
}

// ===============================
// PROCESS CONTENTEDITABLE
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

  // STRICT FULL WORD CHECK
  if (WORD_DICTIONARY[word]) return;

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
// REAL-TIME LISTENER WITH DEBOUNCE
// ===============================
document.addEventListener("input", () => {
  if (!isEnabled || isUpdating) return;

  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
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
  }, 80); // slight delay stabilizes Chrome + Edge
});
