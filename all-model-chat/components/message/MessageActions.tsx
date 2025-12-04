import React, { useState } from 'react';
import { Edit3, Trash2, RotateCw, Volume2, Loader2, Copy, Check, Info, Play } from 'lucide-react';
import { ChatMessage, ThemeColors } from '../../types';
import { translations } from '../../utils/appUtils';
import { useResponsiveValue } from '../../hooks/useDevice';

interface MessageActionsProps {
    message: ChatMessage;
    sessionTitle?: string;
    messageIndex?: number;
    isGrouped: boolean;
    onEditMessage: (messageId: string) => void;
    onDeleteMessage: (messageId: string) => void;
    onRetryMessage: (messageId: string) => void;
    onEditMessageContent: (message: ChatMessage) => void;
    onTextToSpeech: (messageId: string, text: string) => void;
    ttsMessageId: string | null;
    themeColors: ThemeColors;
    themeId: string;
    t: (key: keyof typeof translations) => string;
}

const TokenInfo: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    if (!message.totalTokens) return null;

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <button
                className="p-1.5 rounded-lg text-[var(--theme-text-tertiary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-tertiary)] transition-all"
                title="Token usage"
            >
                <Info size={16} strokeWidth={2} />
            </button>

            {showTooltip && (
                <div className="absolute bottom-full left-0 mb-2 p-3 bg-[var(--theme-bg-primary)] border border-[var(--theme-border-secondary)] rounded-lg shadow-lg text-xs whitespace-nowrap z-50 animate-in fade-in slide-in-from-bottom-1 duration-200">
                    <div className="space-y-1">
                        <div className="flex justify-between gap-4">
                            <span className="text-[var(--theme-text-tertiary)]">Prompt tokens:</span>
                            <span className="text-[var(--theme-text-primary)] font-medium">{message.promptTokens}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-[var(--theme-text-tertiary)]">Completion tokens:</span>
                            <span className="text-[var(--theme-text-primary)] font-medium">{message.completionTokens}</span>
                        </div>
                        {message.thoughtTokens && message.thoughtTokens > 0 && (
                            <div className="flex justify-between gap-4">
                                <span className="text-[var(--theme-text-tertiary)]">Thinking tokens:</span>
                                <span className="text-[var(--theme-text-primary)] font-medium">{message.thoughtTokens}</span>
                            </div>
                        )}
                        <div className="flex justify-between gap-4 pt-1 border-t border-[var(--theme-border-secondary)]">
                            <span className="text-[var(--theme-text-secondary)] font-medium">Total:</span>
                            <span className="text-[var(--theme-text-primary)] font-bold">{message.totalTokens}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CopyButton: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className={className || "p-1.5 rounded-lg text-[var(--theme-text-tertiary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-tertiary)] transition-all"}
            title={copied ? "Copied!" : "Copy"}
        >
            {copied ? <Check size={16} strokeWidth={2.5} className="text-[var(--theme-text-success)]" /> : <Copy size={16} strokeWidth={2} />}
        </button>
    );
};

export const MessageActions: React.FC<MessageActionsProps> = ({
    message,
    isGrouped,
    onEditMessage,
    onDeleteMessage,
    onRetryMessage,
    onTextToSpeech,
    ttsMessageId,
    t
}) => {
    const iconSize = 16;
    const isThisMessageLoadingTts = ttsMessageId === message.id;

    const buttonClasses = "p-1.5 rounded-lg text-[var(--theme-text-tertiary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-tertiary)] transition-all";

    // User message: vertical button group (edit, copy, delete)
    if (message.role === 'user') {
        return (
            <div className="flex flex-col gap-1">
                {!message.isLoading && (
                    <>
                        <button
                            onClick={() => onEditMessage(message.id)}
                            title={t('edit')}
                            className={buttonClasses}
                        >
                            <Edit3 size={iconSize} strokeWidth={2} />
                        </button>

                        {message.content && (
                            <CopyButton text={message.content} className={buttonClasses} />
                        )}

                        <button
                            onClick={() => onDeleteMessage(message.id)}
                            title={t('delete')}
                            className={`${buttonClasses} hover:text-[var(--theme-text-danger)]`}
                        >
                            <Trash2 size={iconSize} strokeWidth={2} />
                        </button>
                    </>
                )}
            </div>
        );
    }

    // AI message: horizontal bottom toolbar
    return (
        <div className="flex items-center gap-1 text-sm">
            {/* Edit */}
            {!message.isLoading && (
                <button
                    onClick={() => onEditMessage(message.id)}
                    title="Edit"
                    className={buttonClasses}
                >
                    <Edit3 size={iconSize} strokeWidth={2} />
                </button>
            )}

            {/* Copy */}
            {message.content && !message.isLoading && (
                <CopyButton text={message.content} className={buttonClasses} />
            )}

            {/* TTS */}
            {message.content && !message.isLoading && message.role === 'model' && !message.audioSrc && (
                <button
                    onClick={() => onTextToSpeech(message.id, message.content)}
                    disabled={!!ttsMessageId}
                    title="Read aloud"
                    className={`${buttonClasses} disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                    {isThisMessageLoadingTts ?
                        <Loader2 size={iconSize} className="animate-spin" strokeWidth={2} /> :
                        <Volume2 size={iconSize} strokeWidth={2} />
                    }
                </button>
            )}

            {/* Token Info */}
            <TokenInfo message={message} />

            {/* Continue Generation (placeholder) */}
            {message.role === 'model' && !message.isLoading && (
                <button
                    onClick={() => {/* TODO: Implement continue generation */ }}
                    title="Continue generation (coming soon)"
                    className={`${buttonClasses} opacity-50 cursor-not-allowed`}
                    disabled
                >
                    <Play size={iconSize} strokeWidth={2} />
                </button>
            )}

            {/* Retry */}
            {(message.role === 'model' || (message.role === 'error' && message.generationStartTime)) && (
                <button
                    onClick={() => onRetryMessage(message.id)}
                    title={message.isLoading ? t('retry_and_stop_button_title') : t('retry_button_title')}
                    className={buttonClasses}
                >
                    <RotateCw size={iconSize} strokeWidth={2} />
                </button>
            )}

            {/* Delete */}
            {!message.isLoading && (
                <button
                    onClick={() => onDeleteMessage(message.id)}
                    title={t('delete')}
                    className={`${buttonClasses} hover:text-[var(--theme-text-danger)]`}
                >
                    <Trash2 size={iconSize} strokeWidth={2} />
                </button>
            )}
        </div>
    );
};
