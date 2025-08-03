import { Extension, type SingleCommands, findChildrenInRange } from '@tiptap/core';
import { Selection, TextSelection } from '@tiptap/pm/state';
import { findParentNode } from '../utils/node';
import { NodeNames } from '../node-names';

export const PageKeyMap = Extension.create({
  name: 'PageKeyMap',
  /* Add custom commands */
  addCommands() {
    return {};
  },
  addKeyboardShortcuts() {
    const handleBackspace = () =>
      this.editor.commands.first(({ commands }) => [
        () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          window.stepStatus = true;
          return false;
        },
        () => commands.undoInputRule(),
        // maybe convert first text block node to default node
        () =>
          commands.command(({ tr }) => {
            const { selection, doc } = tr;
            const { empty, $anchor } = selection;
            const { pos, parent } = $anchor;
            const isAtStart = Selection.atStart(doc).from === pos;
            if (!empty || !isAtStart || !parent.type.isTextblock || parent.textContent.length) {
              return false;
            }
            return commands.clearNodes();
          }),
        () => deleteSelection(commands),
        () => commands.joinBackward(),

        () => commands.selectNodeBackward(),
        () =>
          commands.command(({ editor, tr }) => {
            // If all the above default system operations fail, this branch will be entered
            const { selection, doc } = tr;
            const { $anchor } = selection;
            const { pos } = $anchor;
            // Do nothing if there is only one page
            if (doc.childCount == 1) return false;
            // If it is the last page and the deletion point is already the last point of the entire document, it means that the last page is empty and can be deleted directly
            // fix bug https://gitee.com/stringlxd/cool_emr/issues/IADD3V
            if (Selection.atEnd(doc).from === pos && !$anchor.parentOffset) {
              return commands.deleteNode(NodeNames.page);
            }
            // Find the current page
            const pageNode = findParentNode((node) => node.type.name === NodeNames.page)(selection);
            if (pageNode) {
              // If the cursor is at the first position of the current page
              const isAtStart = pageNode.start + Selection.atStart(pageNode.node).from === pos;
              if (isAtStart) {
                const vm = TextSelection.create(doc, pos - 20, pos - 20);
                const beforePageNode = findParentNode((node) => node.type.name === NodeNames.page)(vm);
                // Find the previous page, get the last point, and then set the cursor selection
                if (beforePageNode) {
                  const pos1 = Selection.atEnd(beforePageNode.node).from + beforePageNode.start;
                  // EXTEND is an extension type that can be deleted and merged
                  const selection1 = TextSelection.create(doc, pos1, pos1);

                  tr.setSelection(selection1);
                }
                return true;
              }
            }
            return false;
          }),
      ]);

    const handleDelete = () =>
      this.editor.commands.first(({ commands }) => [
        () => deleteSelection(commands),
        () =>
          commands.command(({ tr }) => {
            return commands.joinForward();
          }),
        () => {
          const a = commands.selectNodeForward();
          return a;
        },
        () =>
          commands.command(({ tr }) => {
            // If all the above default system operations fail, this branch will be entered
            const { selection, doc } = tr;
            const { $anchor } = selection;
            const { pos } = $anchor;
            // Do nothing if there is only one page
            if (doc.childCount == 1) return false;
            // If it is the last page and the deletion point is already the last point of the entire document, it means that the last page is empty and can be deleted directly
            if (Selection.atEnd(doc).from === pos) {
              return commands.deleteNode(NodeNames.page);
            }
            return false;
          }),
      ]);
    return {
      Backspace: handleBackspace,
      Delete: handleDelete,
    };
  },
});

// Handle the delete logic when Delete and Backspace are pressed with a selection
const deleteSelection = (commands: SingleCommands) => {
  return commands.command(({ tr }) => {
    const { selection, doc } = tr;
    // Find all blocks within the selected range
    const nodesInChangedRanges = findChildrenInRange(
      doc,
      {
        from: selection.from,
        to: selection.to,
      },
      (node) => false
    );
    for (const node of nodesInChangedRanges) {
      const endPos = node.pos + node.node.nodeSize;
      if (selection.from < node.pos || selection.to > endPos) {
        return true;
      }
    }
    return commands.deleteSelection();
  });
};
