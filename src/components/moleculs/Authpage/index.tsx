'use client'

import Image from "next/image";
import image1 from "@/public/images/auth-img.png";
import { useState,useRef } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Spinner } from "@/components/ui/spinner"
import { useRouter } from "next/navigation";
import { login, register } from "@/services/auth";

export const AuthPage = () => {
    const [showPassword, setShowPassword ] = useState(false)
    const [ isLogin, setIsLogin ] = useState(false)
    const termsCheckBoxRef = useRef<HTMLInputElement>(null)
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        number: "",
        email: "",
        password: ""
    })

    const handleShowPassword = () => {
        setShowPassword(prevShowPassword => !prevShowPassword);
    };

    const handleNotRegister = () => {
        setIsLogin(prev => !prev)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setLoading(true)

        try {
            let response;
            if(isLogin) {
                response = await login({
                    email: formData.email,
                    password: formData.password
                })
            } else {
                if(formData.number.startsWith("0")) {
                    setErrors({number: "No HP tidak boleh diawali 0"});
                    setLoading(false);
                    return
                }
                if(!termsCheckBoxRef.current?.checked) {
                    setErrors({ terms: "Setujui Terms & Privacy untuk melanjutkan"});
                    setLoading(false)
                    return
                }
                response = await register({
                    ...formData,
                    nohp: `+62${formData.number}`
                })
            }

            router.push(response.redirectTo)

        } catch (error) {
            if(error instanceof Error) {
                setErrors({ general: error.message})
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8 ">
            <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-7xl bg-white shadow-2xl rounded-2xl overflow-hidden">

                <div className="p-8 sm:p-12 min-h-140 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </h2>

                    <p className="text-sm font-bold text-gray-900 mb-2">
                       { isLogin ?   'Welcome Back!' : "Let's Sign Up to Get Started!"}
                    </p>

                    <form onSubmit={handleSubmit}>
                        {!isLogin && 
                        <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                        <label htmlFor="name" className="block text-same font-medium text-gray-700">Full Name</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Masukkan Nama Lengkap" className="text-black w-full mt-2 p-4 border rounded-md px-4 py-2 border-gray-400" required/>
                        </div>
                        
                        <div>
                        <label htmlFor="number" className="block text-same font-medium text-gray-700">No Hp</label>
                        <div className="relative">
                            <div className="absolute left-3 top-4 text-gray-600">
                                +62
                            </div>
                        </div>
                        <input type="text" id="number" required
                        value={formData.number} onChange={(e) => setFormData({...formData, number: e.target.value})}
                         placeholder="8xxxxx" className="w-full pl-12 mt-2 p-4 border rounded-md px-4 py-2 border-gray-400 text-black"/>
                    {errors.number && <>
                    <p className="text-red-500 text-xs mt-1">{errors.number}</p>
                    </>}
                        </div>
                        </div>
                    }
                        <div>
                        <label htmlFor="email" className="block text-same font-medium text-gray-700">Email</label>
                        <input type="email" required
                        value={formData.email} style={{
    backgroundColor: "white",
    accentColor: "#4f46e5",
  }} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Masukkan Email" className="text-black w-full mt-2 p-4 border rounded-md px-4 py-2 border-gray-400"/>
                        </div>

                        <div className="mt-2 relative">
                        <label htmlFor="password" className="block text-same font-medium text-gray-700 mt-1">Password</label>
                        <input type={showPassword ? 'password' : 'text'} required
                        value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value}) }placeholder="Masukkan Password" 
                        className="w-full mt-2 p-4 border rounded-md px-4 py-2 border-gray-400 text-black"/>

                        <button type="button" className="absolute right-3 bottom-3 cursor-pointer text-black" 
                        onClick={handleShowPassword}>
                            {showPassword ? <AiOutlineEyeInvisible /> : < AiOutlineEye/>}
                        </button>
                        </div>

                        {!isLogin &&
                        <div className="flex items-center gap-2 py-4">
                            <input type="checkbox" id="term" ref={termsCheckBoxRef} required
                                style={{
    backgroundColor: "white",
    accentColor: "#4f46e5",
  }}
                            className="w-4 h-4 text-indigo-600 border-gray-200 rounded"
                            />
                            <label htmlFor="term" className="text-black">I agree to the {" "}
                                <button className="text-indigo-600 hover:underline" type="button">Term & Privacy Policy</button>
                            </label>
                        </div> 
                    }
                    {errors.terms && <>
                    <p className="text-red-500 text-xs mt-1">{errors.terms}</p>
                    </>}
                        <div className="mt-2">
                        <button type="submit" disabled={loading}
                        className=
                        {`w-full py-2 px-4 flex items-center justify-center gap-2 
                        ${loading ?
                        'bg-indigo-300 hover:bg-indigo-400 rounded-md text-white cursor-not-allowed' 
                        :  'bg-indigo-600 hover:bg-indigo-700 rounded-md text-white cursor-pointer'
                        } `}>
                            {
                            loading ? (
                                <>
                                <Spinner className="size-6 text-black" />
                                processing...
                            </>) :
                           ( isLogin ? "Let's Explore" : "Get Started")
                            }
                        </button>
                        </div>  
                        <div className="flex justify-center mt-4 gap-1">
                            {isLogin ? 
                            <>
                        <p className="text-sm text-black">Don&apos;t have an account? </p>
                        <button className="text-indigo-600 text-sm cursor-pointer hover:underline" type="button"
                        onClick={handleNotRegister}
                        >Sign Up</button>
                            </>
                            : 
                            <>
                        <p className="text-sm text-black">Already have an account? </p>
                        <button type="button" className="text-indigo-600 text-sm cursor-pointer hover:underline" onClick={handleNotRegister}> Sign In</button>
                            </>
                            }
                        </div>
                    </form>
                </div>

                <div className="hidden md:block bg-indigo-600 relative min-h-140 w-full">
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
