import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { CurrentUser, ScreenName, SafetyManualItem } from '../../types';
import { translations } from '../../lib/i18n';
import { searchSafetyManual } from '../../lib/storage';

interface SafetyManualScreenProps {
  currentUser: CurrentUser;
  onNavigate: (screen: ScreenName) => void;
}

export const SafetyManualScreen: React.FC<SafetyManualScreenProps> = ({
  currentUser,
}) => {
  const lang = currentUser.language || 'th';
  const t = translations[lang];
  const isTh = lang === 'th';

  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('man-1');

  const allItems = searchSafetyManual(keyword);
  const categories = ['ALL', 'PPE', 'Heat Stress', 'Ergonomics', 'Chemical Safety', 'Fire Safety'];

  const filteredItems = allItems.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="space-y-5 pb-24 max-w-xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-3xl p-5 shadow-lg border border-slate-800">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
          <BookOpen className="w-4 h-4" />
          <span>KKU OSHE Knowledge Base</span>
        </div>
        <h2 className="text-xl font-black text-white">{t.manualTitle}</h2>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          {t.manualDesc}
        </p>

        {/* Search Bar */}
        <div className="relative mt-4">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full min-h-[48px] pl-11 pr-4 py-2.5 rounded-2xl bg-slate-800/90 text-white placeholder-slate-400 text-sm border border-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/20"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {cat === 'ALL' ? (isTh ? 'ทั้งหมด' : 'All') : cat}
          </button>
        ))}
      </div>

      {/* Manual Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl text-center border border-slate-200 text-slate-400 text-sm">
            {isTh ? 'ไม่พบหัวข้อคู่มือที่ตรงกับคำค้นหา' : 'No safety manual topics match search.'}
          </div>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                      <Tag className="w-3 h-3" />
                      {item.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {isTh ? item.title : item.titleEn}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {isTh ? item.summaryTh : item.summaryEn}
                    </p>
                  </div>
                  <div className="p-1.5 rounded-xl bg-slate-100 text-slate-600 mt-1 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-100 space-y-3 bg-slate-50/50">
                    <div className="text-xs text-slate-700 leading-relaxed pt-3">
                      {isTh ? item.content : item.contentEn}
                    </div>

                    <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-2">
                      <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>{isTh ? 'ขั้นตอนและแนวปฏิบัติหลัก:' : 'Key Action Checklist:'}</span>
                      </h4>
                      <ul className="space-y-1.5">
                        {(isTh ? item.keySteps : item.keyStepsEn).map((step, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-emerald-900 flex items-start gap-2 font-medium"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
