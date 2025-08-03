'use client';

import { ReactNodeViewRenderer } from '@tiptap/react';
import { BULLETLIST, HARDBREAK, HEADING, LISTITEM, ORDEREDLIST, PAGE, PARAGRAPH } from '../node-names';
import { getId } from '../utils/node';
import { type PageOptions } from './types';
import { Node, mergeAttributes } from '@tiptap/core';
import { PageComponent } from './page-component';
const types = [HEADING, PARAGRAPH, BULLETLIST, LISTITEM, ORDEREDLIST, HARDBREAK];

export const Page = Node.create<PageOptions>({
  priority: 2,
  name: `${PAGE}`,
  content: `block*`,
  group: 'block',
  isolating: true,
  selectable: false,
  addOptions() {
    return {
      types: [],
      footerHeight: 100,
      headerHeight: 100,
      bodyHeight: 0,
      bodyWidth: 0,
      bodyPadding: 0,
      isPaging: false,
      mode: 1,
      SystemAttributes: {},
    };
  },
  /* Custom operations */
  addAttributes() {
    return {
      HTMLAttributes: {},
      pageNumber: { default: 1 },
      id: {
        parseHTML: (element) => element.getAttribute('id'),
        renderHTML: (attributes) => {
          if (!attributes.id) return {};
          return { id: attributes.id as string };
        },
      },
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: types.concat(this.options.types || []),
        attributes: {
          id: {
            default: null,
          },
          extend: {
            default: false,
          },
        },
      },
    ];
  },

  parseHTML() {
    return [{ tag: 'page' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const pid = getId();
    if (!node.attrs.id) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      node.attrs.id = pid;
    }
    return ['page', mergeAttributes(HTMLAttributes, { id: pid }), 0];
  },
  addNodeView() {
    return ReactNodeViewRenderer(PageComponent);
  },
});
