let isEnabled = true;
let isUpdating = false;

const segmentationCache = {};

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

  if (segmentationCache[word]) {
    return segmentationCache[word];
  }

  if (WORD_DICTIONARY[word]) {
    segmentationCache[word] = word;
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

          const penalty = segment.length < 3 ? 5000 : 0;

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

  if (result.score < 6000) return null;

  const finalResult =
    result.words.length > 1
      ? result.words.join(" ")
      : result.words[0];

  segmentationCache[word] = finalResult;

  return finalResult;
}

function processInputElement(element) {
  const cursorPos = element.selectionStart;
  const text = element.value;

  const words = text.trim().split(/\s+/);
  const lastWord = words[words.length - 1];

  if (!lastWord || lastWord.length < 6) return;

  const segmented = smartWordBreak(lastWord);
  if (!segmented || segmented === lastWord) return;

  const start = text.lastIndexOf(lastWord);
  const newText =
    text.slice(0, start) +
    segmented +
    text.slice(start + lastWord.length);

  element.value = newText;
}

function processContentEditable() {
  const active = document.activeElement;
  if (!active || !active.isContentEditable) return;

  const text = active.innerText.trim();
  const words = text.split(/\s+/);
  const lastWord = words[words.length - 1];

  if (!lastWord || lastWord.length < 6) return;

  const segmented = smartWordBreak(lastWord);
  if (!segmented || segmented === lastWord) return;

  const newText =
    text.slice(0, text.lastIndexOf(lastWord)) +
    segmented;

  active.innerText = newText;
}

document.addEventListener("keydown", (event) => {
  if (!isEnabled || isUpdating) return;

  if (event.key !== " " && event.key !== "Enter") return;

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
