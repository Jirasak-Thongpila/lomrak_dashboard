"use client";

import { useState } from "react";
import { X, Copy, Check, Code2 } from "lucide-react";
import { GAS_CODE_TEMPLATE } from "@/lib/gas-script-template";

interface GasSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GasSetupModal({ isOpen, onClose }: GasSetupModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(GAS_CODE_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-800">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/60 rounded-t-2xl">
          <div className="flex items-center gap-2 text-pink-700">
            <Code2 className="w-6 h-6" />
            <h3 className="font-semibold text-lg text-slate-900">
              วิธีเชื่อมต่อ Google Drive ผ่าน Google Apps Script
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          <div className="bg-pink-50/80 border border-pink-200 p-4 rounded-xl text-pink-950">
            <p className="font-medium text-pink-800 mb-1">ขั้นตอนการติดตั้ง (เพียง 1-2 นาที):</p>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
              <li>เปิดโฟลเดอร์ Google Drive หรือเปิดไฟล์ <strong>หมู่บ้านชุมชนล้อมรักษ์</strong> ด้วย Google Sheets</li>
              <li>ไปที่เมนู <strong>ส่วนขยาย (Extensions) &gt; Apps Script</strong></li>
              <li>คัดลอกโค้ดด้านล่างไปวางแทนที่โค้ดในไฟล์ <code className="bg-pink-100 px-1 py-0.5 rounded text-pink-900 font-mono">Code.gs</code> ทั้งหมด แล้วกดบันทึก</li>
              <li>กดปุ่มสีน้ำเงิน <strong>ทำให้ใช้งานได้ (Deploy) &gt; การทำให้ใช้งานได้ใหม่ (New deployment)</strong></li>
              <li>เลือกประเภท <strong>เว็บแอป (Web app)</strong> และตั้งค่า "ผู้มีสิทธิ์เข้าถึง" เป็น <strong>ทุกคน (Anyone)</strong></li>
              <li>กด Deploy แล้วนำ URL ที่ได้มาใส่ในไฟล์ <code className="bg-pink-100 px-1 py-0.5 rounded text-pink-900 font-mono">.env.local</code> (ตัวแปร <code className="text-pink-700 font-semibold">GAS_API_URL=...</code>)</li>
            </ol>
            <div className="mt-3 pt-3 border-t border-pink-200 text-xs text-rose-800">
              <p className="font-semibold text-pink-800">🚀 วิธีเปิดระบบ Real-Time Push เมื่อชีตเปลี่ยน (Zero Polling):</p>
              <p className="mt-1 text-slate-700">
                1. ใส่ URL แดชบอร์ดของคุณที่ตัวแปร <code className="bg-pink-100 px-1 py-0.5 rounded text-pink-900 font-mono">DASHBOARD_WEBHOOK_URL = ".../api/lomrak/webhook"</code> ในโค้ด
              </p>
              <p className="mt-0.5 text-slate-700">
                2. ที่แถบซ้ายของ Apps Script ไปที่ <strong>ทริกเกอร์ (รูปนาฬิกา ⏰) &gt; เพิ่มทริกเกอร์</strong> เลือกฟังก์ชัน <code className="text-pink-700 font-semibold">onSheetEdit</code> แหล่งเหตุการณ์: <em>จากสเปรดชีต</em> ประเภท: <em>เมื่อแก้ไข</em> แล้วกดบันทึก
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-700">สคริปต์ Google Apps Script (`Code.gs`):</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-medium transition shadow-xs"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "คัดลอกแล้ว!" : "คัดลอกโค้ด"}
              </button>
            </div>
            <pre className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs font-mono text-pink-300/90 overflow-x-auto max-h-60">
              {GAS_CODE_TEMPLATE}
            </pre>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition"
          >
            เข้าใจแล้ว ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
