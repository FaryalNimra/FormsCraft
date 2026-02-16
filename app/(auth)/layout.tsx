// app/(auth)/layout.tsx
// Auth pages layout - Centered card design like Google Forms

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* Google Forms style - centered card */}
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-600">FormCraft</h1>
          <p className="text-gray-500 mt-1">Build beautiful forms</p>
        </div>
        
        {/* Auth Card */}
        {children}
      </div>
    </div>
  );
}
