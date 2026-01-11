import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-surface font-sans selection:bg-primary/20 selection:text-primary-dark">
            <Sidebar />
            {/* 
        Add top padding for mobile to account for the hamburger menu 
        Remove left padding on mobile, apply it only on lg screens
      */}
            <main className="transition-all duration-300 ease-in-out lg:pl-72 pt-16 lg:pt-0">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-12">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
