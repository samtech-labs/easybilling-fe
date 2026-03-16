import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <Image
          src="/easybilling-logo.svg"
          alt="EazyBiz Invoice"
          width={280}
          height={84}
          priority
          className="mx-auto mb-8"
        />
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
          Facturare simpla si rapida
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          Genereaza facturi, trimite e-Factura catre ANAF si tine evidenta
          clientilor — totul dintr-un singur loc.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
          >
            Creeaza cont gratuit
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Autentificare
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
          Tot ce ai nevoie pentru facturare
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-indigo-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Facturi in secunde</h3>
            <p className="text-sm text-gray-500">
              Creeaza si descarca facturi PDF profesionale cu cateva click-uri.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-indigo-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">e-Factura ANAF</h3>
            <p className="text-sm text-gray-500">
              Trimite facturile direct catre ANAF prin sistemul e-Factura, integrat nativ.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-indigo-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Multi-valuta</h3>
            <p className="text-sm text-gray-500">
              Emite facturi in RON sau EUR, cu suport complet pentru export.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Planuri si preturi
          </h2>
          <p className="text-gray-500 text-center mb-10">
            Alege planul potrivit pentru afacerea ta.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Free */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
              <h3 className="text-lg font-bold text-gray-900">Gratuit</h3>
              <div className="mt-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">0</span>
                <span className="text-gray-500 ml-1">RON / luna</span>
              </div>
              <ul className="space-y-3 text-sm text-gray-600 flex-1">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Pana la 5 facturi / luna
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Export PDF
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Gestionare clienti
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  <span className="text-gray-400">e-Factura ANAF</span>
                </li>
              </ul>
              <Link
                href="/register"
                className="mt-6 block text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Incepe gratuit
              </Link>
            </div>

            {/* Standard */}
            <div className="bg-white rounded-xl border-2 border-indigo-600 p-6 flex flex-col relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Popular
              </span>
              <h3 className="text-lg font-bold text-gray-900">Standard</h3>
              <div className="mt-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">49</span>
                <span className="text-gray-500 ml-1">RON / luna</span>
              </div>
              <ul className="space-y-3 text-sm text-gray-600 flex-1">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Pana la 100 facturi / luna
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Export PDF
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Gestionare clienti
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  e-Factura ANAF
                </li>
              </ul>
              <Link
                href="/register"
                className="mt-6 block text-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Alege Standard
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
              <h3 className="text-lg font-bold text-gray-900">Premium</h3>
              <div className="mt-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">99</span>
                <span className="text-gray-500 ml-1">RON / luna</span>
              </div>
              <ul className="space-y-3 text-sm text-gray-600 flex-1">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Facturi nelimitate
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Export PDF
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Gestionare clienti
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  e-Factura ANAF
                </li>
              </ul>
              <Link
                href="/register"
                className="mt-6 block text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Alege Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-10 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} EazyBiz Invoice. Toate drepturile rezervate.
      </footer>
    </div>
  );
}
