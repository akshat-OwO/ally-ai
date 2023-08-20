'use client';

import { cn } from '@/lib/utils';
import { Copy } from 'lucide-react';
import { useTheme } from 'next-themes';
import { FC } from 'react';
import { BeatLoader } from 'react-spinners';
import BotAvatar from './BotAvatar';
import UserAvatar from './UserAvatar';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';

export interface ChatMessageProps {
    role: 'system' | 'user';
    content?: string;
    isLoading?: boolean;
    src?: string;
}

const ChatMessage: FC<ChatMessageProps> = ({
    role,
    content,
    isLoading,
    src,
}) => {
    const { toast } = useToast();
    const { theme } = useTheme();

    const onCopy = () => {
        if (!content) {
            return;
        }
        navigator.clipboard.writeText(content);
        toast({
            description: 'Message copied to clipboard',
        });
    };

    return (
        <div
            className={cn(
                'group flex items-center gap-x-3 py-4 w-full',
                role === 'user' && 'justify-end'
            )}
        >
            {role !== 'user' && src && <BotAvatar src={src} />}
            <div className="rounded-md px-4 py-2 max-w-sm text-sm bg-primary/10">
                {isLoading ? (
                    <BeatLoader
                        size={5}
                        color={theme === 'light' ? 'black' : 'white'}
                    />
                ) : (
                    content
                )}
            </div>
            {role === 'user' && <UserAvatar />}
            {role !== 'user' && !isLoading && (
                <Button
                    onClick={onCopy}
                    className="opacity-0 group-hover:opacity-100 transition"
                    size="icon"
                    variant="ghost"
                >
                    <Copy className="w-4 h-4" />
                </Button>
            )}
        </div>
    );
};

export default ChatMessage;
