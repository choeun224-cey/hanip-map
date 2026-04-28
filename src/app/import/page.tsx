"use client";

import { useState } from "react";
import Link from "next/link";
import { loadKakaoMap } from "@/lib/kakao";
import { supabase } from "@/lib/supabase";
import { useDialog } from "@/lib/dialog";

type Area = "서울" | "경기" | "지방";
type SheetKey = Area | "완료";

interface ParsedRow {
  sourceSheet: SheetKey;
  region: string;
  name: string;
  memo: string;
}

interface PreviewRow extends ParsedRow {
  matched: {
    name: string;
    address: string;
    category: string;
    lat: number;
    lng: number;
    area: Area;
  } | null;
  status: "matched" | "no_result";
  selected: boolean;
}

const SHEETS: { key: SheetKey; label: string; placeholder: string }[] = [
  { key: "서울", label: "서울", placeholder: "지역\t식당명\t비고\n강남\t각씨보쌈\t회식하기 좋음" },
  { key: "경기", label: "경기", placeholder: "지역\t식당명\t비고" },
  { key: "지방", label: "지방", placeholder: "지역\t식당명\t비고" },
  { key: "완료", label: "완료 (가본 곳)", placeholder: "지역\t식당명\t비고" },
];

function detectArea(address: string): Area {
  if (address.startsWith("서울")) return "서울";
  if (address.startsWith("경기")) return "경기";
  return "지방";
}

function parseCSV(text: string): Omit<ParsedRow, "sourceSheet">[] {
  if (!text.trim()) return [];
  const lines = text.trim().split(/\r?\n/);
  const sep = lines[0].includes("\t") ? "\t" : ",";
  const startIdx = /지역|식당명|비고/.test(lines[0]) ? 1 : 0;

  return lines
    .slice(startIdx)
    .map((line) => {
      const cells = line.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
      return {
        region: cells[0] || "",
        name: cells[1] || "",
        memo: cells[2] || "",
      };
    })
    .filter((r) => r.name);
}

function searchPlace(
  keyword: string
): Promise<kakao.maps.services.PlaceResult | null> {
  return new Promise((resolve) => {
    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(keyword, (results, status) => {
      if (status === kakao.maps.services.Status.OK && results.length > 0) {
        resolve(results[0]);
      } else {
        resolve(null);
      }
    });
  });
}

