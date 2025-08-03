import { Extension } from '@tiptap/core';
import { buildComputedHtml } from './core';
import { type PageOptions } from './types';
import { pagePlugin } from './page-plugin';
import { PageKeyMap } from './page-key-map';
import { Page } from './page';
import { BULLETLIST, HARDBREAK, HEADING, LISTITEM, ORDEREDLIST, PARAGRAPH } from '../node-names';
import UniqueID from '@tiptap/extension-unique-id';
import { isChangeOrigin } from '@tiptap/extension-collaboration';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    PageExtension: {
      /**
       * Recompute the computed HTML and update the editor
       * @example editor.commands.recomputeComputedHtml()
       * @returns void
       * */
      recomputeComputedHtml: () => ReturnType;
    };
  }
}

const types = [HEADING, PARAGRAPH, BULLETLIST, LISTITEM, ORDEREDLIST, HARDBREAK];
export const PageExtension = Extension.create<PageOptions>({
  name: 'PageExtension',
  onBeforeCreate() {
    buildComputedHtml(this.options);
  },
  addProseMirrorPlugins() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return [pagePlugin(this.editor, this.options)];
  },
  addStorage() {
    let headerData = [] as unknown[];
    let footerData = [] as unknown[];
    if (this.options) {
      if (this.options.headerData) headerData = this.options.headerData;
      if (this.options.footerData) footerData = this.options.footerData;
    }
    return {
      headerData: headerData,
      footerData: footerData,
    };
  },
  addCommands() {
    return {
      recomputeComputedHtml:
        () =>
        ({ editor }) => {
          // TODO: Add support for paragraph spacing
          // const unitConversion = new UnitConversion();
          // const { paragraph_spacing } = useDocumentStore.getState().document?.settings?.page_layout ?? {};
          // if (paragraph_spacing)
          //   document.documentElement.style.cssText = `--editor-spacing-top: ${unitConversion.ptConversionPx(paragraph_spacing.before.value) * 2}px; --editor-spacing-bottom: ${unitConversion.ptConversionPx(paragraph_spacing.after.value) * 2}px;`;
          buildComputedHtml(this.options);
          setTimeout(() => editor?.view.dispatch(editor?.state.tr.setMeta('splitPage', true)), 1000);
          return true;
        },
    };
  },
  addExtensions() {
    return [
      PageKeyMap,
      Page.configure(this.options),
      UniqueID.configure({
        types,
        filterTransaction: (transaction) => !isChangeOrigin(transaction),
      }),
    ];
  },
});
