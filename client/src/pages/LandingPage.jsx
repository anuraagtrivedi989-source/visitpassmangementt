import React from 'react';

/**
 * Minimal public landing page – shown before authentication.
 * Uses Tailwind CSS (already part of the project) and provides a clear
 * call‑to‑action that triggers the `onGetStarted` callback.
 */
export default function LandingPage({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <header className="w-full max-w-7xl flex justify-between items-center mb-8 px-5 sm:px-8 lg:px-12">
        <a href="#home" className="flex items-center gap-2.5 font-[Manrope] text-xl font-extrabold tracking-tight text-slate-900">
          <span className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-base text-white shadow-lg shadow-indigo-200">V</span>
          VisitPass
        </a>
        <button
          onClick={onGetStarted}
          className="!rounded-full !bg-white !px-5 !py-2.5 !text-sm !font-semibold !text-slate-700 !shadow-sm ring-1 ring-slate-200 transition hover:!bg-slate-50"
        >
          Sign in <span aria-hidden="true" className="ml-1 text-indigo-600">↗</span>
        </button>
      </header>

      {/* Hero section */}
      <section className="text-center max-w-2xl mb-12">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
          VisitPass – Digital Visitor Passes Made Easy
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Create, email and scan QR‑based visitor passes in seconds. No paper, no hassle.
        </p>
        {/* Optional hero image – replace with your own asset */}
        <img
          src="/hero-placeholder.png"
          alt="Visitor passes on a tablet"
          className="mx-auto w-full max-w-md rounded-lg shadow-md mb-8"
        />
        <button
          onClick={onGetStarted}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded transition"
        >
          Get Started
        </button>
      </section>

      {/* Feature teaser – three columns */}
      <section className="mt-12 grid md:grid-cols-3 gap-8 max-w-5xl w-full">
        <FeatureCard
          title="Instant PDF Pass"
          description="Every visitor receives a beautifully formatted PDF that can be printed or shown on‑device."
        />
        <FeatureCard
          title="QR‑Code Scan"
          description="Security staff can verify passes instantly by scanning the QR code."
        />
        <FeatureCard
          title="Free SMS Alerts"
          description="Optional SMS notifications via TextBee – no cost for low volumes."
        />
      </section>

      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} VisitPass. All rights reserved.
      </footer>
    </div>
  );
}

/** Reusable component for the feature grid */
function FeatureCard({ title, description }) {
  return (
    <div className="bg-white p-6 rounded shadow-sm text-center hover:shadow-md transition">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
