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
    <html lang="th">
      <body className="bg-slate-50 text-slate-800 antialiased min-h-screen selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
