import React from 'react';
import { ChatMessage, UploadedFile, ThemeColors, AppSettings, SideViewContent } from '../../types';
import { MessageContent } from './MessageContent';
import { translations } from '../../utils/appUtils';
import { MessageActions } from './MessageActions';
import { formatModelName } from '../../utils/modelUtils';
import GeminiIcon from '../../assets/gemini.svg';

interface MessageProps {
    message: ChatMessage;
    sessionTitle?: string;
    prevMessage?: ChatMessage;
    messageIndex: number;
    onEditMessage: (messageId: string) => void;
    onDeleteMessage: (messageId: string) => void;
    onRetryMessage: (messageId: string) => void;
    onEditMessageContent: (message: ChatMessage) => void;
    onImageClick: (file: UploadedFile) => void;
    onOpenHtmlPreview: (html: string, options?: { initialTrueFullscreen?: boolean }) => void;
    showThoughts: boolean;
    themeColors: ThemeColors;
    themeId: string;
    baseFontSize: number;
    expandCodeBlocksByDefault: boolean;
    isMermaidRenderingEnabled: boolean;
    isGraphvizRenderingEnabled: boolean;
    onTextToSpeech: (messageId: string, text: string) => void;
    ttsMessageId: string | null;
    onSuggestionClick?: (suggestion: string) => void;
    t: (key: keyof typeof translations) => string;
    appSettings: AppSettings;
    onOpenSidePanel: (content: SideViewContent) => void;
}

export const Message: React.FC<MessageProps> = React.memo((props) => {
    const { message, prevMessage, messageIndex } = props;

    const isGrouped = prevMessage &&
        prevMessage.role === message.role &&
        !prevMessage.isLoading &&
        !message.isLoading &&
        (new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() < 5 * 60 * 1000);

    // Format timestamp
    const formatTimestamp = (date: Date) => {
        const now = new Date();
        const msgDate = new Date(date);
        const isToday = now.toDateString() === msgDate.toDateString();
        const timeStr = msgDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return isToday ? `Today at ${timeStr}` : msgDate.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // User message: bubble style with bottom toolbar
    if (message.role === 'user') {
        return (
            <div
                className="relative message-container-animate group/message"
                style={{ animationDelay: `${Math.min(messageIndex * 50, 500)}ms` }}
                data-message-id={message.id}
                data-message-role={message.role}
            >
                {/* Timestamp on hover */}
                <div className="text-xs text-[var(--theme-text-tertiary)] text-right mb-1 opacity-0 group-hover/message:opacity-100 transition-opacity">
                    {formatTimestamp(message.timestamp)}
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="w-fit max-w-[calc(100%-2.5rem)] sm:max-w-3xl lg:max-w-4xl px-4 py-3 sm:px-5 sm:py-4 bg-[var(--theme-bg-user-message)] text-[var(--theme-bg-user-message-text)] rounded-2xl rounded-tr-sm shadow-sm">
                        <MessageContent {...props} />
                    </div>
                    <div className="opacity-0 group-hover/message:opacity-100 transition-opacity">
                        <MessageActions {...props} isGrouped={isGrouped} />
                    </div>
                </div>
            </div>
        );
    }

    // AI message: no bubble, bottom toolbar
    const modelName = formatModelName(message.modelId || 'gemini');

    return (
        <div
            className="relative message-container-animate group/message"
            style={{ animationDelay: `${Math.min(messageIndex * 50, 500)}ms` }}
            data-message-id={message.id}
            data-message-role={message.role}
        >
            {/* Timestamp on hover */}
            {!isGrouped && (
                <div className="text-xs text-[var(--theme-text-tertiary)] mb-1 opacity-0 group-hover/message:opacity-100 transition-opacity">
                    {formatTimestamp(message.timestamp)}
                </div>
            )}

            <div className="flex flex-col gap-2">
                {/* AI Header: Icon + Model Name */}
                {!isGrouped && (
                    <div className="flex items-center gap-2 mb-1">
                        <img src={GeminiIcon} alt="AI" width={24} height={24} className="flex-shrink-0" />
                        <span className="text-base font-medium text-[var(--theme-text-secondary)]">{modelName}</span>
                    </div>
                )}

                <div className="w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl">
                    <MessageContent {...props} />
                </div>

                {/* Bottom toolbar */}
                <div className="opacity-0 group-hover/message:opacity-100 transition-opacity">
                    <MessageActions {...props} isGrouped={isGrouped} />
                </div>
            </div>
        </div>
    );
});