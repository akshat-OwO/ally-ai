import { MemoryManager } from '@/lib/memory';
import prismadb from '@/lib/prismadb';
import { rateLimit } from '@/lib/rate-limit';
import { currentUser } from '@clerk/nextjs';
import { LangChainStream, StreamingTextResponse } from 'ai';
import { CallbackManager } from 'langchain/callbacks';
import { Replicate } from 'langchain/llms/replicate';
import { NextResponse } from 'next/server';

export async function POST(
    req: Request,
    { params }: { params: { chatId: string } }
) {
    try {
        const { prompt } = await req.json();
        const user = await currentUser();

        if (!user || !user.firstName || !user.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const identifier = req.url + '-' + user.id;
        const { success } = await rateLimit(identifier);

        if (!success) {
            return new NextResponse('Rate limit exceeded', { status: 429 });
        }

        const ally = await prismadb.ally.update({
            where: {
                id: params.chatId,
            },
            data: {
                messages: {
                    create: {
                        content: prompt,
                        role: 'user',
                        userId: user.id,
                    },
                },
            },
        });

        if (!ally) {
            return new NextResponse('Ally not found', { status: 404 });
        }

        const name = ally.id;
        const ally_file_name = name + '.txt';

        const allyKey = {
            allyName: name,
            userId: user.id,
            modelName: 'llama2-13b',
        };

        const memoryManager = await MemoryManager.getInstance();

        const records = await memoryManager.readLatestHistory(allyKey);

        if (records.length === 0) {
            await memoryManager.seedChatHistory(ally.seed, '\n\n', allyKey);
        }

        await memoryManager.writeToHistory('User: ' + prompt + '\n', allyKey);

        const recentChatHistory = await memoryManager.readLatestHistory(
            allyKey
        );

        const similarDocs = await memoryManager.vectorSearch(
            recentChatHistory,
            ally_file_name
        );

        let relevantHistory = '';

        if (!!similarDocs && similarDocs.length !== 0) {
            relevantHistory = similarDocs
                .map((doc) => doc.pageContent)
                .join('\n');
        }

        const { handlers } = LangChainStream();

        const model = new Replicate({
            model: 'a16z-infra/llama-2-13b-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5',
            input: {
                max_length: 2048,
            },
            apiKey: process.env.REPLICATE_API_TOKEN,
            callbackManager: CallbackManager.fromHandlers(handlers),
        });

        model.verbose = true;

        const response = String(
            await model
                .call(
                    `
                    ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${ally.name}: prefix. 
            
                    ${ally.instructions}
            
                    Below are relevant details about ${ally.name}'s past and the conversation you are in.
                    ${relevantHistory}
            
            
                    ${recentChatHistory}\n${ally.name}:`
                )
                .catch(console.error)
        );

        const cleaned = response.replaceAll(',', '');
        const chunks = cleaned.split('\n');
        const resp = chunks[0];

        await memoryManager.writeToHistory('' + resp.trim(), allyKey);

        var Readable = require('stream').Readable;

        let s = new Readable();

        s.push(resp);
        s.push(null);

        if (resp !== undefined && resp.length > 0) {
            memoryManager.writeToHistory('' + resp.trim(), allyKey);

            await prismadb.ally.update({
                where: {
                    id: params.chatId,
                },
                data: {
                    messages: {
                        create: {
                            content: resp.trim(),
                            role: 'system',
                            userId: user.id,
                        },
                    },
                },
            });
        }

        return new StreamingTextResponse(s);
    } catch (error) {
        console.log('CHAT_POST', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
