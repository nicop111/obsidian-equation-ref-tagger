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

    for (const file of files) {
      const content = await this.app.vault.read(file);
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

      // Update references (even if they already have a label)
      const finalContent = updatedContent.replace(/\[\[#\^(\w+)(?:\|\([^\)]+\))?\]\]/g, (match, refName) => {
        const number = footnoteMap[refName];
        if (number) {
          return `[[#^${refName}|(${number})]]`;
        } else {
          return match;
        }
      });

      await this.app.vault.modify(file, finalContent);
    }

    new Notice('Equations tagged and references updated!');
  }
}
