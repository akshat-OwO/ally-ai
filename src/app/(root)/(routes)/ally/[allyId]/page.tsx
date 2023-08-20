import AllyForm from '@/components/AllyForm';
import prismadb from '@/lib/prismadb';
import { auth, redirectToSignIn } from '@clerk/nextjs';
import { FC } from 'react';

interface pageProps {
    params: {
        allyId: string;
    };
}

const page: FC<pageProps> = async ({ params }) => {
    const { userId } = auth();
    // TODO check subscription

    if (!userId) {
        return redirectToSignIn();
    }

    const ally = await prismadb.ally.findUnique({
        where: {
            id: params.allyId,
            userId,
        },
    });

    const categories = await prismadb.category.findMany();

    return <AllyForm initialData={ally} categories={categories} />;
};

export default page;
