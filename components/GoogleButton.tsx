export default function GoogleButton({ label = "Войти через Google" }: { label?: string }) {
  return (
    <a
      href="/api/auth/google"
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-surface px-6 py-3 text-sm font-semibold transition-colors hover:border-accent"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.42 3.58v2.98h3.91c2.29-2.11 3.53-5.22 3.53-8.8z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.91-2.98c-1.08.73-2.46 1.15-4.02 1.15-3.09 0-5.71-2.09-6.64-4.89H1.32v3.07C3.29 21.3 7.31 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.36 14.37A7.2 7.2 0 0 1 5 12c0-.82.13-1.62.36-2.37V6.56H1.32A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.32 5.44l4.04-3.07z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.45-3.45C17.94 1.19 15.24 0 12 0 7.31 0 3.29 2.7 1.32 6.56l4.04 3.07C6.29 6.84 8.91 4.75 12 4.75z"
        />
      </svg>
      {label}
    </a>
  );
}
