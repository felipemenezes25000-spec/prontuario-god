import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CoPilotAssistant } from "@/components/ui/CoPilotAssistant";
import { ToastProvider } from "@/providers/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meridiana — Prontuário inteligente para cannabis medicinal",
  description:
    "O prontuário onde cada prescrição vira evidência clínica. Feito para o Brasil. Privacidade por design conforme a LGPD.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased min-h-screen">
        <ToastProvider>
          {children}
          <CoPilotAssistant />
        </ToastProvider>
      </body>
    </html>
  );
}
