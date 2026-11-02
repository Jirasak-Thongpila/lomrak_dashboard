import { NextResponse } from "next/server";
import fallbackRecords from "@/data/fallback-lomrak.json";
import type { LomrakApiResponse, LomrakRecord } from "@/types/lomrak";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get("refresh") === "true";
  const gasUrl = process.env.GAS_API_URL || process.env.NEXT_PUBLIC_GAS_API_URL;

  if (gasUrl) {
    try {
      const fetchOptions: RequestInit = forceRefresh
        ? { cache: "no-store" }
        : { next: { revalidate: 300 } };

      const res = await fetch(gasUrl, fetchOptions);

      if (res.ok) {
        const json = await res.json();
        const rawData = Array.isArray(json) ? json : json.data;
        if (Array.isArray(rawData) && rawData.length > 0) {
          const validatedData: LomrakRecord[] = rawData
            .map((item: any) => ({
              year: Number(item.year || item["ปี"] || 2567),
              district: String(item.district || item["อำเภอ"] || "").trim(),
              communityCount: Number(
                item.communityCount || item["หมู่บ้าน/ชุมชน"] || item["ชุมชน"] || 0
              ),
              patientCount: Number(
                item.patientCount || item["ผู้ป่วยเข้ารับบำบัด"] || item["ผู้ป่วย"] || 0
              ),
            }))
            .filter((item: LomrakRecord) => item.district.length > 0);

          if (validatedData.length > 0) {
            const successResponse: LomrakApiResponse = {
              status: "success",
              source: "google_sheets",
              updatedAt: new Date().toISOString(),
              totalRecords: validatedData.length,
              data: validatedData,
            };
            return NextResponse.json(successResponse);
          }
        }
      }
    } catch (err: any) {
      console.warn("GAS Web App fetch failed, reverting to fallback data:", err?.message);
    }
  }

  // Graceful fallback to verified local Sisaket dataset
  const fallbackResponse: LomrakApiResponse = {
    status: "success",
    source: "fallback_cache",
    updatedAt: new Date().toISOString(),
    totalRecords: fallbackRecords.length,
    data: fallbackRecords as LomrakRecord[],
  };

  return NextResponse.json(fallbackResponse);
}
