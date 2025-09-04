import { Node } from '@tiptap/core';
import { PAGE } from './node-names';


export const Document = Node.create({
  name: 'doc',
  topNode: true,
  content: `${PAGE}+`, 
});
