'use client';


import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);


  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);


    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://bizcelona-app.vercel.app/reset-password',
      });


      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }


      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };
