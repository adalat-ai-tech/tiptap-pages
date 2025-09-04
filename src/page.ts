'use client';

import { ReactNodeViewRenderer } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import { getId } from './utils/node';
import { type PageOptions } from './types';
import { PageComponent } from './page-component';
import { 
  HEADING,
  PARAGRAPH, 
  PAGE,
  BULLETLIST, 
  LISTITEM, 
  ORDEREDLIST, 
  CASSIE_BLOCK, 
  TRANSIENT_TEXT, 
  HARDBREAK 
} from './node-names';


const PAGE_CONTENT_TYPES = [
  HEADING,
  PARAGRAPH,
  BULLETLIST,
  LISTITEM,
  ORDEREDLIST,
  CASSIE_BLOCK,
  TRANSIENT_TEXT,
  HARDBREAK,
];


export const Page = Node.create<PageOptions>({
  priority: 2,
  name: PAGE,
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
      pageLayout: {
        margins: {
          top: { unit: 'INCHES', value: 0.5 },
          bottom: { unit: 'INCHES', value: 0.5 },
          left: { unit: 'INCHES', value: 0.5 },
          right: { unit: 'INCHES', value: 0.5 }
        },
        paragraphSpacing: {
          before: { unit: 'PTS', value: 6 },
          after: { unit: 'PTS', value: 6 }
        }
      },
      pageNumber: {
        show: false,
        showCount: false,
        showOnFirstPage: false,
        position: null,
        alignment: null
      }
    };
  },

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
        types: PAGE_CONTENT_TYPES.concat(this.options.types || []),
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

  renderHTML({ HTMLAttributes }) {
    const pageId = getId();
    
    return ['page', mergeAttributes(HTMLAttributes, { id: pageId }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PageComponent);
  },
});
