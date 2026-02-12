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

function wordBreak(word) {
    word = word.toLowerCase();
    const dp = new Array(word.length + 1).fill(null);
    dp[0] = [];

    for (let i = 1; i <= word.length; i++) {
        for (let j = 0; j < i; j++) {
            if (dp[j] !== null && WORD_DICTIONARY.has(word.substring(j, i))) {
                dp[i] = [...dp[j], word.substring(j, i)];
                break;
            }
        }
    }

    return dp[word.length] ? dp[word.length].join(" ") : null;
}

function processInputElement(element) {
    if (!element.value) return;

    const cursorPos = element.selectionStart;
    const text = element.value;

    const beforeCursor = text.slice(0, cursorPos);
    const match = beforeCursor.match(/([a-zA-Z]+)$/);
    if (!match) return;

    const lastWord = match[0];
    if (lastWord.length < 4) return;

    const segmented = wordBreak(lastWord);
    if (!segmented || segmented === lastWord) return;

    const start = cursorPos - lastWord.length;
    const newText =
        text.slice(0, start) +
        segmented +
        text.slice(cursorPos);

    const newCursorPos = start + segmented.length;

    isUpdating = true;
    element.value = newText;
    element.setSelectionRange(newCursorPos, newCursorPos);
    isUpdating = false;
}

function processContentEditable(element) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;

    if (!textNode || textNode.nodeType !== 3) return;

    const text = textNode.textContent;
    const cursorPos = range.startOffset;

    const beforeCursor = text.slice(0, cursorPos);
    const match = beforeCursor.match(/([a-zA-Z]+)$/);
    if (!match) return;

    const lastWord = match[0];
    if (lastWord.length < 4) return;

    const segmented = wordBreak(lastWord);
    if (!segmented || segmented === lastWord) return;

    const start = cursorPos - lastWord.length;
    const newText =
        text.slice(0, start) +
        segmented +
        text.slice(cursorPos);

    isUpdating = true;

    textNode.textContent = newText;

    const newCursorPos = start + segmented.length;
    const newRange = document.createRange();
    newRange.setStart(textNode, newCursorPos);
    newRange.collapse(true);

    selection.removeAllRanges();
    selection.addRange(newRange);

    isUpdating = false;
}

document.addEventListener("input", (event) => {
    if (!isEnabled || isUpdating) return;

    const element = event.target;

    if (
        element.tagName === "INPUT" &&
        element.type !== "password"
    ) {
        processInputElement(element);
    } else if (element.tagName === "TEXTAREA") {
        processInputElement(element);
    } else if (element.isContentEditable) {
        processContentEditable(element);
    }
});
