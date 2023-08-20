import prismadb from '@/lib/prismadb';
import { auth, currentUser } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function PATCH(
    req: Request,
    { params }: { params: { allyId: string } }
) {
    try {
        const body = await req.json();
        const user = await currentUser();
        const { src, name, description, instructions, seed, categoryId } = body;

        if (!params.allyId) {
            return new NextResponse('Ally Id is required', { status: 400 });
        }

        if (!user || !user.id || !user.firstName) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        if (
            !src ||
            !name ||
            !description ||
            !instructions ||
            !seed ||
            !categoryId
        ) {
            return new NextResponse('Missing Required fields', { status: 400 });
        }

        // TODO: Check for subscription

        const ally = await prismadb.ally.update({
            where: {
                id: params.allyId,
                userId: user.id,
            },
            data: {
                categoryId,
                userId: user.id,
                userName: user.firstName,
                src,
                name,
                description,
                instructions,
                seed,
            },
        });

        return NextResponse.json(ally);
    } catch (error) {
        console.log('[Ally Patch', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { allyId: string } }
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const ally = await prismadb.ally.delete({
            where: {
                userId,
                id: params.allyId,
            },
        });

        return NextResponse.json(ally);
    } catch (error) {
        console.log('[ally Delete]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
