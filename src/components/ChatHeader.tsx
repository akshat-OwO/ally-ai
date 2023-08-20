'use client';

import { useUser } from '@clerk/nextjs';
import { Ally, Message } from '@prisma/client';
import axios from 'axios';
import {
    ChevronLeft,
    Edit,
    MessagesSquare,
    MoreVertical,
    Trash,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import BotAvatar from './BotAvatar';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useToast } from './ui/use-toast';

interface ChatHeaderProps {
    ally: Ally & {
        messages: Message[];
        _count: {
            messages: number;
        };
    };
}

const ChatHeader: FC<ChatHeaderProps> = ({ ally }) => {
    const router = useRouter();
    const { user } = useUser();

    const { toast } = useToast();

    const onDelete = async () => {
        try {
            await axios.delete(`/api/ally/${ally.id}`);

            toast({
                description: 'Success.',
            });

            router.refresh();
            router.push('/');
        } catch (error) {
            toast({
                description: 'Something went wrong',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="flex w-full justify-between items-center border-b border-primary/10 pb-4">
            <div className="flex gap-x-2 items-center">
                <Button
                    onClick={() => router.back()}
                    size="icon"
                    variant="ghost"
                >
                    <ChevronLeft className="h-8 w-8" />
                </Button>
                <BotAvatar src={ally.src} />
                <div className="flex flex-col gap-y-1">
                    <div className="flex items-center gap-x-2">
                        <p className="font-bold">{ally.name}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                            <MessagesSquare className="w-3 h-3 mr-1" />
                            {ally._count.messages}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Created by {ally.userName}
                    </p>
                </div>
            </div>
            {user?.id === ally.userId && (
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Button variant="secondary" size="icon">
                            <MoreVertical />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => router.push(`/ally/${ally.id}`)}
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete}>
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
};

export default ChatHeader;
