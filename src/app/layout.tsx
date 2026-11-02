import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ระบบสารสนเทศติดตามโครงการหมู่บ้านชุมชนล้อมรักษ์ จ.ศรีสะเกษ",
  description: "แดชบอร์ดติดตามและประเมินผลโครงการบำบัดฟื้นฟูโดยชุมชนเป็นศูนย์กลาง (CBTx) 22 อำเภอ จังหวัดศรีสะเกษ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
