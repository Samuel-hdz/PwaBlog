// pages/SuscribeteWrapper.jsx
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';
import Suscribete from './Suscribete';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function SuscribeteWrapper() {
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    const fetchClientSecret = async () => {
      try {
        const res = await fetch('/api/user/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await res.json();
        if (res.ok) {
          setClientSecret(data.clientSecret);
        } else {
          console.error('Error:', data.error);
        }
      } catch (err) {
        console.error('Error al obtener clientSecret:', err);
      }
    };

    fetchClientSecret();
  }, []);

  const appearance = {
    theme: 'stripe',
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <>
      {clientSecret ? (
        <Elements stripe={stripePromise} options={options}>
          <Suscribete />
        </Elements>
      ) : (
        <div className="text-center mt-20">Cargando formulario de pago...</div>
      )}
    </>
  );
}
