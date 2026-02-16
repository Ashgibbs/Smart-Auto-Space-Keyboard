/**
 * Trie built from WORD_DICTIONARY for O(word length) lookups and prefix checks.
 * Used for efficient word detection and to avoid breaking mid-word (e.g. "the" vs "their").
 */
(function () {
  const root = { children: {}, isWord: false };

  for (const word of Object.keys(WORD_DICTIONARY)) {
    let node = root;
    const lower = word.toLowerCase();
    for (let i = 0; i < lower.length; i++) {
      const ch = lower[i];
      if (!node.children[ch]) node.children[ch] = { children: {}, isWord: false };
      node = node.children[ch];
    }
    node.isWord = true;
  }

  window.WORD_TRIE = {
    hasWord(w) {
      if (!w || typeof w !== "string") return false;
      let node = root;
      const s = w.toLowerCase();
      for (let i = 0; i < s.length; i++) {
        node = node.children[s[i]];
        if (!node) return false;
      }
      return node.isWord;
    },
    hasPrefix(w) {
      if (!w || typeof w !== "string") return false;
      let node = root;
      const s = w.toLowerCase();
      for (let i = 0; i < s.length; i++) {
        node = node.children[s[i]];
        if (!node) return false;
      }
      return true;
    },
  };
})();
