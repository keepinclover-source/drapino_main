import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Star, 
  CheckCircle2, 
  Store, 
  Calendar, 
  Image as ImageIcon,
  ChevronDown,
  UserCheck,
  Award
} from 'lucide-react';
import { CurtainVendor, UserProfile } from '../types';

interface CityTopVendorsSectionProps {
  selectedCity: string;
  vendors: CurtainVendor[];
  onOpenBookingModal: (vendorId?: string) => void;
  onOpenVendorProfile: (vendor: CurtainVendor) => void;
  onOpenVendorPortfolio: (vendor: CurtainVendor) => void;
  currentUser?: UserProfile | null;
}

export const CityTopVendorsSection: React.FC<CityTopVendorsSectionProps> = ({
  selectedCity,
  vendors,
  onOpenBookingModal,
  onOpenVendorProfile,
  onOpenVendorPortfolio,
}) => {
  // Visible count starts at 10
  const [visibleCount, setVisibleCount] = useState(10);

  // Detect if selectedCity is satellite of Tehran or Mashhad
  const tehranSatellites = ['پرند', 'پردیس', 'اسلامشهر', 'شهریار', 'ورامین', 'دماوند', 'دماوند و رودهن', 'رودهن', 'بومهن', 'رباط‌کریم', 'پاکدشت', 'قرچک', 'ملارد', 'شهر قدس'];
  const mashhadSatellites = ['گلبهار', 'چناران', 'نیشابور', 'کلات', 'روستای لکلک', 'طرقبه', 'شاندیز'];
  
  const isTehranSatellite = tehranSatellites.includes(selectedCity);
  const isMashhadSatellite = mashhadSatellites.includes(selectedCity);
  const hubCity = isTehranSatellite ? 'تهران' : isMashhadSatellite ? 'مشهد' : null;

  // Filter vendors for this city or its parent hub
  let cityVendors = vendors.filter(
    (v) => v.city === selectedCity || v.coveredDistricts?.some((d) => d.includes(selectedCity))
  );

  // If no direct vendors in satellite city, show hub vendors with dispatch capability
  const isCoveredByHub = cityVendors.length === 0 && hubCity !== null;
  if (isCoveredByHub) {
    cityVendors = vendors.filter(
      (v) => v.city === hubCity || v.coveredDistricts?.some((d) => d.includes(hubCity))
    );
  }

  // 1-month ad duration check: ad must not be expired
  // In case of laddering, promotedAt is updated to Date.now() so the newly laddered ad appears first
  const now = Date.now();
  const promotedCityVendors = cityVendors
    .filter((v) => {
      if (!v.isPromotedAd) return false;
      if (v.promotedExpiresAt && v.promotedExpiresAt < now) return false;
      return true;
    })
    .sort((a, b) => (b.promotedAt || 0) - (a.promotedAt || 0));

  const organicCityVendors = cityVendors
    .filter((v) => !v.isPromotedAd || (v.promotedExpiresAt && v.promotedExpiresAt < now))
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));

  // Combined vendors list with promoted/laddered vendors first
  const allCityVendors = [...promotedCityVendors, ...organicCityVendors];
  const displayedVendors = allCityVendors.slice(0, visibleCount);
  const remainingCount = Math.max(0, allCityVendors.length - visibleCount);

  return (
    <section className="py-12 bg-gradient-to-b from-stone-50 via-white to-stone-50 border-y border-stone-200 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>فروشگاه‌های برتر دراپینو</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex flex-wrap items-center gap-2">
            <span>برترین گالری‌های پرده و کالیته در</span>
            <span className="text-amber-800 underline decoration-amber-300 underline-offset-8">{selectedCity}</span>
            {isCoveredByHub && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500 text-stone-950 shadow-2xs">
                🛰️ شهر اقماری تحت پوشش مرکز {hubCity}
              </span>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
            {isCoveredByHub 
              ? `ساکنان محترم ${selectedCity} می‌توانند از میان برترین گالری‌های دارای پروانه کلانشهر ${hubCity} انتخاب نمایند؛ کارشناسان بدون هزینه مازاد کالیته‌ها را جهت پرو به منزل شما در ${selectedCity} می‌آورند.`
              : `منتخب‌ترین فروشگاه‌های دارای پروانه کسب رسمی اتحادیه در شهر ${selectedCity}`}
          </p>
        </div>

        {/* Vendors Grid */}
        {displayedVendors.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-12 text-center space-y-3">
            <Store className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-base font-bold text-stone-800">
              هنوز فروشگاهی در شهر {selectedCity} ثبت نشده است.
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              به زودی برترین گالری‌های پرده دارای پروانه در شهر {selectedCity} به سامانه اضافه خواهند شد.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedVendors.map((vendor) => {
              const isPromoted = vendor.isPromotedAd && (!vendor.promotedExpiresAt || vendor.promotedExpiresAt > now);

              return (
                <div
                  key={vendor.id}
                  className={`bg-white rounded-3xl border p-5 sm:p-6 transition-all duration-200 hover:shadow-lg flex flex-col justify-between gap-4 relative overflow-hidden ${
                    isPromoted
                      ? 'border-amber-300 shadow-2xs hover:border-amber-400'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div>
                    {/* Header Badges: No numbers, clean and elegant */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        {isPromoted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <Sparkles className="w-3 h-3 text-amber-700" />
                            <span>فروشگاه منتخب و تایید شده</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                            <Store className="w-3 h-3 text-stone-500" />
                            <span>گالری برتر {selectedCity}</span>
                          </span>
                        )}

                        {vendor.tier && (
                          <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                            سطح {vendor.tier}
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg text-amber-900 font-bold text-xs border border-amber-200/80">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span className="font-mono text-xs">{vendor.rating || 4.8}</span>
                        <span className="text-[10px] text-stone-400 font-normal">({vendor.ratingCount || 45})</span>
                      </div>
                    </div>

                    {/* Store Title & Verification */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-black text-stone-900 text-base sm:text-lg hover:text-amber-800 transition-colors">
                          {vendor.name}
                        </h3>
                        <span title="دارای پروانه کسب معتبر و تایید اتحادیه">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        </span>
                      </div>
                      <p className="text-xs text-stone-500">
                        مدیریت: {vendor.ownerName}
                      </p>
                    </div>

                    {/* Address only - No covered districts or catalog pills */}
                    <div className="mt-3 p-3 bg-stone-50 rounded-2xl border border-stone-100 text-xs text-stone-600">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <span className="truncate text-stone-800 font-medium">
                          {vendor.address}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar: 3 Buttons */}
                  <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenBookingModal(vendor.id)}
                      className="flex-1 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-amber-300" />
                      <span>اعزام کارشناس این گالری</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenVendorPortfolio(vendor)}
                      className="px-3 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200/90 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                      title="مشاهده نمونه‌کارهای اجرا شده این مغازه"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                      <span>نمونه‌کارها</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenVendorProfile(vendor)}
                      className="px-3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                      title="مشاهده مشخصات و نظرات مشتریان"
                    >
                      پروفایل
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button if more than 10 stores exist */}
        {remainingCount > 0 && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 10)}
              className="px-6 py-3 bg-white hover:bg-amber-50 text-stone-800 hover:text-amber-950 border border-stone-300 hover:border-amber-300 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer group"
            >
              <span>مشاهده فروشگاه‌های بیشتر ({remainingCount} گالری دیگر در {selectedCity})</span>
              <ChevronDown className="w-4 h-4 text-amber-700 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
