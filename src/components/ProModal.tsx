'use client';

import { useProModalStore } from '@/hooks/use-pro-model';
import axios from 'axios';
import { FC, useState } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Separator } from './ui/separator';
import { useToast } from './ui/use-toast';

interface ProModalProps {}

const ProModal: FC<ProModalProps> = ({}) => {
    const proModal = useProModalStore();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const onSubscribe = async () => {
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
        <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
            <DialogContent>
                <DialogHeader className="space-y-4">
                    <DialogTitle className="text-center">
                        Upgrade to Pro
                    </DialogTitle>
                    <DialogDescription className="text-center space-y-2">
                        Create
                        <span className="text-sky-500 mx-1 font-medium">
                            Custom AI
                        </span>
                        Allies!
                    </DialogDescription>
                </DialogHeader>
                <Separator />
                <div className="flex justify-between">
                    <p className="text-2xl font-medium">
                        ₹10000
                        <span className="text-sm font-normal">.00 / mo</span>
                    </p>
                    <Button
                        onClick={onSubscribe}
                        disabled={isLoading}
                        variant="premium"
                    >
                        Subscribe
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProModal;
