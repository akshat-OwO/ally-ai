'use client';

import { Ally, Message } from '@prisma/client';
import { FC } from 'react';
import ChatHeader from './ChatHeader';

interface ChatClientProps {
    ally: Ally & {
        messages: Message[];
        _count: {
            messages: number;
        };
    };
}

const ChatClient: FC<ChatClientProps> = ({ ally }) => {
    return (
        <div className="flex flex-col h-full p-4 space-y-2">
            <ChatHeader ally={ally} />
        </div>
    );
};

export default ChatClient;
