'use client';

import { useDebounce } from '@/hooks/use-debounce';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import qs from 'query-string';
import { ChangeEventHandler, FC, useEffect, useState } from 'react';
import { Input } from './ui/input';

interface SearchInputProps {}

const SearchInput: FC<SearchInputProps> = ({}) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const categoryId = searchParams.get('categoryId');
    const name = searchParams.get('name');

    const [value, setValue] = useState<string>(name || '');
    const debouncedValue = useDebounce<string>(value, 500);

    useEffect(() => {
        const query = {
            name: debouncedValue,
            categoryId: categoryId,
        };

        const url = qs.stringifyUrl(
            {
                url: window.location.href,
                query,
            },
            { skipEmptyString: true, skipNull: true }
        );

        router.push(url);
    }, [router, categoryId, debouncedValue]);

    const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setValue(e.target.value);
    };

    return (
        <div className="relative">
            <Search className="absolute h-4 w-4 top-3 left-4 text-muted-foreground" />
            <Input
                onChange={onChange}
                value={value}
                placeholder="search..."
                className="pl-10 bg-primary/10"
            />
        </div>
    );
};

export default SearchInput;
