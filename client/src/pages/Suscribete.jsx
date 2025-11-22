import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { useNavigate } from 'react-router-dom';

export default function Suscribete() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!stripe || !elements) return;

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/dashboard',
      },
      redirect: 'if_required',
    });

    if (error) {
      setModalMessage(`❌ ${error.message}`);
      setShowModal(true);
    } else if (paymentIntent?.status === 'succeeded') {
      setModalMessage('✅ ¡Pago exitoso! Ya tienes acceso premium.');
      setShowModal(true);
    } else {
      setModalMessage('⚠️ El pago está en proceso o no se pudo completar.');
      setShowModal(true);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 mb-14 bg-white rounded-lg border border-yellow-500 shadow-lg">
      <h2 className="text-3xl font-bold text-yellow-600 mb-2 text-center">Plan Plus</h2>
      <p className="text-center text-gray-600 mb-6 text-lg">
        Suscríbete por <strong>$100.00 MXN/mes</strong> y recibe acceso digital ilimitado.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <PaymentElement />
        </div>

        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded transition"
        >
          {loading ? 'Procesando pago...' : 'Confirmar suscripción'}
        </button>
      </form>

      <Modal
        show={showModal}
        size="md"
        onClose={() => setShowModal(false)}
        popup
      >
        <ModalHeader className="hidden" />
        <ModalBody>
          <div className="text-center">
            <h3 className="mb-5 text-lg font-normal text-gray-700">{modalMessage}</h3>
            <button
              onClick={() => navigate('/')}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Ir al inicio
            </button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
}
