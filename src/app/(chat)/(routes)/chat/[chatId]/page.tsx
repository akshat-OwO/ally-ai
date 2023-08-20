import ChatClient from '@/components/ChatClient';
import prismadb from '@/lib/prismadb';
import { auth, redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { FC } from 'react';

interface pageProps {
    params: {
        chatId: string;
    };
}

const page: FC<pageProps> = async ({ params }) => {
    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }

    const ally = await prismadb.ally.findUnique({
        where: {
            id: params.chatId,
        },
        include: {
            messages: {
                orderBy: {
                    createdAt: 'desc',
                },
                where: {
                    userId,
                },
            },
            _count: {
                select: {
                    messages: true,
                },
            },
        },
    });

    if (!ally) {
        return redirect('/');
    }

    return <ChatClient ally={ally} />;
};

export default page;
