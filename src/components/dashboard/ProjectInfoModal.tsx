"use client";

import { X, HeartHandshake, ShieldCheck, Users, PhoneCall, Sparkles } from "lucide-react";

interface ProjectInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectInfoModal({ isOpen, onClose }: ProjectInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-emerald-950/60 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                โครงการหมู่บ้านชุมชนล้อมรักษ์ จ.ศรีสะเกษ
              </h3>
              <p className="text-xs text-emerald-400 font-medium">
                CBTx (Community Based Treatment and Rehabilitation)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Section 1: What is Lomrak */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              ชุมชนล้อมรักษ์ คืออะไร?
            </h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              <strong>"หมู่บ้านชุมชนล้อมรักษ์"</strong> เป็นแนวทางการบำบัดฟื้นฟูผู้ใช้ยาเสพติดโดยใช้ชุมชนเป็นศูนย์กลาง (CBTx) 
              ในจังหวัดศรีสะเกษ โดยเปลี่ยนแนวคิดจากการลงโทษเป็นการบำบัดรักษา 
              ให้ครอบครัว ชุมชน ผู้นำท้องที่ และบุคลากรสาธารณสุข ร่วมกัน "โอบล้อมด้วยความรัก ความเข้าใจ และโอกาส" 
              เพื่อคืนคนดีสู่สังคมอย่างยั่งยืน
            </p>
          </div>

          {/* Section 2: 4 Core Pillars */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2 text-sm">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              4 เสาหลักการดำเนินงานใน 22 อำเภอ
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
                <span className="text-emerald-400 font-bold text-xs block mb-1">1. ค้นหาและคัดกรอง</span>
                <p className="text-slate-400 text-xs">
                  ผู้นำชุมชน อสม. และฝ่ายปกครอง ร่วมค้นหาผู้ใช้ยาเสพติดด้วยความสมัครใจ
                </p>
              </div>
              <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
                <span className="text-teal-400 font-bold text-xs block mb-1">2. บำบัดฟื้นฟูโดยชุมชน</span>
                <p className="text-slate-400 text-xs">
                  การให้คำปรึกษา บำบัดรักษาทางกายและใจร่วมกับ รพ.สต. และโรงพยาบาลชุมชน
                </p>
              </div>
              <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
                <span className="text-sky-400 font-bold text-xs block mb-1">3. ฟื้นฟูสภาพทางสังคม</span>
                <p className="text-slate-400 text-xs">
                  ฝึกทักษะอาชีพ สร้างรายได้ และสร้างการยอมรับจากครอบครัวและเพื่อนบ้าน
                </p>
              </div>
              <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
                <span className="text-indigo-400 font-bold text-xs block mb-1">4. ติดตามดูแลต่อเนื่อง</span>
                <p className="text-slate-400 text-xs">
                  มีพี่เลี้ยงดูแลใกล้ชิดอย่างน้อย 1 ปี ป้องกันการกลับไปเสพซ้ำ
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Hotlines & Support */}
          <div className="bg-emerald-950/30 border border-emerald-800/40 p-4 rounded-2xl flex items-start gap-3">
            <PhoneCall className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-emerald-300">ปรึกษาปัญหาหรือขอรับการบำบัดรักษาฟื้นฟู:</p>
              <p className="text-slate-300">
                ติดต่อได้ที่ โรงพยาบาลส่งเสริมสุขภาพตำบล (รพ.สต.), โรงพยาบาลชุมชนทุกแห่งใน จ.ศรีสะเกษ 
                หรือสายด่วนบำบัดยาเสพติด <strong className="text-white">1165</strong> (โทรฟรี 24 ชั่วโมง)
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
