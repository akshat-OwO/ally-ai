'use client';

import { Ally, Message } from '@prisma/client';
import { useCompletion } from 'ai/react';
import { useRouter } from 'next/navigation';
import { FC, FormEvent, useState } from 'react';
import ChatForm from './ChatForm';
import ChatHeader from './ChatHeader';
import { ChatMessageProps } from './ChatMessage';
import ChatMessages from './ChatMessages';

interface ChatClientProps {
    ally: Ally & {
        messages: Message[];
        _count: {
            messages: number;
        };
    };
}

const ChatClient: FC<ChatClientProps> = ({ ally }) => {
    const router = useRouter();
    const [messages, setMessages] = useState<ChatMessageProps[]>(ally.messages);

    const { input, isLoading, handleInputChange, handleSubmit, setInput } =
        useCompletion({
            api: `/api/chat/${ally.id}`,
            onFinish(prompt, completion) {
                const systemMessage: ChatMessageProps = {
                    role: 'system',
                    content: completion,
                };
                setMessages((current) => [...current, systemMessage]);
                setInput('');

                router.refresh();
            },
        });

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        const userMessage: ChatMessageProps = {
            role: 'user',
            content: input,
        };

        setMessages((current) => [...current, userMessage]);

        handleSubmit(e);
    };

    return (
        <div className="flex flex-col h-full p-4 space-y-2">
            <ChatHeader ally={ally} />
            <ChatMessages
                ally={ally}
                isLoading={isLoading}
                messages={messages}
            />
            <ChatForm
                isLoading={isLoading}
                input={input}
                handleInputChange={handleInputChange}
                onSubmit={onSubmit}
            />
        </div>
    );
};

export default ChatClient;
