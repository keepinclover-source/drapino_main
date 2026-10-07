import { DEFAULT_HEADER_TOP_NOTICE, DEFAULT_HEADER_PHONE } from '../utils/themeDefaults';
import type { VisitRequest, CurtainVendor, BlogPost, MasterFabricCatalog, CustomPage, VendorCustomCatalogSubmission, UserProfile, VendorReview, SupportTicket, BuyBoxReservation, DiscountCoupon, WholesaleFabricItem, WholesaleOrder, CurtainStyleGuide, SiteThemeSettings, BuyBoxSettings, OperationalCity } from '../types';

// Start with empty records; persisted application data is loaded by App.tsx.
export const INITIAL_REQUESTS: VisitRequest[] = [];
export const INITIAL_VENDORS: CurtainVendor[] = [];
export const INITIAL_BLOG_POSTS: BlogPost[] = [];
export const INITIAL_MASTER_CATALOGS: MasterFabricCatalog[] = [];
export const INITIAL_CUSTOM_PAGES: CustomPage[] = [];
export const INITIAL_VENDOR_CATALOG_SUBMISSIONS: VendorCustomCatalogSubmission[] = [];
export const INITIAL_USERS: UserProfile[] = [];
export const INITIAL_REVIEWS: VendorReview[] = [];
export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [];
export const INITIAL_BUY_BOX_RESERVATIONS: BuyBoxReservation[] = [];
export const INITIAL_DISCOUNT_COUPONS: DiscountCoupon[] = [];
export const INITIAL_WHOLESALE_FABRICS: WholesaleFabricItem[] = [];
export const INITIAL_WHOLESALE_ORDERS: WholesaleOrder[] = [];
export const CURTAIN_STYLES: CurtainStyleGuide[] = [];

export const HERO_IMAGE_PATH = '/images/hero_curtain_luxury_living_1790237028961.jpg';
export const SWATCHES_IMAGE_PATH = '/images/fabric_swatches_velvet_1790237044606.jpg';
export const SPECIALIST_IMAGE_PATH = '/images/curtain_specialist_visit_1790237059005.jpg';
export const BLOG_IMAGE_PATH = '/images/blog_curtain_styling_1790237071088.jpg';

export const INITIAL_SITE_THEME: SiteThemeSettings = {
  siteName: 'دراپینو',
  tagline: 'بازار پرده در خانه شما',
  headerTopNotice: DEFAULT_HEADER_TOP_NOTICE,
  headerPhone: DEFAULT_HEADER_PHONE,
  heroTitle: 'به جای رفتن به بازار پرده، فروشگاه و کالیته‌ها را به خانه شما می‌آوریم',
  heroSubtitle: 'درخواست خود را ثبت کنید؛ فروشگاه‌های پرده شهر برای اعزام به منزل شما رقابت می‌کنند.',
  heroImageUrl: HERO_IMAGE_PATH,
  primaryColor: 'amber',
  borderRadius: 'rounded-2xl',
  fontFamily: 'Vazirmatn',
  supportPhone: '',
  supportEmail: '',
};

export const INITIAL_BUY_BOX_SETTINGS: BuyBoxSettings = {
  isEnabled: false,
  dailyPrice: 1200000,
  maxDailyPercentage: 50,
  acceptanceTimeoutMinutes: 15,
  maxMonthlyDaysPerVendor: 4,
  eligibleTiers: ['طلایی', 'نقره‌ای'],
  minRating: 4.2,
  minCompletedOrders: 0,
  autoAssignEnabled: false,
};

// Match the cities seeded by the local server.
export const INITIAL_OPERATIONAL_CITIES: OperationalCity[] = [
      {
        id: 'city-tehran',
        name: 'تهران',
        province: 'تهران',
        isActive: true,
        isPartnerRegistrationActive: true,
        phase: 1,
        isHub: true,
        satelliteCities: ['پرند', 'پردیس', 'اسلامشهر', 'شهریار', 'ورامین', 'دماوند', 'دماوند و رودهن', 'رودهن', 'بومهن', 'رباط‌کریم', 'پاکدشت', 'قرچک', 'ملارد', 'شهر قدس'],
        otherCoveredCities: ['پرند', 'پردیس', 'اسلامشهر', 'شهریار', 'ورامین', 'دماوند', 'دماوند و رودهن', 'رودهن', 'بومهن', 'رباط‌کریم', 'پاکدشت', 'قرچک', 'ملارد', 'شهر قدس'],
        districts: ['منطقه ۱', 'منطقه ۲', 'منطقه ۳', 'منطقه ۴', 'منطقه ۵', 'منطقه ۲۲']
      },
      {
        id: 'city-mashhad',
        name: 'مشهد',
        province: 'خراسان رضوی',
        isActive: true,
        isPartnerRegistrationActive: true,
        phase: 1,
        isHub: true,
        satelliteCities: ['گلبهار', 'چناران', 'کلات', 'روستای لکلک', 'نیشابور', 'طرقبه', 'شاندیز'],
        otherCoveredCities: ['گلبهار', 'چناران', 'کلات', 'روستای لکلک', 'نیشابور', 'طرقبه', 'شاندیز'],
        districts: ['احمدآباد', 'سجاد', 'وکیل‌آباد', 'هاشمیه', 'هفت‌تیر']
      },
      {
        id: 'city-karaj',
        name: 'کرج',
        province: 'البرز',
        isActive: true,
        isPartnerRegistrationActive: true,
        phase: 1,
        isHub: true,
        satelliteCities: ['فردیس', 'کمالشهر', 'محمدشهر', 'ماهدشت', 'هشتگرد', 'نظرآباد', 'مهرشهر'],
        otherCoveredCities: ['فردیس', 'کمالشهر', 'محمدشهر', 'ماهدشت', 'هشتگرد', 'نظرآباد', 'مهرشهر'],
        districts: ['عظیمیه', 'گوهردشت', 'مهرشهر', 'جهانشهر', 'فردیس']
      },
      {
        id: 'city-isfahan',
        name: 'اصفهان',
        province: 'اصفهان',
        isActive: false,
        isPartnerRegistrationActive: true,
        phase: 2,
        isHub: true,
        satelliteCities: ['شاهین‌شهر', 'بهارستان', 'خمینی‌شهر', 'نجف‌آباد', 'فلاورجان', 'سپاهان‌شهر'],
        otherCoveredCities: ['شاهین‌شهر', 'بهارستان', 'خمینی‌شهر', 'نجف‌آباد', 'فلاورجان', 'سپاهان‌شهر'],
        districts: ['چهارباغ بالا', 'مرداویج', 'شیخ صدوق']
      }
    ];
