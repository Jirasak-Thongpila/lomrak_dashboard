"use client";

import { RefreshCw, Download, Settings, HeartPulse, CheckCircle2, AlertCircle } from "lucide-react";

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
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
                หมู่บ้านชุมชนล้อมรักษ์
              </h1>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-medium border border-emerald-500/30">
                จ.ศรีสะเกษ
              </span>
            </div>
            <p className="text-xs text-slate-400">
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
                ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/50"
                : "bg-amber-950/40 text-amber-300 border-amber-800/80 hover:bg-amber-900/50"
            }`}
          >
            {isOnline ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{isOnline ? "Google Sheets สด" : "ข้อมูลจำลอง (Demo)"}</span>
            <span className="text-slate-400 text-[11px]">• {formattedTime}</span>
          </button>

          {/* Sync Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition disabled:opacity-50 border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
            <span>ซิงค์ข้อมูล</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition shadow-md shadow-emerald-700/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก CSV</span>
          </button>

          {/* GAS Setup button */}
          <button
            onClick={onOpenGasSetup}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition border border-slate-700"
            title="ตั้งค่า Google Apps Script"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
