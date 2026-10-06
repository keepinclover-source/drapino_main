import React, { useState } from 'react';
import { CurtainStyleGuide } from '../types';
import { CURTAIN_STYLES } from '../data/mockData';
import { Layers, Sparkles, Check, ArrowLeft } from 'lucide-react';

interface FabricCatalogSectionProps {
  onSelectStyleForHomeVisit: (styleName: string) => void;
  themeSettings?: import('../types').SiteThemeSettings;
}

export const FabricCatalogSection: React.FC<FabricCatalogSectionProps> = ({
  onSelectStyleForHomeVisit,
  themeSettings,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredStyles = selectedFilter === 'all'
    ? CURTAIN_STYLES
    : CURTAIN_STYLES.filter((s) => s.id.includes(selectedFilter));

  const sectionTitle = themeSettings?.catalogSectionTitle || 'مشاهده سبک‌ها و درخواست ارسال آلبوم کالیته به خانه';
  const sectionSubtitle = themeSettings?.catalogSectionSubtitle || 'هر کدام از سبک‌های زیر را که می‌پسندید انتخاب کنید تا نزدیک‌ترین فروشگاه، آلبوم‌های همان خانواده پارچه را برای پرو در نور اختصاصی خانه شما همراه بیاورد.';

  return (
    <section className="py-16 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-right">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 mb-2">
              <Layers className="w-4 h-4 text-amber-700" />
              <span>کالیته‌ها و سبک‌های پرده در {themeSettings?.siteName || 'دراپینو'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {sectionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
              {sectionSubtitle}
            </p>
          </div>

          {/* Filter segment */}
          <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-xl text-xs font-medium shrink-0">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedFilter === 'all' ? 'bg-white text-stone-900 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              همه سبک‌ها
            </button>
            <button
              onClick={() => setSelectedFilter('velvet')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedFilter === 'velvet' ? 'bg-white text-stone-900 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              مخمل و کلاسیک
            </button>
            <button
              onClick={() => setSelectedFilter('sheer')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedFilter === 'sheer' ? 'bg-white text-stone-900 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              حریر و مینیمال
            </button>
            <button
              onClick={() => setSelectedFilter('zebra')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedFilter === 'zebra' ? 'bg-white text-stone-900 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              زبرا و مدرن
            </button>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-right">
          {filteredStyles.map((style) => (
            <div
              key={style.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                  <img
                    src={style.imageUrl}
                    alt={style.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-900/80 text-white backdrop-blur-xs">
                      {style.persianCategory}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-base text-stone-900 leading-snug">
                    {style.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {style.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-stone-100 text-xs">
                    <span className="font-bold text-stone-800 text-[11px] block">ویژگی‌های برجسته:</span>
                    {style.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-stone-600 text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs">
                    <span className="text-stone-500 text-[10px] block">حدود قیمت پارچه:</span>
                    <span className="font-bold text-amber-900 text-[11px] tabular-nums">
                      {style.priceRange}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-4 pt-0">
                <button
                  type="button"
                  onClick={() => onSelectStyleForHomeVisit(style.title)}
                  className="w-full py-2.5 px-3 bg-stone-100 hover:bg-amber-700 text-stone-800 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <span>درخواست پرو این کالیته در منزل</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
