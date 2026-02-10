import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 relative flex font-sans text-gray-900 overflow-hidden">
            {/* Background Blobs */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fuchsia-200/40 rounded-full blur-3xl animate-blob" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-3xl animate-blob [animation-delay:2s]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-teal-100/30 rounded-full blur-3xl animate-blob [animation-delay:4s]" />
            </div>

            {/* Sidebar Fixed - Desktop Only */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 w-full lg:w-auto lg:ml-72 p-4 lg:p-8 transition-all duration-300 relative z-10">
                {/* Topbar */}
                <Topbar />

                {/* Page Content */}
                <div className="fade-in-up">
                    {children}
                </div>
            </main>
        </div>
    );
}
