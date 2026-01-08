/**
 * Chat Feature - Public API
 * 
 * Firemní chat ve stylu WhatsApp.
 * Podporuje 1:1 i skupinové konverzace podle projektů.
 */

// Screens
export { ChatScreen, default } from './ChatScreen';
export { ConversationDetailScreen } from './ConversationDetailScreen';

// Components
export {
  ConversationList,
  MessageBubble,
  ChatInput,
  ChatHeader,
} from './components';
