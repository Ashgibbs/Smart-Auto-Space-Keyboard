let isEnabled = true;
let isUpdating = false;

// Load toggle state
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

// Frequency-based segmentation
function smartWordBreak(word) {
  word = word.toLowerCase();

  // Prefer full word immediately
  if (WORD_DICTIONARY[word]) {
    return word;
  }

  const dp = new Array(word.length + 1).fill(null);
  dp[0] = { words: [], score: 0 };

  for (let i = 1; i <= word.length; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] !== null) {
        const segment = word.substring(j, i);

        if (WORD_DICTIONARY[segment]) {

          const baseScore = WORD_DICTIONARY[segment];

          // Penalize small fragments
          const penalty = segment.length < 3 ? 3000 : 0;

          const totalScore =
            dp[j].score + baseScore - penalty;

          if (
            dp[i] === null ||
            totalScore > dp[i].score
          ) {
            dp[i] = {
              words: [...dp[j].words, segment],
              score: totalScore
            };
          }
        }
      }
    }
  }

  if (!dp[word.length]) return null;

  const result = dp[word.length];

  // Reject weak splits
  if (result.words.length <= 1) return result.words[0];

  if (result.score < 4000) return null;

  return result.words.join(" ");
}

// Handle contentEditable (ChatGPT, modern apps)
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

// Handle normal input/textarea
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

// Listen for typing
document.addEventListener("keyup", () => {
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
