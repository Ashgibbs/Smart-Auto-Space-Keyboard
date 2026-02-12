let isEnabled = true;
let isUpdating = false;

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

function smartWordBreak(word) {
  word = word.toLowerCase();

  // Rule 1: If whole word exists, do NOT split
  if (WORD_DICTIONARY.has(word)) {
    return word;
  }

  const dp = new Array(word.length + 1).fill(null);
  dp[0] = [];

  for (let i = 1; i <= word.length; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] !== null) {
        const segment = word.substring(j, i);
        if (WORD_DICTIONARY.has(segment)) {
          const candidate = [...dp[j], segment];

          // Prefer fewer splits
          if (
            dp[i] === null ||
            candidate.length < dp[i].length
          ) {
            dp[i] = candidate;
          }
        }
      }
    }
  }

  if (!dp[word.length]) return null;

  // Avoid extreme fragmentation
  if (dp[word.length].length > 3) return null;

  return dp[word.length].join(" ");
}

function processContentEditable() {
  const active = document.activeElement;
  if (!active || !active.isContentEditable) return;

  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const node = range.startContainer;

  if (!node || node.nodeType !== Node.TEXT_NODE) return;

  const text = node.textContent;
  const cursorPos = range.startOffset;

  const beforeCursor = text.slice(0, cursorPos);
  const match = beforeCursor.match(/([a-zA-Z]+)$/);
  if (!match) return;

  const lastWord = match[0];
  if (lastWord.length < 4) return;

  const segmented = smartWordBreak(lastWord);
  if (!segmented || segmented === lastWord) return;

  const start = cursorPos - lastWord.length;
  const newText =
    text.slice(0, start) +
    segmented +
    text.slice(cursorPos);

  isUpdating = true;

  node.textContent = newText;

  const newCursor = start + segmented.length;
  const newRange = document.createRange();
  newRange.setStart(node, newCursor);
  newRange.collapse(true);

  selection.removeAllRanges();
  selection.addRange(newRange);

  isUpdating = false;
}

function processInputElement(element) {
  const cursorPos = element.selectionStart;
  const text = element.value;

  const beforeCursor = text.slice(0, cursorPos);
  const match = beforeCursor.match(/([a-zA-Z]+)$/);
  if (!match) return;

  const lastWord = match[0];
  if (lastWord.length < 4) return;

  const segmented = smartWordBreak(lastWord);
  if (!segmented || segmented === lastWord) return;

  const start = cursorPos - lastWord.length;
  const newText =
    text.slice(0, start) +
    segmented +
    text.slice(cursorPos);

  const newCursor = start + segmented.length;

  isUpdating = true;
  element.value = newText;
  element.setSelectionRange(newCursor, newCursor);
  isUpdating = false;
}

document.addEventListener("keyup", (event) => {
  if (!isEnabled || isUpdating) return;

  const active = document.activeElement;

  if (active && active.isContentEditable) {
    processContentEditable();
  } else if (
    active &&
    (active.tagName === "INPUT" || active.tagName === "TEXTAREA") &&
    active.type !== "password"
  ) {
    processInputElement(active);
  }
});
