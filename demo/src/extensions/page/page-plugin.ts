/* eslint-disable @typescript-eslint/ban-ts-comment */
import { type EditorState, Plugin, PluginKey } from '@tiptap/pm/state';
import { type EditorView } from '@tiptap/pm/view';
import { type Editor } from '@tiptap/core';
import { findParentNode } from '@tiptap/core';
import { type PageOptions, PageState } from './types';
import { findParentDomRefOfType, getId } from '../utils/node';

import { getBodyHeight, removeAbsentHtmlH } from './core';
import { PageComputedContext, defaultNodesComputed } from './computed';
import { Fragment, type Node, Slice } from '@tiptap/pm/model';
import { PAGE } from '../node-names';

let composition = false;
class PageDetector {
  #bodyOption: PageOptions;
  #pageClass: string;
  constructor(_editor: Editor, bodyOption: PageOptions, pageClass = '.PageContent') {
    this.#bodyOption = bodyOption;
    this.#pageClass = pageClass;
  }

  /**
   * @method isOverflown
   * @param pageBody  The current DOM that needs pagination
   * @param bodyOption The conditions that require pagination
   */
  isOverflown(pageBody: Element) {
    return pageBody.scrollHeight > getBodyHeight(this.#bodyOption);
  }
  update(view: EditorView, prevState: EditorState) {
    if (composition) return;
    const { selection, schema, tr } = view.state;
    if (view.state.doc.eq(prevState.doc)) return;
    const domAtPos = view.domAtPos.bind(view);
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const deleting = window.stepStatus ? window.stepStatus : false;
    const pageNodeType = schema.nodes[PAGE];
    if (!pageNodeType) return;
    const pageDOM = findParentDomRefOfType(pageNodeType, domAtPos)(selection);
    if (!pageDOM) return;
    const pageBody = (pageDOM as HTMLElement).querySelector(this.#pageClass);
    if (pageBody) {
      const inserting = this.isOverflown(pageBody);
      if (inserting) {
        const curPage = findParentNode((n) => n.type.name == PAGE)(selection);
        if (curPage) {
          const { childCount, firstChild } = curPage.node;
          if (childCount == 1 && firstChild?.type.name == 'table' && firstChild.childCount == 1) {
            return;
          }
        }
      }
      if (inserting || deleting) {
        if (inserting) tr.setMeta('inserting', inserting);
        if (deleting) {
          tr.setMeta('deleting', true);
          /* Prevent endless triggering of split processing */
          // @ts-ignore
          window.stepStatus = false;
        }
        view.dispatch(tr);
      }
    }
  }
}
export const paginationPluginKey = new PluginKey('pagination');
export const pagePlugin = (editor: Editor, bodyOption: PageOptions) => {
  const plugin: Plugin = new Plugin<PageState>({
    key: paginationPluginKey,
    view: () => {
      return new PageDetector(editor, bodyOption);
    },
    state: {
      init: (): PageState => {
        return new PageState(bodyOption, false, false, false);
      },
      /* Check if the flag exists, if it does, modify the state value
       * Meta data exists for the duration of a transaction and disappears after the transaction ends
       * State exists throughout the entire lifecycle
       */
      apply: (tr, prevState): PageState => {
        return prevState.transform(tr);
      },
    },
    /**
     * @description Based on the state set in the apply method, determine if pagination is needed and execute pagination logic
     * @method appendTransaction Add a new Transaction
     * @param newTr New Transaction
     * @param _prevState
     * @param state
     */
    appendTransaction(_, prevState, state) {
      removeAbsentHtmlH();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
      const page = new PageComputedContext(editor, defaultNodesComputed, this.getState(state), state, prevState);
      const tr = page.run();
      return tr;
    },
    props: {
      handleDOMEvents: {
        compositionstart() {
          composition = true;
        },

        compositionend() {
          composition = false;
        },
      },
      transformPastedHTML(html, view) {
        console.log('transformPastedHTML', html, view);
        return html;
      },
      transformPasted(slice, view) {
        console.log('transformPasted', slice, view);
        slice.content.descendants((node) => {
          // @ts-ignore
          node.attrs.id = getId();
        });
        return slice;
      },
      transformCopied(slice) {
        if (slice.content.firstChild?.type.name == 'page') {
          const nodes: Node[] = [];
          slice.content.content.forEach((node) =>
            node.content.forEach((n) => {
              const clonedNode = n.copy(n.content);
              nodes.push(clonedNode);
            })
          );
          const fragment = Fragment.fromArray(nodes);
          const newslice = new Slice(fragment, 0, fragment.size);
          return newslice;
        }
        return slice;
      },
      handleKeyDown(_, event) {
        if (event.code == 'Backspace') {
          // @ts-ignore
          window.stepStatus = true;
        } else {
          // @ts-ignore
          window.stepStatus = false;
        }
        return false;
      },
    },
  });
  return plugin;
};
