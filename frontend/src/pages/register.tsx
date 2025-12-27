import Head from 'next/head';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { Select } from '@/components/ui/select';

export default function RegisterPage() {
    const { register } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('viewer');
    const [department, setDepartment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await register(email, password, fullName, role, department);
        } catch (err) {
            setError('Registration failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Register | GearGuard</title>
            </Head>

            <div className="flex min-h-screen bg-slate-50">
                {/* Left Side - Brand / Visual */}
                <div className="hidden lg:flex flex-1 bg-slate-900 items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-900/20 z-0"></div>
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[100px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[100px]" />

                    <div className="relative z-10 text-white max-w-lg p-12">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldCheck className="w-12 h-12 text-blue-400" />
                            <span className="text-4xl font-bold tracking-tight">GearGuard</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Join Your Team</h2>
                        <p className="text-slate-300 text-lg leading-relaxed">
                            Create your account and start managing maintenance operations with your team.
                        </p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="w-full max-w-md space-y-8">
                        <div className="text-center lg:text-left">
                            <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
                            <p className="text-slate-500 mt-2">Fill in your details to get started.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Full Name</label>
                                <Input
                                    type="text"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>

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
                                <label className="text-sm font-medium text-slate-700">Password</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Role</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full h-11 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="viewer">Viewer</option>
                                    <option value="technician">Technician</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Department</label>
                                <Input
                                    type="text"
                                    placeholder="Mechanical"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
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
                                        Creating account...
                                    </>
                                ) : "Create Account"}
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-slate-50 px-2 text-slate-500">Or</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-11"
                                onClick={() => window.location.href = '/login'}
                            >
                                Sign in to existing account
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
