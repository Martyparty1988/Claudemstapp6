/**
 * MST Chat Domain Types
 * 
 * Typy pro firemní chat - čistě textová komunikace.
 * Podporuje 1:1 konverzace, skupinové chaty a projektové chaty.
 * 
 * PRAVIDLA:
 * - Pouze textové zprávy (žádné obrázky, soubory)
 * - Žádné systémové zprávy z projektů
 * - Čistá komunikace mezi zaměstnanci
 */

/**
 * Uživatel chatu
 */
export interface ChatUser {
  readonly id: string;
  readonly name: string;
  readonly role: 'admin' | 'manager' | 'worker';
  readonly isOnline: boolean;
  readonly lastSeen?: Date;
}

/**
 * Typ konverzace
 */
export type ConversationType = 
  | 'direct'   // 1:1 konverzace
  | 'group'    // Skupinový chat
  | 'project'; // Chat podle projektu

/**
 * Konverzace (chat room)
 */
export interface Conversation {
  readonly id: string;
  readonly type: ConversationType;
  /** Pro direct - ID druhého uživatele, pro group/project - všichni členové */
  readonly participantIds: readonly string[];
  /** Pro group/project - název skupiny */
  readonly name?: string;
  /** Pro project - ID projektu */
  readonly projectId?: string;
  /** Poslední zpráva */
  readonly lastMessage?: Message;
  /** Počet nepřečtených */
  readonly unreadCount: number;
  /** Kdy byla konverzace vytvořena */
  readonly createdAt: Date;
  /** Kdy byla poslední aktivita */
  readonly updatedAt: Date;
  /** Je ztlumená */
  readonly isMuted: boolean;
  /** Je připnutá */
  readonly isPinned: boolean;
}

/**
 * Stav zprávy
 */
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

/**
 * Zpráva - pouze text
 */
export interface Message {
  readonly id: string;
  readonly conversationId: string;
  readonly senderId: string;
  /** Textový obsah zprávy */
  readonly text: string;
  /** Odpověď na zprávu */
  readonly replyTo?: string;
  /** Stav doručení */
  readonly status: MessageStatus;
  /** Kdy byla odeslána */
  readonly sentAt: Date;
  /** Kdy byla doručena */
  readonly deliveredAt?: Date;
  /** Kdo přečetl (pro skupiny) */
  readonly readBy: readonly string[];
  /** Je smazaná */
  readonly isDeleted: boolean;
  /** Je editovaná */
  readonly isEdited: boolean;
}

/**
 * Typing indikátor
 */
export interface TypingIndicator {
  readonly conversationId: string;
  readonly userId: string;
  readonly timestamp: Date;
}

/**
 * DTO pro vytvoření konverzace
 */
export interface CreateConversationDto {
  readonly type: ConversationType;
  readonly participantIds: readonly string[];
  readonly name?: string;
  readonly projectId?: string;
}

/**
 * DTO pro odeslání zprávy
 */
export interface SendMessageDto {
  readonly conversationId: string;
  readonly text: string;
  readonly replyTo?: string;
}
