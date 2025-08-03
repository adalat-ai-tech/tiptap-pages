export const NodeNames = {
  paragrah: 'paragraph',
  page: 'page',
  heading: 'heading',
  bulletList: 'bulletList',
  listItem: 'listItem',
  orderedList: 'orderedList',
  pagination: 'pagination',
} as const;

export const LIST_TYPE = [NodeNames.orderedList, NodeNames.bulletList] as string[];

export const PARAGRAPH = 'paragraph';
export const PAGE = 'page';
export const HEADING = 'heading';
export const BULLETLIST = 'bulletList';
export const LISTITEM = 'listItem';
export const HARDBREAK = 'hardBreak';
export const ORDEREDLIST = 'orderedList';
