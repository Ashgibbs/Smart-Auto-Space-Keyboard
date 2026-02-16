/**
 * Run the word-segmentation logic in Node for terminal testing.
 * Usage:
 *   node run.js                          → interactive: type a word and press Enter
 *   node run.js howareyoutoday           → one-off: segment the argument
 *   node run.js "ilovemachinelearning"   → same with quotes for one phrase
 */

const WORD_DICTIONARY = require("./dictionary.js");

const segmentationCache = {};

function smartWordBreak(word) {
  word = word.toLowerCase();

  if (segmentationCache[word]) return segmentationCache[word];

  if (WORD_DICTIONARY[word]) {
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

function test(input) {
  const trimmed = input.trim();
  if (!trimmed) return;

  const result = smartWordBreak(trimmed);
  if (result) {
    console.log(`  → ${result}`);
  } else {
    console.log(`  → (no segmentation found, or word too short / already in dictionary)`);
  }
}

// From command line: node run.js <word>
const arg = process.argv.slice(2).join(" ");
if (arg) {
  console.log(`Input: ${arg}`);
  test(arg);
  process.exit(0);
}

// Interactive mode
const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log("Smart Auto Space — terminal test");
console.log("Type a run-together word (e.g. howareyoutoday) and press Enter. Empty line to exit.\n");

function prompt() {
  rl.question("> ", (line) => {
    if (line.trim() === "") {
      rl.close();
      return;
    }
    test(line);
    console.log("");
    prompt();
  });
}

prompt();
