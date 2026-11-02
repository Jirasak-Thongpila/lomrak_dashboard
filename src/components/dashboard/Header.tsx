"use client";

import Image from "next/image";
import { RefreshCw, Download, Settings, CheckCircle2, AlertCircle } from "lucide-react";

interface HeaderProps {
  source: "google_sheets" | "fallback_cache";
  updatedAt: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onExportCsv: () => void;
  onOpenGasSetup: () => void;
}

export function Header({
  source,
  updatedAt,
  isRefreshing,
  onRefresh,
  onExportCsv,
  onOpenGasSetup,
}: HeaderProps) {
  const isOnline = source === "google_sheets";
  const formattedTime = new Date(updatedAt).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-pink-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg shadow-pink-500/20 overflow-hidden border-2 border-pink-100 shrink-0">
            <Image
              src="/lomrak-logo.png"
              alt="ตราสัญลักษณ์โครงการหมู่บ้านชุมชนล้อมรักษ์"
              width={56}
              height={56}
              priority
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-[0.2em] text-pink-600">
                Dashboard
              </span>
              <span className="h-px w-8 bg-rose-400" aria-hidden="true" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black leading-none text-pink-800 tracking-tight drop-shadow-sm">
                หมู่บ้านชุมชนล้อมรักษ์
              </h1>
              <span className="bg-rose-100 text-rose-700 text-xs px-2.5 py-1 rounded-full font-extrabold border border-rose-200 shadow-sm">
                จ.ศรีสะเกษ
              </span>
            </div>
            <p className="text-xs md:text-sm font-medium text-slate-600 mt-1">
              ระบบสารสนเทศติดตามและประเมินผลโครงการบำบัดฟื้นฟูโดยชุมชนเป็นศูนย์กลาง (CBTx)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Connection status badge */}
          <button
            onClick={onOpenGasSetup}
            title="คลิกเพื่อดูการตั้งค่า Google Apps Script"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              isOnline
                ? "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100"
                : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
            }`}
          >
            {isOnline ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-pink-500" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            )}
            <span>{isOnline ? "Google Sheets สด" : "ข้อมูลจำลอง (Demo)"}</span>
            <span className="text-slate-500 text-[11px]">• {formattedTime}</span>
          </button>

          {/* Sync Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-pink-50 text-slate-700 rounded-lg text-xs font-medium transition disabled:opacity-50 border border-pink-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-pink-500" : ""}`} />
            <span>ซิงค์ข้อมูล</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-xs font-medium transition shadow-md shadow-pink-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก CSV</span>
          </button>

          {/* GAS Setup button */}
          <button
            onClick={onOpenGasSetup}
            className="p-1.5 bg-white hover:bg-pink-50 text-slate-600 rounded-lg transition border border-pink-200"
            title="ตั้งค่า Google Apps Script"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
