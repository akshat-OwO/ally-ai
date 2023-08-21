'use client';

import { Ally } from '@prisma/client';
import { ElementRef, FC, useEffect, useRef, useState } from 'react';
import ChatMessage, { ChatMessageProps } from './ChatMessage';

interface ChatMessagesProps {
    messages: ChatMessageProps[];
    isLoading: boolean;
    ally: Ally;
}

const ChatMessages: FC<ChatMessagesProps> = ({ ally, isLoading, messages }) => {
    const [fakeLoading, setFakeLoading] = useState(
        messages.length === 0 ? true : false
    );

    const scrollRef = useRef<ElementRef<'div'>>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setFakeLoading(false);
        }, 1000);

        return () => {
            clearTimeout(timeout);
        };
    }, []);

    useEffect(() => {
        scrollRef?.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    return (
        <div className="flex-1 overflow-y-auto pr-4">
            <ChatMessage
                isLoading={fakeLoading}
                src={ally.src}
                role="system"
                content={`Hello I am ${ally.name}, ${ally.description}`}
            />
            {messages.map((message) => (
                <ChatMessage
                    key={message.content}
                    role={message.role}
                    content={message.content}
                    src={ally.src}
                />
            ))}
            {isLoading && (
                <ChatMessage role="system" src={ally.src} isLoading />
            )}
            <div ref={scrollRef} />
        </div>
    );
};

export default ChatMessages;
