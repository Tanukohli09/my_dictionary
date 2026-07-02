# Domain context

## Glossary

- **Saved Word** — a dictionary entry the learner has added to their personal dictionary. It includes lookup data, favourite state, review progress, and personal notes.
- **Saved Word collection** — the learner's full set of Saved Words. It owns duplicate handling, search counts, timestamps, review counters, and persistence hydration.
- **Dictionary list** — the browsable presentation of the Saved Word collection, including search filtering, sort mode, alphabetical sections, and row metadata.
- **Review session** — a short quiz flow generated from Saved Words. It owns question selection, answer selection, scoring, mastery progression, and round progression.
- **Review submission** — a completed Review session saved for the learner's future reference. It records the session timing, score, reviewed words, selected answers, and which answers were correct.
- **Review history** — the learner-visible list of previous Review submissions.
- **App navigation flow** — the in-app route state for main tabs, detail/result/note/sort routes, menu visibility, URL projection, and tab visibility rules.
