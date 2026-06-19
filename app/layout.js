import "./globals.css";

export const metadata = {
  title: "Vatra.al — Pasuri të Paluajtshme",
  description: "Apartamente, vila dhe toka në shitje e me qera në të gjithë Shqipërinë.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="sq">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cream text-ink font-sans">{children}</body>
    </html>
  );
}
