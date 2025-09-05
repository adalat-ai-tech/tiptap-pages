/**
 * Node Names - Constants for Tiptap node types
 * 
 * This file defines all the node type names used throughout
 * the page extension system.
 */

// Basic document structure nodes
export const PARAGRAPH = 'paragraph';
export const PAGE = 'page';
export const HEADING = 'heading';

// List-related nodes
export const BULLETLIST = 'bulletList';
export const ORDEREDLIST = 'orderedList';
export const LISTITEM = 'listItem';

// Text formatting nodes
export const HARDBREAK = 'hardBreak';
export const TRANSIENT_TEXT = 'transientText';

// Special content nodes
export const CASSIE_BLOCK = 'Node';
export const CASSIE_BLOCK_EXTEND = CASSIE_BLOCK + 'Extend';
export const CITATION = 'citation';
export const TEMPLATE_VARIABLE = 'templateVariable';

// Table-related nodes
export const TABLE = 'table';
export const TABLE_ROW = 'tableRow';
export const TABLE_CELL = 'tableCell';

// Recording and media nodes
export const RECORDING_TEXT = 'recordingTextShiftPTT';
export const RECORDING_LOADER = 'recordingLoader';

// Utility constants
export const EXTEND = 'Extend';
export const CC = 'CC';

// Legacy naming for backward compatibility
export const NodeNames = {
  paragrah: 'paragraph',
  page: 'page',
  heading: 'heading',
  bulletList: 'bulletList',
  listItem: 'listItem',
  orderedList: 'orderedList',
  pagination: 'pagination',
} as const;

// List type constants
export const LIST_TYPE = [NodeNames.orderedList, NodeNames.bulletList] as string[];
