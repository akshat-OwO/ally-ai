'use client';

import axios from 'axios';
import { Sparkles } from 'lucide-react';
import { FC, useState } from 'react';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';

interface SubscriptionButtonProps {
    isPro: boolean;
}

const SubscriptionButton: FC<SubscriptionButtonProps> = ({ isPro = false }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { toast } = useToast();

    const onClick = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/stripe');

            window.location.href = response.data.url;
        } catch (error) {
            toast({
                description: 'Something went wrong',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={onClick}
            disabled={isLoading}
            size="sm"
            variant={isPro ? 'default' : 'premium'}
        >
            {isPro ? 'Manage Subscription' : 'Upgrade'}
            {!isPro && <Sparkles className="h-4 w-4 ml-2 fill-white" />}
        </Button>
    );
};

export default SubscriptionButton;
