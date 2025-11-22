import { Link } from "react-router-dom";

export default function SubscriptionPage() {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-6">
        Suscríbete a Historika
      </h1>
      <p className="text-gray-700 text-center mb-8">
        Accede a contenido exclusivo, artículos profundos
      </p>

<div className="w-full flex justify-center mb-12">
  <div className="w-full max-w-md border rounded-lg p-6 shadow-lg flex flex-col transform scale-105 border-yellow-500">
    <h2 className="text-2xl font-semibold mb-4">Plus</h2>
    <p className="text-2xl mb-4">
      $100 de por vida<br />
    </p>
    <ul className="flex-1 mb-4 space-y-2">
      <li>✅ Todo del plan Digital</li>
    </ul>
    <Link
      to="/suscribete"
      className="mt-auto bg-yellow-500 text-white text-center py-3 rounded-lg hover:bg-yellow-600"
    >
      Suscríbete
    </Link>
  </div>
</div>

      
    </main>
  );
}

