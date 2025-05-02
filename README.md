# Code to the Moon

**Code to the Moon** is a small website I built for the Teaching with Generative AI course at UCSC. It’s a Parsons Problem platform — students get shuffled code blocks and try to put them in the right order. Every time they solve a problem, a little rocket animation moves closer to the moon.

I themed it like a space mission, mostly because it made debugging more fun. Also, it gave me a good metaphor to explain how students progress through the problems. Also, it "looks nicer" than a standard HTML page.

---

## What It Does

- Students solve Parsons Problems that are created though an uploaded JSON file
- There’s visual feedback (green/yellow/red) to show if blocks are correct, misplaced, or wrong
- Students get 3 “fuel canisters” (attempts) per problem — solve one and you get one back
- Fully keyboard accessible
- Once all problems are done, a certificate shows up that they download to screenshot/submit

It’s all built in HTML, CSS, and JavaScript. No backend (yet). No frameworks. Just files.

---

## How to Add Your Own Problem Sets

Problem sets are stored as JSON files. To load a different one, just change the URL:

index.html?specification=yourfile.json


`yourfile.json` can either be:
- A file inside the `specifications/` folder, or
- A link to a public `.json` file on the web

### Some Included Examples

- `csharp.json` – Basic C# logic puzzles
- `history.json` – Reorder historical events by date
- `spanish.json` – Build grammatically correct Spanish sentences

These can be used as templates to make your own.

---

## How It Was Built

I built this whole thing using ChatGPT-4o, Claude, and BayLeaf. Basically I’d ask a question, test some code, and keep iterating. The rocket metaphor and fuel system were ideas that evolved as I got more into it. Every feature went through a few rounds of debugging with help from the GenerativeAI. I would not classify this process as "vibe-coding."

### Major Development Phases

#### Phase 0: MVP
- Basic Parsons Problem interface
- Feedback coloring and rocket animation
- Certificate generation

#### Phase 1: Refactor
- Pulled problems out of the HTML
- Switched to JSON loading so it's easier to add new sets

#### Phase 2: Bug Fixes
- Cleaned up event listeners and edge cases
- Error handling when JSON fails to load

#### Phase 3: Accessibility and Layout
- Added full keyboard support
- Tweaked layout so it looks OK on small screens

#### Phase 4: Subject Expansion
- Created problem sets beyond just coding
- Added distractor blocks for complexity

---

## Things I Learned

- LLMs are helpful, but only if you already kind of know what you’re doing
- Prompts matter way more than I expected — phrasing changed everything
- Token limits are real and annoying — breaking things into smaller chats helped
- Debugging with an AI is still *debugging*

---

## Tech Stack

- HTML/CSS/Vanilla JS
- JSON for problem specs
- Built and tested in VS Code Live Server

---

Feel free to remix or reuse it.
