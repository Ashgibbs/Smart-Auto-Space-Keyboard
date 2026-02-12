# 🚀 Smart Auto Space Keyboard

A Chrome Extension that intelligently inserts spaces between continuous English words while typing — even inside modern web applications like ChatGPT.

---

## 🧠 Problem Statement

When users type quickly, they often forget to add spaces between words:

ilovemachinelearning

This extension automatically converts it into:

i love machine learning

It works across:
- Input fields
- Textareas
- ContentEditable elements (like ChatGPT)
- Most modern web apps

---

## 🛠️ Tech Stack

### Core Technologies
- JavaScript (Vanilla JS)
- Chrome Extension (Manifest v3)
- DOM Manipulation APIs
- Range & Selection API (for cursor control)

### Algorithm
- Dynamic Programming (Word Segmentation)
- Dictionary-based NLP approach

### Chrome APIs Used
- chrome.storage
- Content Scripts
- Background Service Worker

---

## ⚙️ How It Works

1. The extension listens for typing events.
2. It detects the last continuous alphabetic word before the cursor.
3. A dynamic programming word segmentation algorithm checks the dictionary.
4. If a valid split exists, the word is replaced with spaced words.
5. Cursor position is recalculated and restored safely.
6. Recursive updates are prevented to avoid infinite loops.

The algorithm only modifies the last typed word for performance and stability.

---

## 📂 Project Structure

smart-auto-space/
│
├── manifest.json
├── background.js
├── content.js
├── dictionary.js
├── popup.html
├── popup.js
└── style.css

---

## 🚀 Installation (Local Development)

### 1️⃣ Clone the Repository

git clone https://github.com/Ashgibbs/Smart-Auto-Space-Keyboard.git  
cd Smart-Auto-Space-Keyboard  

---

### 2️⃣ Open Chrome Extensions

Go to:

chrome://extensions

Enable **Developer Mode** (top-right corner).

---

### 3️⃣ Load the Extension

Click **Load Unpacked**  
Select the project folder.

---

### 4️⃣ Reload Any Website

Reload ChatGPT or any webpage and start typing continuous words.

Example:

howareyoutoday

Becomes:

how are you today

---

## 🔄 Toggle Feature

Click the extension icon in the Chrome toolbar.

You can:
- Enable auto spacing
- Disable auto spacing

The state is saved using chrome.storage.

---

## ⚠️ Limitations

- Dictionary-based segmentation (not full AI)
- Limited vocabulary
- English-only support
- No probabilistic scoring yet
- May mis-handle ambiguous words

---

## 🔮 Future Improvements

- 10,000+ word frequency dictionary
- Probabilistic segmentation
- Multi-language support
- TensorFlow.js integration
- Custom user dictionary
- Chrome Web Store publishing
- Performance optimization

---

## 📈 Learning Outcomes

This project demonstrates:

- Real-time NLP processing inside the browser
- Handling React-based contentEditable inputs
- Cursor-safe DOM mutation
- Chrome extension architecture (Manifest v3)
- Algorithmic problem solving using Dynamic Programming
- Frontend + NLP integration

---

## 👨‍💻 Author

Ashwin  
Engineering Student  
Focused on AI, NLP, and Smart Automation Systems

---
