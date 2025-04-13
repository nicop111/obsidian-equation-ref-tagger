import { Plugin, Notice, TFile } from 'obsidian';

export default class EquationRefTagger extends Plugin {
  async onload() {
    this.addCommand({
      id: 'tag-equations-and-update-references',
      name: 'Tag Equations and Update References',
      callback: () => this.tagEquationsAndReferences(),
    });

    this.addRibbonIcon("function-square", "Update Equation Numbering", () => {
      this.tagEquationsAndReferences();
    });
  }

  async tagEquationsAndReferences() {
    const files = this.app.vault.getMarkdownFiles();

    //
    // Update equation numbering in the active file
    //
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      new Notice('No active file!');
      return;
    }
    const content = await this.app.vault.read(activeFile);
    let equationNumber = 1;
    const footnoteMap: Record<string, number> = {};

    // Remove existing \tag{n} from equations
    const tagRemovedContent = content.replace(/\\tag\{\d+\}/g, '');

    // Replace equations and collect footnotes
    const updatedContent = tagRemovedContent.replace(/\$\$([\s\S]*?)\$\$(?:\n\^(\w+))?/g, (match, eqBody, footnoteLabel) => {
      let taggedEquation = `$$\n${eqBody.trim()} \\tag{${equationNumber}}\n$$`;

      if (footnoteLabel) {
        footnoteMap[footnoteLabel] = equationNumber;
        taggedEquation += `\n^${footnoteLabel}`;
      }

      equationNumber++;
      return taggedEquation;
    });

    new Notice(`Tagged ${equationNumber - 1} equations in active file!`);

    //
    // Update references in active file
    //
    let globalReferencesNumber = 0;
    const finalContent = updatedContent.replace(/\[\[#\^(\w+)(?:\|\([^\)]+\))?\]\]/g, (match, refName) => {
      const number = footnoteMap[refName];
      if (number) {
        globalReferencesNumber++;
        return `[[#^${refName}|(${number})]]`;
      } else {
        return match;
      }
    });
    await this.app.vault.modify(activeFile, finalContent);

    //
    // Update references on this file's equations in non-active files
    //
    for (const file of files) {
      if (file.path === activeFile.path) continue; // Skip the active file
    
      const fileContent = await this.app.vault.read(file);
    
      // Update references in non-active files
      const updatedFileContent = fileContent.replace(
        new RegExp(`\\[\\[(${activeFile.basename}#\\^\\w+)(?:\\|([^\\]]+))?\\]\\]`, 'g'),
        (match, refName, description) => {
          const refLabel = refName.split('#^')[1]; // Extract footnote label
          const number = footnoteMap[refLabel]; // Get equation number from the footnoteMap
    
          if (number) {
            // Replace the reference with the format: [[activeFileName#^footnoteLabel|activeFileName (number)]]
            globalReferencesNumber++;
            return `[[${activeFile.basename}#^${refLabel}|${activeFile.basename} (${number})]]`;
          } else {
            return match; // If no number found in footnoteMap, leave the reference as is
          }
        }
      );
    
      // Only modify the file if there was a change
      if (updatedFileContent !== fileContent) {
        await this.app.vault.modify(file, updatedFileContent);
      }
    }
    
    new Notice(`Found ${globalReferencesNumber} references globally and updated them!`);
  }
}
