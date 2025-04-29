# 🚀 Code to the Moon

**Code to the Moon** is an interactive educational website that guides students through a series of adaptive Parsons Problems — visual coding puzzles — using the metaphor of a rocketship journey to the moon. Designed for the [Teaching with Generative AI](https://www.ucsc.edu) course at UCSC with Professor Adam Smith, this site blends storytelling, gamification, and programming education into one cohesive experience.

Built entirely alongside Generative AI tools (ChatGPT-4o, Claude, BayLeaf), the site explores how AI can support both student learning and developer creativity.

---

## 🌌 What Is This Website?

Students engage in Parsons Problems — puzzles where they arrange shuffled code blocks into the correct order — across a set of missions that simulate a rocket's ascent from Earth to the Moon. With every correct solution, their rocket moves closer to lunar touchdown. Key features include:

- **Space-Themed Progression:** 
  - A rocketship and space background track learning progress.
- **Gamified Feedback:**
  - Code blocks light up with colors (green = correct, yellow = misplaced, red = wrong) to give immediate feedback.
- **Fuel System:**
  - Players have three "fuel canisters" (attempts) per problem. Solve one? Earn a canister back.
- **Keyboard Accessibility:**
  - Full keyboard control lets students play without using a mouse.
- **Rocket Launch Animation:**
  - Code launch is triggered with a satisfying animated blast-off.
- **Victory Screen and Certificate:**
  - Students receive a summary and can download a personalized completion certificate to submit to platforms like Canvas.

---

## 🧠 For Teachers: Customize with Your Own Content

**Code to the Moon** was designed to be *easily remixable*. Teachers and content creators can load their own problem sets by adding a `.json` file to the `specifications` folder or pointing to a public file online.

### 🔧 How to Use Custom Problems

To load your own problem set, just change the URL like this: index.html?specification=example42.json


Where `example42.json` is:
- A file you’ve placed in the `specifications/` folder, or
- A public link to a JSON file elsewhere on the web

### ✅ Default Problem Sets Included

1. `csharp.json` – Code logic puzzles written in C#
2. `history.json` – Arrange historical events or figures
3. `spanish.json` – Construct correct Spanish sentences

You can use these as templates to build your own subject-specific Parsons Problems.

---

## 🛠 Development Journey

This project was created through five distinct development phases. Each step was guided by conversations with large language models — iterating, refactoring, and debugging alongside AI tools.

### 📘 Summary 0 – Initial Launch

- Created the educational game structure and theme
- Implemented Parsons Problems with Wordle-style feedback
- Designed rocket animations, certificate system, and keyboard accessibility
- Integrated a fuel-based retry mechanic

### 🔄 Summary 1 – Refactoring for Flexibility

- Removed hardcoded problems from HTML/JS
- Switched to external JSON-driven content loading
- Simplified the process of adding new problem sets for instructors

### 🧪 Summary 2 – Debugging and Error Handling

- Fixed broken DOM queries and invalid paths
- Improved error handling when loading external JSON
- Cleaned up HTML and added developer-friendly logging

### ♿ Summary 3 – Accessibility and Layout Polish

- Implemented full keyboard navigation
- Reduced spacing to optimize small-screen experience
- Refactored CSS for a compact, polished game UI

### 🌍 Summary 4 – Expanding Beyond Code

- Created new JSON problem sets for **History** and **Spanish**
- Demonstrated flexibility of the platform across academic subjects
- Added distractor blocks to increase complexity

---

## 💬 What I Learned

Working alongside LLMs to build *Code to the Moon* taught me that:

- **AI doesn’t replace thinking.** You can’t just ask for an answer and expect quality — you need to ask the *right* questions.
- **Iteration is key.** Every improvement came from refining prompts, testing changes, and using multiple models to compare ideas.
- **Tokens are precious.** Keeping token count low by splitting tasks across chats helped maintain clarity and avoid hallucinations.
- **Co-creation works.** The combination of human creativity and AI support led to faster, more thoughtful development.

---

## 👨‍💻 Built With

- HTML, CSS, and Vanilla JavaScript
- JSON-driven problem specifications
- Generative AI tools: ChatGPT-4o, Claude, BayLeaf
- Designed and tested in [Visual Studio Code Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)

---

Thanks for exploring 🚀 *Code to the Moon*.  
Your next mission: remix it, teach with it, or build your own!



