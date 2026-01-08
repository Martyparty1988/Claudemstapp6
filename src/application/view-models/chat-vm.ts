/**
 * MST Chat View Models
 * 
 * Typy pro UI zobrazení chatu.
 * Pouze textové zprávy - žádné obrázky, soubory.
 */

/**
 * Konverzace v seznamu
 */
export interface ConversationListItemVM {
  readonly id: string;
  readonly type: 'direct' | 'group' | 'project';
  /** Název konverzace nebo jméno uživatele */
  readonly title: string;
  /** Iniciály pro avatar */
  readonly initials: string;
  /** Barva avataru */
  readonly avatarColor: string;
  /** Náhled poslední zprávy */
  readonly lastMessagePreview?: string;
  /** Odesílatel poslední zprávy (pro skupiny) */
  readonly lastMessageSender?: string;
  /** Čas poslední zprávy */
  readonly lastMessageTime?: string;
  /** Relativní čas (dnes, včera, datum) */
  readonly lastMessageTimeRelative?: string;
  /** Počet nepřečtených */
  readonly unreadCount: number;
  /** Je online (pro direct) */
  readonly isOnline?: boolean;
  /** Je ztlumená */
  readonly isMuted: boolean;
  /** Je připnutá */
  readonly isPinned: boolean;
  /** Píše právě... */
  readonly isTyping?: boolean;
  /** Kdo píše */
  readonly typingUsers?: readonly string[];
}

/**
 * Detail konverzace
 */
export interface ConversationDetailVM {
  readonly id: string;
  readonly type: 'direct' | 'group' | 'project';
  readonly title: string;
  readonly subtitle?: string;
  readonly initials: string;
  readonly avatarColor: string;
  readonly avatar?: string;
  readonly isOnline?: boolean;
  readonly lastSeen?: string;
  readonly participantCount?: number;
  readonly participants?: readonly ChatUserVM[];
  readonly projectId?: string;
  readonly projectName?: string;
  readonly isMuted: boolean;
  readonly isPinned: boolean;
}

/**
 * Zpráva v chatu - pouze text
 */
export interface MessageVM {
  readonly id: string;
  /** Je moje zpráva */
  readonly isMine: boolean;
  /** Odesílatel */
  readonly sender: MessageSenderVM;
  /** Text zprávy */
  readonly text?: string;
  /** Odpověď na */
  readonly replyTo?: MessageReplyVM;
  /** Čas odeslání */
  readonly time: string;
  /** Stav */
  readonly status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  /** Ikona stavu */
  readonly statusIcon: 'clock' | 'check' | 'check-double' | 'check-double-blue' | 'error';
  /** Je smazaná */
  readonly isDeleted: boolean;
  /** Je editovaná */
  readonly isEdited: boolean;
  /** Zobrazit avatar (pro skupiny) */
  readonly showAvatar: boolean;
  /** Zobrazit jméno (pro skupiny) */
  readonly showName: boolean;
  /** Zobrazit datum (první zpráva dne) */
  readonly showDate: boolean;
  /** Datum */
  readonly date?: string;
}

export interface MessageSenderVM {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly avatarColor: string;
  readonly avatar?: string;
}

export interface MessageReplyVM {
  readonly id: string;
  readonly senderName: string;
  readonly preview: string;
}

/**
 * Uživatel pro výběr
 */
export interface ChatUserVM {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly avatarColor: string;
  readonly avatar?: string;
  readonly role: string;
  readonly isOnline: boolean;
  readonly lastSeen?: string;
}

/**
 * Input bar state
 */
export interface ChatInputVM {
  readonly text: string;
  readonly replyTo?: MessageReplyVM;
  readonly canSend?: boolean;
  readonly isSending?: boolean;
  readonly isRecording?: boolean;
  readonly attachments?: readonly string[];
}

/**
 * Typing indicator
 */
export interface TypingIndicatorVM {
  readonly isTyping: boolean;
  readonly text: string;
}
