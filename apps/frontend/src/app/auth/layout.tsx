// This layout is handled by ClientLayout component in the root layout
// Auth pages are detected by pathname and don't render Navigation/Footer
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
