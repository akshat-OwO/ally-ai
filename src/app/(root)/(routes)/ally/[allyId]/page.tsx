import AllyForm from '@/components/AllyForm';
import prismadb from '@/lib/prismadb';
import { FC } from 'react';

interface pageProps {
    params: {
        allyId: string;
    };
}

const page: FC<pageProps> = async ({ params }) => {
    // TODO check subscription

    const ally = await prismadb.ally.findUnique({
        where: {
            id: params.allyId,
        },
    });

    const categories = await prismadb.category.findMany();

    return <AllyForm initialData={ally} categories={categories} />;
};

export default page;
