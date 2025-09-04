
export const PARAGRAPH = 'paragraph';
export const PAGE = 'page';
export const HEADING = 'heading';


export const BULLETLIST = 'bulletList';
export const ORDEREDLIST = 'orderedList';
export const LISTITEM = 'listItem';


export const HARDBREAK = 'hardBreak';
export const TRANSIENT_TEXT = 'transientText';


export const CASSIE_BLOCK = 'Node';
export const CASSIE_BLOCK_EXTEND = CASSIE_BLOCK + 'Extend';
export const CITATION = 'citation';
export const TEMPLATE_VARIABLE = 'templateVariable';


export const TABLE = 'table';
export const TABLE_ROW = 'tableRow';
export const TABLE_CELL = 'tableCell';


export const RECORDING_TEXT = 'recordingTextShiftPTT';
export const RECORDING_LOADER = 'recordingLoader';


export const EXTEND = 'Extend';
export const CC = 'CC';


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
