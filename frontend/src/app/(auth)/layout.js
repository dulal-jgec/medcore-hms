export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-background antialiased">
      {children}
    </div>
  );
}