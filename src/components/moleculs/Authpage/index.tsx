'use client'

import Image from "next/image";
import image1 from "../../../../public/images/auth-img.webp";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export const Authpage = () => {
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleShowPassword = () => {
        setShowPassword(prevShowPassword => !prevShowPassword);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await login({
                email: formData.email,
                password: formData.password,
            });

            router.push(response.redirectTo);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-4 ">
            <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-7xl bg-white shadow-2xl rounded-2xl overflow-hidden">

                <div className="p-4 sm:p-12 min-h-140 flex flex-col justify-center">

                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        Sign In
                    </h2>

                    <p className="text-sm font-bold text-gray-900 mb-6">
                        Welcome Back!
                    </p>

                    <form onSubmit={handleSubmit}>

                        <div>
                            <label className="block font-medium text-gray-700">
                                Email
                            </label>

                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                                placeholder="Masukkan Email"
                                className="text-black w-full mt-2 p-4 border rounded-md border-gray-400"
                            />
                        </div>

                        <div className="mt-4 relative">
                            <label className="block font-medium text-gray-700">
                                Password
                            </label>

                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password: e.target.value,
                                    })
                                }
                                placeholder="Masukkan Password"
                                className="text-black w-full mt-2 p-4 border rounded-md border-gray-400"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 bottom-3 text-black cursor-pointer"
                            >
                            </button>
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm mt-3">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-5 py-3 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 rounded-md text-white cursor-pointer disabled:bg-red-200"
                        >
                            {loading ? (
                                <>
                                    <Spinner className="size-5" />
                                    Processing...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>

                    </form>
                </div>

                <div className="hidden md:block bg-red-600 relative min-h-140 w-full">
                    <Image
                        src={image1}
                        alt="auth image"
                        fill
                        priority
                    />
                </div>
            </div>

        </div>
    )
}
