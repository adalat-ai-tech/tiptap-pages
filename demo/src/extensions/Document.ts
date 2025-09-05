import { Node } from '@tiptap/core';
import { PAGE } from './node-names';

/**
 * Custom Document Node - Requires content to be wrapped in PAGE nodes
 * 
 * This document structure enforces that all content must be contained
 * within page elements, enabling the page extension functionality.
 */
export const Document = Node.create({
  name: 'doc',
  topNode: true,
  content: `${PAGE}+`, // Requires at least one PAGE node
});