export default function ImportPage() {
  const [csvBySheet, setCsvBySheet] = useState<Record<SheetKey, string>>({
    서울: "",
    경기: "",
    지방: "",
    완료: "",
  });
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [converting, setConverting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [savedResult, setSavedResult] = useState<{ ok: number; fail: number } | null>(null);
  const { toast } = useDialog();

  const handleConvert = async () => {
    setConverting(true);
    setSavedResult(null);
    setPreview([]);

    await loadKakaoMap();

    const allRows: ParsedRow[] = [];
    (Object.keys(csvBySheet) as SheetKey[]).forEach((sheet) => {
      parseCSV(csvBySheet[sheet]).forEach((r) =>
        allRows.push({ sourceSheet: sheet, ...r })
      );
    });

    if (allRows.length === 0) {
      setConverting(false);
      toast("붙여넣은 데이터가 없습니다.", "error");
      return;
    }

    setProgress({ current: 0, total: allRows.length });

    const results: PreviewRow[] = [];
    for (let i = 0; i < allRows.length; i++) {
      const row = allRows[i];
      const keyword = `${row.region} ${row.name}`.trim();
      const place = await searchPlace(keyword);

      if (place) {
        const address = place.road_address_name || place.address_name;
        const area: Area =
          row.sourceSheet === "완료"
            ? detectArea(address)
            : (row.sourceSheet as Area);

        results.push({
          ...row,
          matched: {
            name: place.place_name,
            address,
            category: place.category_name?.split(">").pop()?.trim() || "기타",
            lat: parseFloat(place.y),
            lng: parseFloat(place.x),
            area,
          },
          status: "matched",
          selected: true,
        });
      } else {
        results.push({
          ...row,
          matched: null,
          status: "no_result",
          selected: false,
        });
      }

      setProgress({ current: i + 1, total: allRows.length });
      await new Promise((r) => setTimeout(r, 80));
    }

    setPreview(results);
    setConverting(false);
  };

  const handleSave = async () => {
    const selected = preview.filter((r) => r.selected && r.matched);
    if (selected.length === 0) {
      toast("저장할 항목이 없습니다.", "error");
      return;
    }

    setSaving(true);

    const toInsert = selected.map((r) => ({
      name: r.matched!.name,
      address: r.matched!.address,
      region: r.region,
      area: r.matched!.area,
      category: r.matched!.category,
      memo: r.memo,
      visited: r.sourceSheet === "완료",
      lat: r.matched!.lat,
      lng: r.matched!.lng,
      tags: [],
    }));

    const { error } = await supabase.from("restaurants").insert(toInsert);
    setSaving(false);

    if (error) {
      setSavedResult({ ok: 0, fail: toInsert.length });
      toast(`저장 실패: ${error.message}`, "error");
    } else {
      setSavedResult({ ok: toInsert.length, fail: 0 });
      setPreview([]);
      setCsvBySheet({ 서울: "", 경기: "", 지방: "", 완료: "" });
      toast(`${toInsert.length}곳 저장 완료`, "success");
    }
  };

  const toggleRow = (idx: number) => {
    setPreview((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, selected: !r.selected } : r))
    );
  };

  const updateMatched = (idx: number, field: "address" | "category", value: string) => {
    setPreview((prev) =>
      prev.map((r, i) =>
        i === idx && r.matched
          ? { ...r, matched: { ...r.matched, [field]: value } }
          : r
      )
    );
  };

  const matchedCount = preview.filter((r) => r.status === "matched").length;
  const failedCount = preview.length - matchedCount;
  const selectedCount = preview.filter((r) => r.selected).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">📋 시트 데이터 일괄 가져오기</h1>
            <p className="text-sm text-gray-500 mt-1">
              구글 시트에서 복사한 데이터를 시트별로 붙여넣고 변환하세요.
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            ← 지도로 돌아가기
          </Link>
        </div>

        {/* CSV input */}
        {preview.length === 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SHEETS.map((sheet) => (
                <div key={sheet.key} className="bg-white rounded-2xl p-4 shadow-sm">
                  <label className="block text-sm font-semibold mb-2">
                    {sheet.label}
                    <span className="ml-2 text-xs text-gray-400">
                      {parseCSV(csvBySheet[sheet.key]).length}행
                    </span>
                  </label>
                  <textarea
                    value={csvBySheet[sheet.key]}
                    onChange={(e) =>
                      setCsvBySheet({ ...csvBySheet, [sheet.key]: e.target.value })
                    }
                    placeholder={sheet.placeholder}
                    rows={8}
                    className="w-full p-3 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>

            <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-xl mt-4">
              💡 <b>사용법</b>: 구글 시트에서 헤더 포함 셀 범위를 복사(Ctrl+C)해서 위 영역에 붙여넣기(Ctrl+V) 하세요. 탭으로 자동 분리됩니다.
              <br />⚠️ <b>완료 시트</b>는 카카오 검색 결과 주소 기준으로 권역(서울/경기/지방)을 자동 판별합니다.
            </div>

            <button
              onClick={handleConvert}
              disabled={converting}
              className="w-full mt-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {converting
                ? `변환 중... (${progress.current}/${progress.total})`
                : "변환 시작"}
            </button>

            {savedResult && (
              <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-xl">
                ✅ {savedResult.ok}곳 저장 완료
                {savedResult.fail > 0 && ` / ${savedResult.fail}곳 실패`}
              </div>
            )}
          </>
        )}

        {/* Preview table */}
        {preview.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm">
                <span className="text-green-600 font-semibold">매칭 {matchedCount}</span>
                {failedCount > 0 && (
                  <span className="ml-3 text-red-500 font-semibold">실패 {failedCount}</span>
                )}
                <span className="ml-3 text-gray-500">/ 선택 {selectedCount}곳 저장 예정</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreview([])}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  처음으로
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || selectedCount === 0}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
                >
                  {saving ? "저장 중..." : `${selectedCount}곳 저장`}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500">
                  <tr>
                    <th className="p-2 text-left w-10">선택</th>
                    <th className="p-2 text-left">원본</th>
                    <th className="p-2 text-left">매칭된 식당</th>
                    <th className="p-2 text-left">주소</th>
                    <th className="p-2 text-left w-20">권역</th>
                    <th className="p-2 text-left w-24">카테고리</th>
                    <th className="p-2 text-left w-20">방문</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`border-t border-gray-100 ${
                        row.status === "no_result" ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={() => toggleRow(idx)}
                          disabled={!row.matched}
                        />
                      </td>
                      <td className="p-2">
                        <div className="font-medium">{row.name}</div>
                        <div className="text-xs text-gray-500">
                          {row.region} · {row.sourceSheet}
                        </div>
                      </td>
                      <td className="p-2">
                        {row.matched ? (
                          <span className="font-medium text-green-700">
                            {row.matched.name}
                          </span>
                        ) : (
                          <span className="text-red-500 text-xs">검색 결과 없음</span>
                        )}
                      </td>
                      <td className="p-2">
                        {row.matched && (
                          <input
                            value={row.matched.address}
                            onChange={(e) =>
                              updateMatched(idx, "address", e.target.value)
                            }
                            className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                          />
                        )}
                      </td>
                      <td className="p-2">
                        {row.matched?.area && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                            {row.matched.area}
                          </span>
                        )}
                      </td>
                      <td className="p-2">
                        {row.matched && (
                          <input
                            value={row.matched.category}
                            onChange={(e) =>
                              updateMatched(idx, "category", e.target.value)
                            }
                            className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                          />
                        )}
                      </td>
                      <td className="p-2 text-xs">
                        {row.sourceSheet === "완료" ? "✅ 가봤음" : "🔖 가고싶음"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
