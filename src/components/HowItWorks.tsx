import React from 'react';
import { 
  ClipboardCheck, 
  Flame, 
  Store, 
  GitCompare, 
  BadgePercent, 
  Check, 
  ArrowLeft,
  ChevronLeft
} from 'lucide-react';
import { SPECIALIST_IMAGE_PATH, SWATCHES_IMAGE_PATH } from '../data/mockData';

interface HowItWorksProps {
  onStartBooking: () => void;
  themeSettings?: import('../types').SiteThemeSettings;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onStartBooking, themeSettings }) => {
  const depositFee = themeSettings?.customerDepositFee || 350000;
  const sectionTitle = themeSettings?.howItWorksTitle || 'چطور بازار پرده را بدون دردسر به خانه می‌آوریم؟';
  const sectionSubtitle = themeSettings?.howItWorksSubtitle || 'از ثبت درخواست تا نصب نهایی، تمام مراحل با شفافیت مالی، بیعانه کسرشونده و امکان مقایسه بین فروشگاه‌ها طراحی شده است.';

  const steps = [
    {
      number: '۰۱',
      title: 'ثبت درخواست و پرداخت بیعانه',
      desc: `آدرس، ابعاد تقریبی و سبک‌های مدنظرتان را ثبت می‌کنید. مبلغ ${depositFee.toLocaleString('fa-IR')} تومان به عنوان بیعانه رزرو پرداخت می‌شود که عینا از فاکتور نهایی دوخت و پرده کسر می‌گردد.`,
      badge: 'کسر ۱۰۰٪ از فاکتور',
    },
    {
      number: '۰۲',
      title: 'شکار سفارش در تابلوی فروشگاه‌ها',
      desc: 'سفارش در تابلوی اختصاصی به رقابت گذاشته می‌شود. نزدیک‌ترین فروشگاه مجاز با بالاترین امتیاز که سریع‌تر دکمه شکار را بزند، مسئول اعزام کارشناس خواهد شد.',
      badge: 'فروشگاه‌های معتبر با پروانه',
    },
    {
      number: '۰۳',
      title: 'حضور در خانه با آلبوم‌های کالیته',
      desc: 'کارشناس با کالیته‌های واقعی پارچه (مخمل، حریر، کتان، زبرا) به منزل می‌آید. پارچه‌ها در نور خانه با مبلمان ست شده و متراژ دقیق با لیزر اندازه‌گیری می‌شود.',
      badge: 'پرو پارچه در نور خانه',
    },
    {
      number: '۰۴',
      title: 'توافق و دوخت یا اعزام فروشگاه دوم!',
      desc: 'فاکتور دیجیتال صادر می‌شود. اگر به توافق رسیدید کار شروع می‌شود. اگر از قیمت یا تنوع کالیته راضی نبودید، سفارش به فروشگاه دیگری ارجاع داده می‌شود تا مقایسه کنید.',
      badge: 'حق مقایسه تضمین‌شده',
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-semibold text-amber-800 tracking-wider">
            روند کار {themeSettings?.siteName || 'دراپینو'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {sectionTitle}
          </h2>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            {sectionSubtitle}
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div 
              key={idx}
              className="relative p-6 rounded-2xl bg-stone-50 border border-stone-200 hover:border-amber-300 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-amber-800 tabular-nums">
                    {step.number}
                  </span>
                  <span className="text-[11px] font-medium text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-md">
                    {step.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-stone-900 mb-2 leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -left-3 top-1/2 -translate-y-1/2 z-10">
                  <ChevronLeft className="w-6 h-6 text-stone-300" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Comparison Feature Spotlight */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-2 text-right">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
              <GitCompare className="w-4 h-4" />
              <span>قانون طلایی دراپینو: حق انتخاب و مقایسه مشتری</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">
              اگر از کالیته یا قیمت فروشگاه اول راضی نبودید چه می‌شود؟
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              هیچ اجباری در خرید نیست! شما با یک کلیک در پنل، درخواست «اعزام فروشگاه دوم جهت مقایسه» را ثبت می‌کنید.
              سفارش مجدداً برای سایر فروشگاه‌های تخصصی به نمایش درمی‌آید و کارشناس بعدی با کالیته‌های متفاوت به منزلتان مراجعه خواهد کرد، بدون نیاز به پرداخت بیعانه مجدد.
            </p>
          </div>
          <div className="lg:col-span-4 flex justify-end">
            <button
              onClick={onStartBooking}
              className="w-full sm:w-auto px-6 py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-xl transition-colors shadow-md text-center"
            >
              ثبت درخواست مشاوره خانگی
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
