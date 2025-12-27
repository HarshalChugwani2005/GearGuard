import Head from 'next/head';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(email, password);
        } catch (err) {
            setError('Invalid email or password');
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Login | GearGuard</title>
            </Head>

            <div className="flex min-h-screen bg-slate-50">
                {/* Left Side - Brand / Visual */}
                <div className="hidden lg:flex flex-1 bg-slate-900 items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-900/20 z-0"></div>
                    {/* Abstract Circle Decoration */}
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[100px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[100px]" />

                    <div className="relative z-10 text-white max-w-lg p-12">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldCheck className="w-12 h-12 text-blue-400" />
                            <span className="text-4xl font-bold tracking-tight">GearGuard</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Intelligent Maintenance Management</h2>
                        <p className="text-slate-300 text-lg leading-relaxed">
                            Seamlessly connect equipment, teams, and requests. Predict breakdowns before they happen with our AI-driven health scoring system.
                        </p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="w-full max-w-md space-y-8">
                        <div className="text-center lg:text-left">
                            <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
                            <p className="text-slate-500 mt-2">Enter your credentials to access your workspace.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Email Address</label>
                                <Input
                                    type="email"
                                    placeholder="technician@gearguard.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-slate-700">Password</label>
                                    <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">Forgot password?</a>
                                </div>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 text-base shadow-lg shadow-primary-500/20"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : "Sign in"}
                            </Button>

                            <p className="text-center text-sm text-slate-500">
                                Don't have an account? <a href="/register" className="font-medium text-primary-600 hover:text-primary-500">Register here</a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
