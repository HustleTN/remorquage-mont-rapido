"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Lock, Mail } from 'lucide-react';

export default function DriverLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error: dbError } = await supabase
        .from('drivers')
        .select('*')
        .eq('email', email)
        .eq('pin_code', pin)
        .eq('is_active', true)
        .single();

      if (dbError || !data) {
        setError('Email ou code PIN incorrect');
        setIsLoading(false);
        return;
      }

      // Store driver ID in localStorage
      localStorage.setItem('driver_id', data.id);
      localStorage.setItem('driver_name', data.name);

      // Redirect to dashboard
      router.push('/driver/dashboard');
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen md:bg-white bg-gradient-to-br from-brand-navy via-brand-navy to-brand-red flex items-center justify-center md:p-4 p-0">
      <div className="w-full max-w-md md:m-0">
        {/* Mobile App Header */}
        <div className="md:bg-brand-navy md:border-2 border-0 md:border-brand-navy bg-transparent text-white md:p-8 p-6 text-center md:mb-8 mb-6">
          <div className="w-20 h-20 md:w-16 md:h-16 bg-brand-red md:rounded-none rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl md:shadow-none">
            <Lock className="w-10 h-10 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-3xl font-bold mb-2 drop-shadow-lg md:drop-shadow-none">Portail Chauffeur</h1>
          <p className="text-white/90 md:text-white/80 font-medium">Remorquage Mont Rapido</p>
        </div>

        {/* Login Form */}
        <div className="bg-white md:border-2 border-0 border-brand-navy md:p-8 p-6 md:shadow-md shadow-2xl md:rounded-none rounded-3xl mx-4 md:mx-0">
          <form onSubmit={handleLogin} className="space-y-5 md:space-y-6">
            <div>
              <label className="block font-bold mb-2 text-brand-navy text-sm flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="raed@remorquagemontrapido.ca"
                required
                className="md:border-2 border-2 border-brand-navy md:rounded-none rounded-lg h-12 md:h-auto"
              />
            </div>

            <div>
              <label className="block font-bold mb-2 text-brand-navy text-sm flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Code PIN
              </label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="****"
                required
                className="md:border-2 border-2 border-brand-navy text-2xl tracking-widest md:rounded-none rounded-lg h-14 md:h-auto text-center"
              />
              <p className="text-xs text-brand-navy/60 mt-2 text-center md:text-left">
                Entrez votre code PIN à 4 chiffres
              </p>
            </div>

            {error && (
              <div className="bg-brand-red/10 md:border-2 border border-brand-red md:rounded-none rounded-xl p-4 text-brand-red text-sm font-medium">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || email.length === 0 || pin.length !== 4}
              className="w-full bg-brand-red text-white md:border-2 border-0 border-brand-navy font-bold uppercase tracking-wide py-6 md:py-6 text-lg md:rounded-none rounded-xl shadow-lg md:shadow-none hover:bg-brand-red-dark disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 md:active:scale-100 transition-transform"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          <div className="mt-5 md:mt-6 p-4 bg-brand-gray md:border-2 border border-brand-navy md:rounded-none rounded-xl">
            <p className="text-xs text-brand-navy/70 text-center">
              <strong>Besoin d'aide?</strong><br />
              Contactez votre superviseur pour obtenir vos identifiants.
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6 md:mt-6">
          <a href="/" className="md:text-brand-navy text-white hover:text-brand-red md:hover:text-brand-red font-bold text-sm uppercase drop-shadow-lg md:drop-shadow-none">
            ← Retour au site
          </a>
        </div>
      </div>
    </div>
  );
}
