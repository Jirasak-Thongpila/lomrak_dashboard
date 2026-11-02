"use client";

import {
  RefreshCw,
  Download,
  Settings,
  HeartPulse,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import type { SseConnectionStatus } from "@/types/lomrak";

interface HeaderProps {
  source: "google_sheets" | "fallback_cache";
  updatedAt: string;
  isRefreshing: boolean;
  isSilentSyncing?: boolean;
  sseStatus?: SseConnectionStatus;
  onRefresh: () => void;
  onExportCsv: () => void;
  onOpenGasSetup: () => void;
  onOpenProjectInfo?: () => void;
}

export function Header({
  source,
  updatedAt,
  isRefreshing,
  isSilentSyncing = false,
  sseStatus = "connected",
  onRefresh,
  onExportCsv,
  onOpenGasSetup,
  onOpenProjectInfo,
}: HeaderProps) {
  const isOnline = source === "google_sheets";
  const formattedTime = new Date(updatedAt).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                หมู่บ้านชุมชนล้อมรักษ์
              </h1>
              <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-medium border border-emerald-200">
                จ.ศรีสะเกษ
              </span>
              {onOpenProjectInfo && (
                <button
                  onClick={onOpenProjectInfo}
                  className="flex items-center gap-1 text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg border border-emerald-200 transition font-medium"
                  title="ดูรายละเอียดโครงการ CBTx และชุมชนล้อมรักษ์"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>เกี่ยวกับโครงการ</span>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500">
              ระบบสารสนเทศติดตามและประเมินผลโครงการบำบัดฟื้นฟูโดยชุมชนเป็นศูนย์กลาง (CBTx)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Real-Time SSE Indicator */}
          <div
            title="ระบบ Real-Time Event-Driven: ดึงข้อมูลสดเฉพาะเมื่อ Google Sheet มีการแก้ไข หรือสลับแท็บกลับมา"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 border border-slate-200 text-slate-600"
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isSilentSyncing
                    ? "bg-amber-400"
                    : sseStatus === "connected"
                    ? "bg-emerald-400"
                    : "bg-slate-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isSilentSyncing
                    ? "bg-amber-500"
                    : sseStatus === "connected"
                    ? "bg-emerald-600"
                    : "bg-slate-400"
                }`}
              />
            </span>
            <span className="text-[11px] text-slate-500">
              {isSilentSyncing
                ? "กำลังซิงค์สด..."
                : sseStatus === "connected"
                ? "Real-Time (รอชีตเปลี่ยน)"
                : "สลับแท็บเพื่อซิงค์"}
            </span>
          </div>

          {/* Connection status badge */}
          <button
            onClick={onOpenGasSetup}
            title="คลิกเพื่อดูการตั้งค่า Google Apps Script"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              isOnline
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
            }`}
          >
            {isOnline ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>{isOnline ? "Google Sheets สด" : "ข้อมูลจำลอง (Demo)"}</span>
            <span className="text-slate-400 text-[11px]">• {formattedTime}</span>
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing || isSilentSyncing}
            title="ดึงข้อมูลสดทันที"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition disabled:opacity-50 border border-slate-200 shadow-xs"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isRefreshing || isSilentSyncing ? "animate-spin text-emerald-600" : ""
              }`}
            />
            <span>ซิงค์ข้อมูล</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition shadow-sm shadow-emerald-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก CSV</span>
          </button>

          {/* GAS Setup button */}
          <button
            onClick={onOpenGasSetup}
            className="p-1.5 bg-white hover:bg-slate-50 text-slate-600 rounded-lg transition border border-slate-200 shadow-xs"
            title="ตั้งค่า Google Apps Script"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
