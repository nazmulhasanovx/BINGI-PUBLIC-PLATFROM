import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="font-heading text-6xl font-bold text-action">404</p>
        <h1 className="mt-3 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-muted">Check the address, or go back to the start.</p>
        <Link href="/" className="mt-6 inline-flex h-12 items-center rounded-full bg-action px-6 font-semibold text-on-action">Go home</Link>
      </div>
    </main>
  );
}
