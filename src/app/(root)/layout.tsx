import Navbar from '@/components/Navbar';
import { FC, ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
    return (
        <div className="h-full">
            <Navbar />
            <main className="md:pl-20 pt-16 h-full">{children}</main>
        </div>
    );
};

export default Layout;
