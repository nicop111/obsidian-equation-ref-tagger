# Equation Ref Tagger

Equation Ref Tagger is a plugin for [Obsidian](https://obsidian.md/) that automates the numbering of equations and their references within your Markdown notes. This plugin is particularly useful for users who work with mathematical content and need consistent equation numbering and referencing.

## Features

- **Automatic Equation Numbering**: Automatically assigns numbers to equations written in LaTeX (`$$ ... $$`) blocks.
- **Footnote Integration**: Associates equations with footnotes for easy referencing.
- **Reference Updates**: Updates references to equations across all notes in your vault, ensuring consistency.

## Installation

1. Download or clone this repository into your Obsidian plugins folder.
2. Enable the plugin in Obsidian by navigating to `Settings > Community Plugins > Installed Plugins`.
3. Activate "Equation Ref Tagger" plugin

## How It Works

1. The plugin scans your notes for LaTeX equation blocks with or without references (`$$ ... $$ ^reference`).
2. Click the ribbon icon labeled "Update Equation Numbering" to run the plugin
3. It assigns a unique number to each equation and appends it as a reference tag (e.g. `(42)`).
4. References to equations are updated throughout your notes to match the assigned numbers.

![How to write your equations](howto1.png)
![After auto-numbering and referencing](howto2.png)

## To change the plugin for your own needs

1. Edit file `src/main.ts`
2. Compile with `npx tsc`
3. Copy `dist/main.js` into the root of this project
4. Copy the whole project folder into the plugin folder of your obsidian vault