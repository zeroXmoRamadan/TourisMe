import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import chatbotService from '../services/chatbotService';
import { useAuth } from './AuthContext';
import {
    loadAnonymousHistory,
    saveAnonymousHistory,
    clearAnonymousHistory,
} from '../utils/chatHistoryStorage';

const ChatbotContext = createContext();

export const useChatbot = () => {
    const context = useContext(ChatbotContext);
    if (!context) {
        throw new Error('useChatbot must be used within ChatbotProvider');
    }
    return context;
};

const getUserId = (user) => user?.id ?? user?._id ?? null;

const initialMessages = [
    {
        id: '1',
        role: 'assistant',
        content: 'Hello! 👋 **Welcome to TourisMe.**\n\nI\'m your Egypt travel assistant. How can I help you plan your adventure today?',
        timestamp: new Date(),
    },
];

const withWelcomeFallback = (messages) =>
    messages.length > 0 ? messages : [...initialMessages];

export const ChatbotProvider = ({ children }) => {
    const { user } = useAuth();
    const userId = getUserId(user);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([...initialMessages]);
    const [isTyping, setIsTyping] = useState(false);
    const activeSessionRef = useRef(null);

    const applyHistory = useCallback((loadedMessages) => {
        const resolved = withWelcomeFallback(loadedMessages);
        setMessages(resolved);
        chatbotService.setConversationHistory(resolved);
    }, []);

    useEffect(() => {
        const sessionKey = userId ?? 'anonymous';
        activeSessionRef.current = sessionKey;
        chatbotService.clearHistory();

        if (userId) {
            setMessages([...initialMessages]);

            chatbotService.fetchHistory()
                .then((history) => {
                    if (activeSessionRef.current !== sessionKey) return;
                    applyHistory(history);
                })
                .catch((error) => {
                    console.error('Failed to load chat history:', error);
                    if (activeSessionRef.current !== sessionKey) return;
                    applyHistory([]);
                });
        } else {
            applyHistory(loadAnonymousHistory());
        }
    }, [userId, applyHistory]);

    const persistMessages = useCallback((updatedMessages) => {
        if (!userId) {
            saveAnonymousHistory(updatedMessages);
        }
    }, [userId]);

    const openChatbot = () => setIsOpen(true);
    const closeChatbot = () => setIsOpen(false);

    const sendMessage = async (content) => {
        if (!content.trim()) return;

        const sessionKey = activeSessionRef.current;
        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: content.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => {
            const updated = [...prev, userMessage];
            if (!userId) persistMessages(updated);
            return updated;
        });
        setIsTyping(true);

        try {
            const response = await chatbotService.sendMessage(content);
            if (activeSessionRef.current !== sessionKey) return;

            const assistantMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.message,
                timestamp: new Date(),
            };
            setMessages(prev => {
                const updated = [...prev, assistantMessage];
                if (!userId) persistMessages(updated);
                return updated;
            });
        } catch (error) {
            if (activeSessionRef.current !== sessionKey) return;

            const errorMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
            };
            setMessages(prev => {
                const updated = [...prev, errorMessage];
                if (!userId) persistMessages(updated);
                return updated;
            });
        } finally {
            if (activeSessionRef.current === sessionKey) {
                setIsTyping(false);
            }
        }
    };

    const clearChat = async () => {
        const resetMessages = [...initialMessages];
        setMessages(resetMessages);
        chatbotService.clearHistory();

        if (userId) {
            try {
                await chatbotService.clearServerHistory();
            } catch (error) {
                console.error('Failed to clear server chat history:', error);
            }
        } else {
            clearAnonymousHistory();
        }
    };

    const value = {
        isOpen,
        messages,
        isTyping,
        openChatbot,
        closeChatbot,
        sendMessage,
        clearChat,
    };

    return (
        <ChatbotContext.Provider value={value}>
            {children}
        </ChatbotContext.Provider>
    );
};
