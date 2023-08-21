import { PineconeClient } from '@pinecone-database/pinecone';
import { Redis } from '@upstash/redis';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';

export type AllyKey = {
    allyName: string;
    modelName: string;
    userId: string;
};

export class MemoryManager {
    private static instance: MemoryManager;
    private history: Redis;
    private vectorDBClient: PineconeClient;

    public constructor() {
        this.history = Redis.fromEnv();
        this.vectorDBClient = new PineconeClient();
    }

    public async init() {
        if (this.vectorDBClient instanceof PineconeClient) {
            await this.vectorDBClient.init({
                apiKey: process.env.PINECONE_API_KEY!,
                environment: process.env.PINECONE_ENVIRONMENT!,
            });
        }
    }

    public async vectorSearch(recentChatHistory: string, allyFileName: string) {
        const pineconeClient = <PineconeClient>this.vectorDBClient;

        const pineconeIndex = pineconeClient.Index(
            process.env.PINECONE_INDEX! || ''
        );

        const vectorStore = await PineconeStore.fromExistingIndex(
            new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_KEY }),
            { pineconeIndex }
        );

        const similarDocs = await vectorStore
            .similaritySearch(recentChatHistory, 3, { fileName: allyFileName })
            .catch((error) => {
                console.log('failed to get vector search results', error);
            });

        return similarDocs;
    }

    public static async getInstance(): Promise<MemoryManager> {
        if (!MemoryManager.instance) {
            MemoryManager.instance = new MemoryManager();
            await MemoryManager.instance.init();
        }

        return MemoryManager.instance;
    }

    private generateRedisAllyKey(allykey: AllyKey): string {
        return `${allykey.allyName}-${allykey.modelName}-${allykey.userId}`;
    }

    public async writeToHistory(text: string, allykey: AllyKey) {
        if (!allykey || typeof allykey.userId == 'undefined') {
            console.log('Ally Key set incorrectly');
            return '';
        }

        const key = this.generateRedisAllyKey(allykey);
        const result = this.history.zadd(key, {
            score: Date.now(),
            member: text,
        });

        return result;
    }

    public async readLatestHistory(allykey: AllyKey): Promise<string> {
        if (!allykey || typeof allykey.userId == 'undefined') {
            console.log('Ally Key set incorrectly');
            return '';
        }

        const key = this.generateRedisAllyKey(allykey);
        let result = await this.history.zrange(key, 0, Date.now(), {
            byScore: true,
        });

        result = result.slice(-30).reverse();
        const recentChats = result.reverse().join('\n');
        return recentChats;
    }

    public async seedChatHistory(
        seedContent: string,
        delimeter: string = '\n',
        allykey: AllyKey
    ) {
        const key = this.generateRedisAllyKey(allykey);

        if (await this.history.exists(key)) {
            console.log('User already has chat history');
            return;
        }

        const content = seedContent.split(delimeter);
        let counter = 0;

        for (const line of content) {
            await this.history.zadd(key, { score: counter, member: line });
            counter += 1;
        }
    }
}
