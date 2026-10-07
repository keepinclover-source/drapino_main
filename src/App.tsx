import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { 
  UserRole, 
  OrderStatus, 
  VisitRequest, 
  CurtainVendor, 
  BlogPost, 
  CurtainInvoice, 
  WalletTransaction,
  MasterFabricCatalog,
  CustomPage,
  SiteThemeSettings,
  OperationalCity,
  VendorCustomCatalogSubmission,
  UserProfile,
  VendorReview,
  SupportTicket,
  TicketAttachment,
  TicketMessage,
  TicketStatus,
  VendorPortfolioItem,
  BuyBoxSettings,
  BuyBoxReservation,
  DiscountCoupon,
  WholesaleFabricItem,
  WholesaleOrder
} from './types';
import { 
  INITIAL_REQUESTS, 
  INITIAL_VENDORS, 
  INITIAL_BLOG_POSTS, 
  INITIAL_MASTER_CATALOGS, 
  INITIAL_CUSTOM_PAGES, 
  INITIAL_SITE_THEME,
  INITIAL_OPERATIONAL_CITIES,
  INITIAL_VENDOR_CATALOG_SUBMISSIONS,
  INITIAL_USERS,
  INITIAL_REVIEWS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_BUY_BOX_SETTINGS,
  INITIAL_BUY_BOX_RESERVATIONS,
  INITIAL_DISCOUNT_COUPONS,
  INITIAL_WHOLESALE_FABRICS,
  INITIAL_WHOLESALE_ORDERS
} from './data/mockData';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { HowItWorks } from './components/HowItWorks';
import { CustomerPortal } from './components/CustomerPortal';
import { VendorPortal } from './components/VendorPortal';
import { AdminPortal } from './components/AdminPortal';
import { FabricCatalogSection } from './components/FabricCatalogSection';
import { BlogSection } from './components/BlogSection';
import { CustomPageView } from './components/CustomPageView';
import { CurtainEstimatorModal } from './components/CurtainEstimatorModal';
import { NewRequestModal } from './components/NewRequestModal';
import { VendorRegisterModal } from './components/VendorRegisterModal';
import { VendorLandingPage } from './components/VendorLandingPage';
import { WholesalerLandingPage } from './components/WholesalerLandingPage';
import { WholesalerPortal } from './components/WholesalerPortal';
import { ProjectDownloadModal } from './components/ProjectDownloadModal';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { NotificationCenter } from './components/NotificationCenter';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { NotificationToast } from './components/NotificationToast';
import { OrderChatModal } from './components/OrderChatModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { VendorProfileModal } from './components/VendorProfileModal';
import { VendorPortfolioModal } from './components/VendorPortfolioModal';
import { CitySelectModal } from './components/CitySelectModal';
import { CityTopVendorsSection } from './components/CityTopVendorsSection';
import { User, Store, ShieldCheck, Building2 } from 'lucide-react';
import { loadStored, saveStored, removeStored, getStoredString, setStoredString, jalaliDateAfterDays } from './utils/storage';
import {
  RestrictionsData,
  RestrictionSettings,
  SuspensionScope,
  VendorSuspension,
  DelayPenalty,
  WalletPenalty,
  WalletPenaltyKind,
  INITIAL_RESTRICTIONS,
  normalizeRestrictions,
  createVendorState,
  canVendorClaim,
  canVendorReceiveBuyBoxOrder,
  getActiveSuspension,
  getBuyBoxEligibility,
  recordVendorClaim,
  buildVendorRestrictionSummary,
  WALLET_PENALTY_LABELS,
  DAY_MS,
} from './utils/restrictions';
import { VendorSuspendedScreen } from './components/VendorRestrictionPanel';
import { FeedbackPage, FeedbackSubmitInput } from './components/FeedbackPage';
import {
  FeedbackItem,
  FeedbackStatus,
  ChangelogEntry,
  ChangelogStore,
  INITIAL_CHANGELOG_STORE,
  mergeChangelog,
  makeFeedbackCode,
  faDateTime,
  faDate,
  collectEnvironment,
} from './utils/feedback';

function DrapinoMain() {
  // Notification Context
  const { unreadCount, addNotification } = useNotifications();

  // Users & Authentication State
  const [users, setUsers] = useState<UserProfile[]>(() => {
    return loadStored('autopardeh_users', INITIAL_USERS);
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() =>
    loadStored<UserProfile | null>('autopardeh_current_user', INITIAL_USERS[0] ?? null)
  );

  // Global State
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return currentUser ? currentUser.role : 'customer';
  });
  const [activeTab, setActiveTab] = useState<string>('home');
  const [footerNavigationCount, setFooterNavigationCount] = useState(0);
  const mobileContentRef = useRef<HTMLDivElement>(null);

  // Reset the scroll after the destination renders, including repeated links.
  useLayoutEffect(() => {
    if (footerNavigationCount === 0) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    mobileContentRef.current?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [footerNavigationCount]);

  const handleFooterNavigation = (tab: string) => {
    setActiveTab(tab);
    setFooterNavigationCount((count) => count + 1);
  };

  // Persistence States
  const [orders, setOrders] = useState<VisitRequest[]>(() => {
    return loadStored('autopardeh_orders', INITIAL_REQUESTS);
  });

  const [vendors, setVendors] = useState<CurtainVendor[]>(() => {
    return loadStored('autopardeh_vendors', INITIAL_VENDORS);
  });

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    return loadStored('autopardeh_blogs', INITIAL_BLOG_POSTS);
  });

  const [masterCatalogs, setMasterCatalogs] = useState<MasterFabricCatalog[]>(() => {
    return loadStored('autopardeh_master_catalogs', INITIAL_MASTER_CATALOGS);
  });

  const [customPages, setCustomPages] = useState<CustomPage[]>(() => {
    return loadStored('autopardeh_custom_pages', INITIAL_CUSTOM_PAGES);
  });

  const [themeSettings, setThemeSettings] = useState<SiteThemeSettings>(() => {
    return loadStored('autopardeh_theme_settings', INITIAL_SITE_THEME);
  });

  const [reviews, setReviews] = useState<VendorReview[]>(() => {
    return loadStored('autopardeh_reviews', INITIAL_REVIEWS);
  });

  const [operationalCities, setOperationalCities] = useState<OperationalCity[]>(() => {
    return loadStored('autopardeh_operational_cities', INITIAL_OPERATIONAL_CITIES);
  });

  const [vendorSubmissions, setVendorSubmissions] = useState<VendorCustomCatalogSubmission[]>(() => {
    return loadStored('autopardeh_vendor_submissions', INITIAL_VENDOR_CATALOG_SUBMISSIONS);
  });

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    return loadStored('autopardeh_tickets', INITIAL_SUPPORT_TICKETS);
  });

  // Restrictions & Penalties (محدودیت‌ها و جریمه‌ها) — ذخیره در دیتابیس
  const [restrictions, setRestrictions] = useState<RestrictionsData>(() =>
    normalizeRestrictions(loadStored<RestrictionsData>('autopardeh_restrictions', INITIAL_RESTRICTIONS))
  );

  useEffect(() => {
    saveStored('autopardeh_restrictions', restrictions);
  }, [restrictions]);

  // هر فروشنده‌ی بدون پرونده‌ی محدودیت: در اولین راه‌اندازی «قدیمی» (آزاد) و پس از آن «جدید» (۳ سفارش اول) محسوب می‌شود
  useEffect(() => {
    setRestrictions((prev) => {
      const grandfather = !prev.initializedAt;
      const states = { ...prev.vendorStates };
      let changed = false;
      for (const v of vendors) {
        if (!states[v.id]) {
          states[v.id] = {
            ...createVendorState(v.id, grandfather ? 'released' : 'probation'),
            firstHuntAt: grandfather ? 0 : undefined,
          };
          changed = true;
        }
      }
      if (!changed && prev.initializedAt) return prev;
      return { ...prev, initializedAt: prev.initializedAt || Date.now(), vendorStates: states };
    });
  }, [vendors]);

  // پیشنهادها، گزارش ایرادها و فهرست رفع خطاها — ذخیره در دیتابیس
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>(() =>
    loadStored<FeedbackItem[]>('autopardeh_feedback', [])
  );
  const [changelog, setChangelog] = useState<ChangelogStore>(() =>
    mergeChangelog(loadStored<ChangelogStore>('autopardeh_changelog', INITIAL_CHANGELOG_STORE))
  );

  useEffect(() => {
    saveStored('autopardeh_feedback', feedbackItems);
  }, [feedbackItems]);

  useEffect(() => {
    saveStored('autopardeh_changelog', changelog);
  }, [changelog]);

  // Buy Box States (Persistence via localStorage)
  const [buyBoxSettings, setBuyBoxSettings] = useState<BuyBoxSettings>(() => {
    return loadStored('autopardeh_buy_box_settings', INITIAL_BUY_BOX_SETTINGS);
  });

  const [buyBoxReservations, setBuyBoxReservations] = useState<BuyBoxReservation[]>(() => {
    return loadStored('autopardeh_buy_box_reservations', INITIAL_BUY_BOX_RESERVATIONS);
  });

  // Discount Coupons State (Persistence via localStorage)
  const [discountCoupons, setDiscountCoupons] = useState<DiscountCoupon[]>(() => {
    return loadStored('autopardeh_discount_coupons', INITIAL_DISCOUNT_COUPONS);
  });

  // Wholesale Fabrics State (Persistence via localStorage)
  const [wholesaleFabrics, setWholesaleFabrics] = useState<WholesaleFabricItem[]>(() => {
    return loadStored('autopardeh_wholesale_fabrics', INITIAL_WHOLESALE_FABRICS);
  });

  // Wholesale Orders State (Persistence via localStorage)
  const [wholesaleOrders, setWholesaleOrders] = useState<WholesaleOrder[]>(() => {
    return loadStored('autopardeh_wholesale_orders', INITIAL_WHOLESALE_ORDERS);
  });

  // Project Source Code Download Modal
  const [isProjectDownloadModalOpen, setIsProjectDownloadModalOpen] = useState(false);

  useEffect(() => {
    saveStored('autopardeh_wholesale_fabrics', wholesaleFabrics);
  }, [wholesaleFabrics]);

  useEffect(() => {
    saveStored('autopardeh_wholesale_orders', wholesaleOrders);
  }, [wholesaleOrders]);

  const [selectedCustomPage, setSelectedCustomPage] = useState<CustomPage | null>(null);
  const [selectedVendorForProfileModal, setSelectedVendorForProfileModal] = useState<CurtainVendor | null>(null);
  const [selectedVendorForPortfolioModal, setSelectedVendorForPortfolioModal] = useState<CurtainVendor | null>(null);

  // Active vendor for Vendor Portal
  const [currentVendorId, setCurrentVendorId] = useState<string>('vnd-101');
  const currentVendor = currentUser?.role === 'admin'
    ? vendors.find((v) => v.id === currentVendorId) || vendors[0]
    : vendors.find((v) => v.id === currentUser?.vendorId);

  // Modals & previews
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isEstimatorModalOpen, setIsEstimatorModalOpen] = useState(false);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [estimatorDetails, setEstimatorDetails] = useState<{ width: number; height: number; style: string; fabricTier: string } | undefined>(undefined);

  // Notification Modals
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);
  const [chatOrder, setChatOrder] = useState<VisitRequest | null>(null);

  // Auth & Profile Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authModalRole, setAuthModalRole] = useState<UserRole>('customer');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // City Selection & Top Ads Modal
  const [selectedCity, setSelectedCity] = useState<string>(() => getStoredString('autopardeh_selected_city') || 'تهران');

  const [isCityModalOpen, setIsCityModalOpen] = useState<boolean>(() => {
    // Because users in Iran frequently use VPNs, display popup on initial visit
    const cityChosen = getStoredString('autopardeh_city_chosen');
    return !cityChosen;
  });

  const handleSelectCity = (cityName: string) => {
    setSelectedCity(cityName);
    setStoredString('autopardeh_selected_city', cityName);
    setStoredString('autopardeh_city_chosen', 'true');
    addNotification({
      type: 'special_offer',
      title: `شهر ${cityName} تنظیم شد`,
      message: `برترین فروشگاه‌های پرده و کالیته دارای پروانه کسب در شهر ${cityName} در ویترین اول قرار گرفتند.`,
    });
  };

  // Save to localStorage
  useEffect(() => {
    saveStored('autopardeh_users', users);
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      saveStored('autopardeh_current_user', currentUser);
    } else {
      removeStored('autopardeh_current_user');
    }
  }, [currentUser]);

  // Save to localStorage
  useEffect(() => {
    saveStored('autopardeh_orders', orders);
  }, [orders]);

  useEffect(() => {
    saveStored('autopardeh_vendors', vendors);
  }, [vendors]);

  useEffect(() => {
    saveStored('autopardeh_blogs', blogPosts);
  }, [blogPosts]);

  useEffect(() => {
    saveStored('autopardeh_master_catalogs', masterCatalogs);
  }, [masterCatalogs]);

  useEffect(() => {
    saveStored('autopardeh_custom_pages', customPages);
  }, [customPages]);

  useEffect(() => {
    saveStored('autopardeh_theme_settings', themeSettings);
  }, [themeSettings]);

  useEffect(() => {
    saveStored('autopardeh_reviews', reviews);
  }, [reviews]);

  useEffect(() => {
    saveStored('autopardeh_operational_cities', operationalCities);
  }, [operationalCities]);

  useEffect(() => {
    saveStored('autopardeh_vendor_submissions', vendorSubmissions);
  }, [vendorSubmissions]);

  useEffect(() => {
    saveStored('autopardeh_tickets', tickets);
  }, [tickets]);

  useEffect(() => {
    saveStored('autopardeh_buy_box_settings', buyBoxSettings);
  }, [buyBoxSettings]);

  useEffect(() => {
    saveStored('autopardeh_buy_box_reservations', buyBoxReservations);
  }, [buyBoxReservations]);

  useEffect(() => {
    saveStored('autopardeh_discount_coupons', discountCoupons);
  }, [discountCoupons]);

  // Discount Coupon Handlers
  const handleAddDiscountCoupon = (coupon: DiscountCoupon) => {
    setDiscountCoupons((prev) => [coupon, ...prev]);
    addNotification({
      type: 'special_offer',
      title: 'کد تخفیف جدید ایجاد شد',
      message: `کد تخفیف ${coupon.code} با سقف ${coupon.maxDiscountAmount.toLocaleString('fa-IR')} تومان در سامانه فعال گردید.`,
    });
  };

  const handleUpdateDiscountCoupon = (coupon: DiscountCoupon) => {
    setDiscountCoupons((prev) => prev.map((c) => (c.id === coupon.id ? coupon : c)));
  };

  const handleDeleteDiscountCoupon = (couponId: string) => {
    setDiscountCoupons((prev) => prev.filter((c) => c.id !== couponId));
  };

  const handleToggleDiscountCoupon = (couponId: string) => {
    setDiscountCoupons((prev) =>
      prev.map((c) => (c.id === couponId ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const handleUseDiscountCoupon = (couponCode: string) => {
    setDiscountCoupons((prev) =>
      prev.map((c) => {
        if (c.code.toUpperCase() === couponCode.toUpperCase()) {
          return { ...c, usedCount: c.usedCount + 1 };
        }
        return c;
      })
    );
  };

  // Automatic Loyalty Discount Generation for Successful Purchases
  const handleIssueAutomaticDiscountCoupon = (
    customerName: string,
    customerPhone: string,
    orderId: string,
    purchaseAmount?: number
  ): DiscountCoupon => {
    const cleanPhone = (customerPhone || '').replace(/\D/g, '');
    const phoneSuffix = cleanPhone.slice(-4) || '9900';
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const newCode = `LOYAL-${phoneSuffix}-${randPart}`;

    const isHighValue = (purchaseAmount || 0) >= 15000000;
    const discountVal = isHighValue ? 20 : 15;
    const ceiling = isHighValue ? 750000 : 500000;

    const newCoupon: DiscountCoupon = {
      id: `coup-auto-${Date.now()}`,
      code: newCode,
      title: `بن وفاداری خرید موفق پرده (${customerName})`,
      description: `تخفیف ${discountVal}٪ تا سقف ${ceiling.toLocaleString('fa-IR')} تومان جهت قدردانی از خرید موفق قبلی`,
      discountType: 'percentage',
      discountValue: discountVal,
      maxDiscountAmount: ceiling,
      minOrderAmount: 300000,
      appliesTo: 'both',
      assignedCustomerName: customerName,
      assignedCustomerPhone: customerPhone,
      isAutoGenerated: true,
      triggerOrderId: orderId,
      usedCount: 0,
      usageLimit: 1,
      expiresAt: jalaliDateAfterDays(90),
      isActive: true,
      createdAt: new Date().toLocaleDateString('fa-IR'),
    };

    setDiscountCoupons((prev) => [newCoupon, ...prev]);

    addNotification({
      type: 'special_offer',
      title: '🎁 صدور خودکار بن تخفیف خرید موفق',
      message: `به پاس خرید موفق شما در سفارش #${orderId}، کد تخفیف اختصاصی «${newCode}» با سقف ${ceiling.toLocaleString('fa-IR')} تومان صادر شد.`,
      targetRole: 'customer',
    });

    return newCoupon;
  };

  // Orders available for bidding
  const pendingBidsCount = orders.filter((o) => o.status === 'bidding' || o.status === 're_routed').length;

  // Auth Handlers
  const handleOpenAuthModal = (mode: 'login' | 'register' = 'login', role: UserRole = 'customer') => {
    setAuthModalMode(mode);
    setAuthModalRole(role);
    setIsAuthModalOpen(true);
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    if (user.role === 'vendor' && user.vendorId) {
      setCurrentVendorId(user.vendorId);
    }
    if (user.role === 'customer') setActiveTab('customer-portal');
    else if (user.role === 'vendor') setActiveTab('vendor-portal');
    else if (user.role === 'wholesaler') setActiveTab('wholesaler-portal');
    else if (user.role === 'admin') setActiveTab('admin-portal');

    const roleTitle = 
      user.role === 'customer' 
        ? 'مشتری خانگی' 
        : user.role === 'vendor' 
          ? 'فروشگاه همکار' 
          : user.role === 'wholesaler' 
            ? 'بنکدار و تامین‌کننده عمده' 
            : 'مدیر ارشد سامانه';

    addNotification({
      type: 'order_approved',
      title: 'ورود موفق به سامانه',
      message: `خوش آمدید، ${user.name}! شما با نقش ${roleTitle} وارد شدید.`,
    });
  };

  const handleRegister = (newUser: UserProfile, newVendorData?: Partial<CurtainVendor>) => {
    setUsers((prev) => [newUser, ...prev]);
    if (newVendorData) {
      setVendors((prev) => [newVendorData as CurtainVendor, ...prev]);
      setCurrentVendorId(newVendorData.id || 'vnd-101');
    }
    setCurrentUser(newUser);
    setCurrentRole(newUser.role);

    if (newUser.role === 'customer') setActiveTab('customer-portal');
    else if (newUser.role === 'vendor') setActiveTab('vendor-portal');
    else if (newUser.role === 'wholesaler') setActiveTab('wholesaler-portal');
    else if (newUser.role === 'admin') setActiveTab('admin-portal');

    addNotification({
      type: 'new_request',
      title: 'ثبت‌نام با موفقیت انجام شد',
      message: `حساب کاربری جدید برای ${newUser.name} فعال شد و به میز کار منتقل شدید.`,
    });
  };

  // User Management Handlers (for Admin Panel Users Menu)
  const handleAddUser = (newUser: UserProfile) => {
    const userToAdd = newUser.role === 'vendor'
      ? { ...newUser, vendorId: newUser.vendorId || `vnd-${Date.now()}` }
      : newUser;
    setUsers((prev) => [userToAdd, ...prev]);
    if (newUser.role === 'vendor') {
      const newV: CurtainVendor = {
        id: userToAdd.vendorId!,
        name: newUser.storeName || newUser.name,
        ownerName: newUser.name,
        phone: newUser.phone,
        city: newUser.city,
        coveredDistricts: [newUser.district || 'مرکز شهر'],
        coveredOtherCities: [],
        rating: 5.0,
        ratingCount: 1,
        completedVisits: 0,
        successfulOrders: 0,
        isVerified: true,
        verificationStatus: 'verified',
        tier: 'نقره‌ای',
        sampleCatalogs: ['مخمل کالیفرنیا ترک', 'حریر شاین و الگانت'],
        availableCatalogIds: ['cat-1', 'cat-2'],
        address: newUser.address,
        walletBalance: 2000000,
      };
      setVendors((prev) => [newV, ...prev]);
    }
    addNotification({
      type: 'order_approved',
      title: 'تعریف کاربر جدید',
      message: `کاربر «${newUser.name}» با موفقیت تعریف گردید.`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    addNotification({
      type: 'special_offer',
      title: 'حذف کاربر',
      message: 'حساب کاربری با موفقیت حذف گردید.',
    });
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUsers((prev) => prev.map((u) => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    addNotification({
      type: 'order_approved',
      title: 'بروزرسانی کاربر',
      message: `اطلاعات «${updatedUser.name}» با موفقیت ذخیره شد.`,
    });
  };

  const handleChangeUserPassword = (userId: string, newPass: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, password: newPass } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, password: newPass } : null));
    }
    addNotification({
      type: 'order_approved',
      title: 'رمز عبور تغییر یافت',
      message: 'رمز عبور جدید کاربر ذخیره شد.',
    });
  };

  // Wholesale Fabrics Handlers (Wholesaler Portal)
  const handleAddWholesaleFabric = (newFabric: WholesaleFabricItem) => {
    setWholesaleFabrics((prev) => [newFabric, ...prev]);
    addNotification({
      type: 'order_approved',
      title: 'افزودن طاقه پارچه جدید',
      message: `طاقه «${newFabric.title}» در انبار ثبت گردید.`,
    });
  };

  const handleUpdateWholesaleFabric = (updatedFabric: WholesaleFabricItem) => {
    setWholesaleFabrics((prev) =>
      prev.map((f) => (f.id === updatedFabric.id ? updatedFabric : f))
    );
    addNotification({
      type: 'order_approved',
      title: 'بروزرسانی طاقه پارچه',
      message: `طاقه «${updatedFabric.title}» ویرایش گردید.`,
    });
  };

  const handleDeleteWholesaleFabric = (id: string) => {
    setWholesaleFabrics((prev) => prev.filter((f) => f.id !== id));
    addNotification({
      type: 'special_offer',
      title: 'حذف طاقه از انبار',
      message: 'طاقه مورد نظر از کاتالوگ انبار حذف گردید.',
    });
  };

  const handleToggleWholesaleAvailability = (id: string) => {
    setWholesaleFabrics((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isAvailable: !f.isAvailable } : f))
    );
  };

  const handleUpdateWholesaleOrderStatus = (
    orderId: string,
    status: WholesaleOrder['status'],
    trackingCode?: string
  ) => {
    setWholesaleOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              trackingCode: trackingCode || o.trackingCode,
            }
          : o
      )
    );
    addNotification({
      type: 'order_approved',
      title: 'بروزرسانی وضعیت سفارش عمده',
      message: `وضعیت سفارش عمده تغییر یافت.`,
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('home');
    setIsLogoutConfirmOpen(false);
    addNotification({
      type: 'special_offer',
      title: 'خروج از حساب',
      message: 'شما با موفقیت از حساب کاربری خود خارج شدید.',
    });
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setCurrentUser(updatedProfile);
    setUsers((prev) => prev.map((u) => u.id === updatedProfile.id ? updatedProfile : u));

    // If Vendor, sync with vendors state
    if (updatedProfile.role === 'vendor') {
      setVendors((prev) => prev.map((v) => {
        if (v.id === updatedProfile.vendorId || v.phone === updatedProfile.phone) {
          return {
            ...v,
            name: updatedProfile.storeName || v.name,
            ownerName: updatedProfile.ownerName || updatedProfile.name,
            phone: updatedProfile.phone,
            address: updatedProfile.address,
            coveredDistricts: updatedProfile.coveredDistricts || v.coveredDistricts,
          };
        }
        return v;
      }));
    }

    addNotification({
      type: 'order_approved',
      title: 'پروفایل بروزرسانی شد',
      message: 'مشخصات تماس و نشانی پستی شما در سامانه با موفقیت ذخیره گردید.',
    });
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    const matched = users.find((u) => u.role === role);
    if (matched) {
      setCurrentUser(matched);
      if (role === 'vendor' && matched.vendorId) {
        setCurrentVendorId(matched.vendorId);
      }
    }
  };

  // Handlers for Request Creation
  const handleCreateRequest = (newRequestData: Partial<VisitRequest>) => {
    const newId = `ord-${Date.now()}`;
    const newOrderNumber = `AP-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const dateStr = now.toLocaleDateString('fa-IR');
    const timeStr = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const depositAmount = themeSettings.customerDepositFee || 350000;
    const claimCost = themeSettings.vendorLeadFee || 550000;

    const orderCity = newRequestData.city || currentUser?.city || 'تهران';
    const orderDistrict = newRequestData.district || currentUser?.district || 'مرکز شهر';

    // Buy Box Priority Evaluation
    let isBuyBoxAssigned = false;
    let buyBoxTargetVendorId: string | undefined = undefined;
    let buyBoxTargetVendorName: string | undefined = undefined;
    let buyBoxExpiresTimestamp: number | undefined = undefined;

    if (buyBoxSettings.isEnabled && buyBoxSettings.autoAssignEnabled) {
      const activeResIndex = buyBoxReservations.findIndex(
        (r) =>
          r.status === 'active' &&
          r.vendorCity === orderCity &&
          canVendorReceiveBuyBoxOrder(restrictions, r.vendorId) &&
          r.coveredDistricts.some((d) => d.includes(orderDistrict) || orderDistrict.includes(d))
      );

      if (activeResIndex !== -1) {
        const activeRes = buyBoxReservations[activeResIndex];
        // 50% max daily quota rule: alternate orders (every even count goes to Buy Box)
        if (activeRes.ordersReceivedCount % 2 === 0) {
          isBuyBoxAssigned = true;
          buyBoxTargetVendorId = activeRes.vendorId;
          buyBoxTargetVendorName = activeRes.vendorName;
          buyBoxExpiresTimestamp = Date.now() + (buyBoxSettings.acceptanceTimeoutMinutes || 15) * 60 * 1000;

          // Increment reservation received count
          const updatedReservations = [...buyBoxReservations];
          updatedReservations[activeResIndex] = {
            ...activeRes,
            ordersReceivedCount: activeRes.ordersReceivedCount + 1,
          };
          setBuyBoxReservations(updatedReservations);
          saveStored('autopardeh_buy_box_reservations', updatedReservations);
        }
      }
    }

    const newOrder: VisitRequest = {
      id: newId,
      orderNumber: newOrderNumber,
      customerName: newRequestData.customerName || currentUser?.name || 'مشتری جدید',
      phone: newRequestData.phone || currentUser?.phone || '۰۹۱۲۰۰۰۰۰۰۰',
      province: currentUser?.province || 'تهران',
      city: orderCity,
      district: orderDistrict,
      address: newRequestData.address || currentUser?.address || '',
      floorAndUnit: newRequestData.floorAndUnit || currentUser?.floorAndUnit || '',
      rooms: newRequestData.rooms || ['سالن پذیرایی'],
      approximateWindows: newRequestData.approximateWindows || 2,
      approximateWidthMeters: newRequestData.approximateWidthMeters || 4.5,
      preferredStyles: newRequestData.preferredStyles || ['مخمل کالیفرنیا ترک'],
      preferredDate: newRequestData.preferredDate || dateStr,
      timeSlot: newRequestData.timeSlot || '۱۵:۰۰ الی ۱۸:۰۰',
      notes: newRequestData.notes || '',
      depositAmount: depositAmount,
      depositStatus: 'paid',
      claimCost: claimCost,
      status: 'bidding',
      isBuyBoxOrder: isBuyBoxAssigned,
      buyBoxVendorId: buyBoxTargetVendorId,
      buyBoxVendorName: buyBoxTargetVendorName,
      buyBoxAssignedAt: isBuyBoxAssigned ? Date.now() : undefined,
      buyBoxExpiresAt: buyBoxExpiresTimestamp,
      buyBoxStatus: isBuyBoxAssigned ? 'pending_vendor_acceptance' : undefined,
      reRouteCount: 0,
      createdAt: dateStr,
      timeline: [
        {
          id: `t-${Date.now()}`,
          title: `ثبت سفارش و پرداخت بیعانه ${depositAmount.toLocaleString('fa-IR')} تومانی`,
          date: dateStr,
          time: timeStr,
          description: isBuyBoxAssigned
            ? `سفارش با اولویت بای‌باکس به مدت ${buyBoxSettings.acceptanceTimeoutMinutes || 15} دقیقه به فروشگاه «${buyBoxTargetVendorName}» اختصاص یافت.`
            : 'درخواست مشاوره خانگی ثبت شد و سفارش جهت اعزام در تابلوی مزایده فروشگاه‌ها قرار گرفت.',
          actor: 'مشتری',
          type: 'creation',
        },
      ],
    };

    setOrders([newOrder, ...orders]);
    setIsBookingModalOpen(false);

    // If Buy Box assigned, notify the priority vendor
    if (isBuyBoxAssigned && buyBoxTargetVendorName) {
      addNotification({
        type: 'new_request',
        title: `👑 سفارش اختصاصی بای‌باکس برای ${buyBoxTargetVendorName}`,
        message: `سفارش #${newOrderNumber} در ${newOrder.district} به شما پیشنهاد شد. مهلت تایید: ${buyBoxSettings.acceptanceTimeoutMinutes || 15} دقیقه.`,
        targetRole: 'vendor',
        orderId: newId,
        orderNumber: newOrderNumber,
        linkTab: 'vendor-portal',
        actionLabel: 'مشاهده و قبول سفارش',
      });
    } else {
      // General Hunting Board Notification
      addNotification({
        type: 'new_request',
        title: `سفارش جدید آماده شکار در ${newOrder.district}`,
        message: `مشتری (${newOrder.customerName}) درخواست اعزام کالیته برای ${newOrder.approximateWindows} پنجره ثبت کرد.`,
        targetRole: 'vendor',
        orderId: newId,
        orderNumber: newOrderNumber,
        linkTab: 'vendor-portal',
        actionLabel: 'مشاهده در تابلو',
      });
    }

    // Notify the customer about confirmation
    addNotification({
      type: 'new_request',
      title: 'سفارش مشاوره در منزل ثبت شد',
      message: `سفارش #${newOrderNumber} با موفقیت ثبت شد. به زودی نزدیک‌ترین فروشگاه معتبر منطقه مشخص و برای هماهنگی تماس خواهد گرفت.`,
      targetRole: 'customer',
      orderId: newId,
      orderNumber: newOrderNumber,
      linkTab: 'customer-portal',
      actionLabel: 'پیگیری سفارش',
    });
  };

  // Vendor Bidding / Claiming Lead
  const handleClaimOrder = (orderId: string, vendorId: string, vendorName?: string, vendorPhone?: string) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    if (!vendor) return false;

    // محدودیت‌ها: محرومیت، سقف ۳ سفارش اول، سقف روزانه و بافر
    const claimDecision = canVendorClaim(restrictions, vendorId, orders);
    if (!claimDecision.ok) {
      alert(claimDecision.reason || 'شکار سفارش برای شما در حال حاضر مجاز نیست.');
      return false;
    }

    const leadCost = themeSettings.vendorLeadFee || 550000;
    const currentBalance = vendor.walletBalance || 0;

    if (currentBalance < leadCost) {
      alert(`موجودی کیف پول شما (${currentBalance.toLocaleString('fa-IR')} ت) برای شکار این سفارش کافی نیست. لطفاً کیف پول خود را حداقل ۵۵۰,۰۰۰ تومان شارژ نمایید.`);
      return false;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('fa-IR');
    const timeStr = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    // Deduct lead fee from vendor wallet
    const newBalance = currentBalance - leadCost;
    const transaction: WalletTransaction = {
      id: `tx-${Date.now()}`,
      vendorId: vendor.id,
      amount: leadCost,
      type: 'order_claim_fee',
      date: dateStr,
      time: timeStr,
      description: `کسر هزینه شکار سفارش مشتری در ${vendor.coveredDistricts[0] || 'منطقه'}`,
      orderId,
      balanceAfter: newBalance,
    };

    setVendors(vendors.map((v) => {
      if (v.id === vendorId) {
        return {
          ...v,
          walletBalance: newBalance,
          transactions: [transaction, ...(v.transactions || [])],
        };
      }
      return v;
    }));
    setRestrictions((prev) => recordVendorClaim(prev, vendorId));

    let customerPhone = '';
    let customerName = '';
    let orderNum = '';

    setOrders(orders.map((o) => {
      if (o.id === orderId) {
        customerPhone = o.phone;
        customerName = o.customerName;
        orderNum = o.orderNumber;
        return {
          ...o,
          status: 'assigned',
          assignedVendorId: vendor.id,
          assignedVendorName: vendorName || vendor.name,
          assignedVendorPhone: vendorPhone || vendor.phone,
          timeline: [
            ...o.timeline,
            {
              id: `t-${Date.now()}`,
              title: `تخصیص و شکار سفارش توسط ${vendorName || vendor.name}`,
              date: dateStr,
              time: timeStr,
              description: `فروشگاه ${vendorName || vendor.name} با کسر حق‌الامتیاز شکار سفارش، مسئولیت اعزام کارشناس و کالیته به همراه نمونه پارچه‌ها را برعهده گرفت.`,
              actor: 'فروشگاه',
              type: 'assignment',
            },
          ],
        };
      }
      return o;
    }));

    // Notify customer about assigned store
    addNotification({
      type: 'order_assigned',
      title: `فروشگاه مجری انتخاب شد: ${vendorName || vendor.name}`,
      message: `فروشگاه ${vendorName || vendor.name} به سفارش #${orderNum} شما متصل شد. کارشناس مربوطه همراه با آلبوم‌های کالیته پارچه جهت هماهنگی تماس خواهد گرفت.`,
      targetRole: 'customer',
      orderId,
      orderNumber: orderNum,
      linkTab: 'customer-portal',
      actionLabel: 'مشاهده مشخصات فروشگاه',
    });

    return true;
  };

  // Vendor Wallet Top-Up
  const handleTopUpWallet = (vendorId: string, amount: number) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('fa-IR');
    const timeStr = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    setVendors(vendors.map((v) => {
      if (v.id === vendorId) {
        const newBalance = (v.walletBalance || 0) + amount;
        const tx: WalletTransaction = {
          id: `tx-${Date.now()}`,
          vendorId,
          amount,
          type: 'deposit',
          date: dateStr,
          time: timeStr,
          description: `شارژ آنلاین کیف پول از درگاه شتاب`,
          balanceAfter: newBalance,
        };
        return {
          ...v,
          walletBalance: newBalance,
          transactions: [tx, ...(v.transactions || [])],
        };
      }
      return v;
    }));

    addNotification({
      type: 'special_offer',
      title: 'شارژ موفق کیف پول همکار',
      message: `مبلغ ${amount.toLocaleString('fa-IR')} تومان به کیف پول کاری شما افزوده شد. اکنون آماده شکار سفارشات منطقه هستید.`,
      targetRole: 'vendor',
      linkTab: 'vendor-portal',
      actionLabel: 'مشاهده موجودی',
    });
  };

  // Helper to calculate ladder price according to user rules:
  // Up to 10 stores: 200,000 Tomans
  // After 10 stores: each new applicant pays +20% compounded
  const calculateCityLadderPrice = (cityName: string) => {
    const cityPromotedVendors = vendors.filter(
      (v) => (v.city === cityName || v.coveredDistricts?.some((d) => d.includes(cityName))) && v.isPromotedAd
    );
    const count = cityPromotedVendors.length;
    if (count < 10) {
      return 200000;
    }
    const excess = count - 9;
    return Math.round(200000 * Math.pow(1.20, excess));
  };

  // Vendor Ladder Action:
  const handleVendorLadder = (vendorId: string, cityName?: string) => {
    const targetVendor = vendors.find((v) => v.id === vendorId);
    if (!targetVendor) return { success: false, message: 'فروشگاه یافت نشد' };

    const targetCity = cityName || targetVendor.city || selectedCity;
    const fee = calculateCityLadderPrice(targetCity);

    if (targetVendor.walletBalance < fee) {
      addNotification({
        type: 'special_offer',
        title: 'موجودی کیف پول کافی نیست',
        message: `برای ثبت نردبان رتبه ۱ در شهر ${targetCity} به ${fee.toLocaleString('fa-IR')} تومان نیاز دارید. موجودی فعلی: ${targetVendor.walletBalance.toLocaleString('fa-IR')} تومان.`,
        targetRole: 'vendor',
        linkTab: 'vendor-portal',
      });
      return { success: false, message: 'موجودی ناکافی', feeNeeded: fee };
    }

    const newTx: WalletTransaction = {
      id: `tx-ladder-${Date.now()}`,
      vendorId: targetVendor.id,
      type: 'sponsored_ladder_fee',
      amount: fee,
      description: `پرداخت هزینه نردبان و آگهی ویژه در صفحه اول شهر ${targetCity} (رتبه ۱ ویترین)`,
      date: new Date().toLocaleDateString('fa-IR'),
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      balanceAfter: targetVendor.walletBalance - fee,
    };

    setVendors((prev) => {
      // Find all promoted stores in targetCity sorted by promotedAt descending (newest ladder first)
      const existingPromoted = prev.filter(
        (v) => (v.city === targetCity || v.coveredDistricts?.some((d) => d.includes(targetCity))) && v.isPromotedAd && v.id !== vendorId
      ).sort((a, b) => (b.promotedAt || 0) - (a.promotedAt || 0));

      // Up to 9 existing can stay alongside the new #1 vendor, so total is max 10:
      const keptIds = new Set(existingPromoted.slice(0, 9).map((v) => v.id));
      keptIds.add(vendorId);

      return prev.map((v) => {
        if (v.id === vendorId) {
          const currentTxs = v.transactions || [];
          return {
            ...v,
            isPromotedAd: true,
            promotedAt: Date.now(),
            promotedExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // Valid for 1 month
            promotedFeePaid: fee,
            promotedLadderPosition: 1,
            walletBalance: v.walletBalance - fee,
            transactions: [newTx, ...currentTxs],
          };
        }

        const isInCity = v.city === targetCity || v.coveredDistricts?.some((d) => d.includes(targetCity));
        if (isInCity && v.isPromotedAd) {
          if (keptIds.has(v.id)) {
            return v;
          } else {
            // Displaced: oldest store bumped out!
            return {
              ...v,
              isPromotedAd: false,
              promotedLadderPosition: undefined,
            };
          }
        }
        return v;
      });
    });

    addNotification({
      type: 'order_approved',
      title: 'نردبان فروشگاه با موفقیت انجام شد!',
      message: `فروشگاه «${targetVendor.name}» با پرداخت ${fee.toLocaleString('fa-IR')} تومان به رتبه ۱ ویترین شهر ${targetCity} صعود کرد (اعتبار نمایش: ۱ ماه).`,
      targetRole: 'vendor',
      linkTab: 'vendor-portal',
    });

    return { success: true, feePaid: fee };
  };

  // Portfolio Management Handlers (Max 15 items, JPG only, standard 1200x800, Admin Manual Approval Required)
  const handleUploadPortfolioItem = (vendorId: string, item: Omit<VendorPortfolioItem, 'id' | 'createdAt' | 'status'>) => {
    const newItem: VendorPortfolioItem = {
      ...item,
      id: `port-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'pending', // Requires manual approval by site administrator
      createdAt: new Date().toLocaleDateString('fa-IR'),
    };

    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          const currentList = v.portfolio || [];
          if (currentList.length >= 15) return v;
          return {
            ...v,
            portfolio: [newItem, ...currentList],
          };
        }
        return v;
      })
    );

    addNotification({
      type: 'order_approved',
      title: 'نمونه‌کار ارسال شد (در انتظار تایید مدیر)',
      message: `نمونه‌کار «${item.title}» با استاندارد ابعاد ۱۲۰۰×۸۰۰ ثبت شد و پس از بررسی و تایید دستی مدیر روی سایت نمایش داده خواهد شد.`,
      targetRole: 'vendor',
      linkTab: 'vendor-portal',
    });
  };

  const handleDeletePortfolioItem = (vendorId: string, itemId: string) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          return {
            ...v,
            portfolio: (v.portfolio || []).filter((p) => p.id !== itemId),
          };
        }
        return v;
      })
    );
  };

  const handleModeratePortfolioItem = (
    vendorId: string,
    itemId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ) => {
    let vendorName = '';
    let itemTitle = '';

    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          vendorName = v.name;
          const updated = (v.portfolio || []).map((p) => {
            if (p.id === itemId) {
              itemTitle = p.title;
              return {
                ...p,
                status,
                rejectionReason: reason,
                approvedAt: status === 'approved' ? new Date().toLocaleDateString('fa-IR') : undefined,
              };
            }
            return p;
          });
          return {
            ...v,
            portfolio: updated,
          };
        }
        return v;
      })
    );

    addNotification({
      type: status === 'approved' ? 'order_approved' : 'special_offer',
      title: status === 'approved' ? 'نمونه‌کار تایید و منتشر شد' : 'نمونه‌کار رد شد',
      message: `نمونه‌کار «${itemTitle || 'فروشگاه'}» (${vendorName}) ${
        status === 'approved'
          ? 'تایید گردید و هم‌اکنون در آلبوم عمومی فروشگاه برای مشتریان قابل مشاهده است.'
          : `رد شد: ${reason || 'عدم انطباق با ضوابط اتحادیه'}`
      }`,
      targetRole: 'vendor',
      linkTab: 'vendor-portal',
    });
  };

  // Simulate 20 Vendors Laddering Scenario:
  const handleSimulate20Vendors = (targetCity: string = selectedCity) => {
    const baseNames = [
      'گالری پرده رویال', 'پرده‌سرای الوند', 'دکوراسیون ابریشم', 'آتلیه دیزاین پردیس',
      'خانه پرده زمرد', 'گالری کالیته ترنج', 'پرده‌سرای ستاره', 'پارچه سرای قصر',
      'دکوراسیون مدرن نگین', 'گالری پرده آریا', // First 10
      'پرده‌سرای ونوس (متقاضی ۱۱)', 'آتلیه پرده آویشن (متقاضی ۱۲)', 'گالری دیبا (متقاضی ۱۳)',
      'پرده‌سرای سپهر (متقاضی ۱۴)', 'خانه پرده یاس (متقاضی ۱۵)', 'گالری آفتاب (متقاضی ۱۶)',
      'پرده‌سرای کیهان (متقاضی ۱۷)', 'آتلیه پرده صبا (متقاضی ۱۸)', 'گالری مینا (متقاضی ۱۹)',
      'سوپر پرده الماس (متقاضی ۲۰)' // 20th store
    ];

    const now = Date.now();
    const simulatedVendors: CurtainVendor[] = baseNames.map((name, idx) => {
      const applicantNum = idx + 1;
      const isPastTen = applicantNum > 10;
      const excess = applicantNum - 10;
      const fee = isPastTen ? Math.round(200000 * Math.pow(1.20, excess)) : 200000;
      // In 20 sequential applications, applicants 11-20 are the active 10, applicants 1-10 were bumped out!
      const isActiveInTop10 = applicantNum >= 11;
      const ladderRank = isActiveInTop10 ? (20 - applicantNum + 1) : 0;

      return {
        id: `sim-vnd-${100 + applicantNum}`,
        name: `${name} (${targetCity})`,
        ownerName: `مدیر ${name}`,
        phone: `0912000${(1000 + applicantNum).toString().slice(1)}`,
        city: targetCity,
        coveredDistricts: ['منطقه مرکزی', 'منطقه شمالی', 'منطقه شرقی'],
        rating: Number((4.6 + (applicantNum % 4) * 0.1).toFixed(1)),
        ratingCount: 30 + applicantNum * 4,
        completedVisits: 40 + applicantNum * 3,
        successfulOrders: 35 + applicantNum * 3,
        isVerified: true,
        verificationStatus: 'verified',
        tier: applicantNum % 2 === 0 ? 'طلایی' : 'نقره‌ای',
        sampleCatalogs: ['مخمل سلطنتی', 'حریر کرپ شاین', 'زبرا دو مکانیزم'],
        address: `${targetCity}، بلوار اصلی، پلاک ${applicantNum * 4}`,
        walletBalance: 2500000,
        isPromotedAd: isActiveInTop10,
        promotedAt: now - (20 - applicantNum) * 120000,
        promotedExpiresAt: now + 30 * 24 * 60 * 60 * 1000,
        promotedFeePaid: fee,
        promotedLadderPosition: isActiveInTop10 ? ladderRank : undefined,
      };
    });

    setVendors((prev) => {
      const nonSim = prev.filter((v) => !v.id.startsWith('sim-vnd-') && v.city !== targetCity);
      return [...simulatedVendors, ...nonSim];
    });

    addNotification({
      type: 'order_approved',
      title: 'شبیه‌سازی سناریوی ۲۰ فروشگاه اجرا شد',
      message: `۲۰ متقاضی نردبان در شهر ${targetCity} پردازش شدند. ۱۰ فروشگاه آخر در ویترین فعالند و قیمت تا متقاضی بیستم با نرخ ۲۰٪ پله‌ای محاسبه گردید.`,
      targetRole: 'vendor',
      linkTab: 'vendor-portal',
    });
  };

  // Vendor Issues Invoice
  const handleIssueInvoice = (orderId: string, invoice: CurtainInvoice) => {
    let orderNum = '';
    setOrders(orders.map((o) => {
      if (o.id === orderId) {
        orderNum = o.orderNumber;
        return {
          ...o,
          status: 'visited',
          invoice: invoice,
          timeline: [
            ...o.timeline,
            {
              id: `t-${Date.now()}`,
              title: 'صدور فاکتور رسمی با کسر تضمینی بیعانه',
              date: invoice.issuedAt || new Date().toLocaleDateString('fa-IR'),
              time: '۱۲:۰۰',
              description: `فاکتور به مبلغ کل ${invoice.subtotal.toLocaleString('fa-IR')} تومان با کسر بیعانه اولیه صادر شد. مبلغ نهایی قابل پرداخت: ${invoice.finalPayable.toLocaleString('fa-IR')} تومان.`,
              actor: 'فروشگاه',
              type: 'invoice',
            },
          ],
        };
      }
      return o;
    }));

    // Notify customer about invoice
    addNotification({
      type: 'order_assigned',
      title: `فاکتور سفارش #${orderNum} صادر شد`,
      message: `فاکتور با کسر کامل بیعانه اولیه صادر شد. لطفاً بررسی و در صورت تایید جهت شروع دوخت اقدام نمایید.`,
      targetRole: 'customer',
      orderId,
      orderNumber: orderNum,
      linkTab: 'customer-portal',
      actionLabel: 'مشاهده و پرداخت فاکتور',
    });
  };

  // Customer Approves Invoice
  const handleApproveInvoice = (orderId: string) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('fa-IR');
    const timeStr = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    let vendorId = '';
    let orderNum = '';
    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder) {
      const custName = targetOrder.customerName || currentUser?.name || 'مشتری محترم';
      const custPhone = targetOrder.phone || currentUser?.phone || '';
      const amount = targetOrder.invoice?.finalPayable || 5000000;
      handleIssueAutomaticDiscountCoupon(custName, custPhone, targetOrder.orderNumber, amount);
    }

    setOrders(orders.map((o) => {
      if (o.id === orderId) {
        vendorId = o.assignedVendorId || '';
        orderNum = o.orderNumber;
        return {
          ...o,
          status: 'approved',
          timeline: [
            ...o.timeline,
            {
              id: `t-${Date.now()}`,
              title: 'تایید نهایی فاکتور توسط مشتری و ارجاع به کارگاه دوخت',
              date: dateStr,
              time: timeStr,
              description: 'مشتری فاکتور را تایید کرد و پارچه‌های انتخاب شده برش خورده و وارد چرخه دوخت و آماده‌سازی شدند.',
              actor: 'مشتری',
              type: 'approved',
            },
          ],
        };
      }
      return o;
    }));

    // Notify vendor
    addNotification({
      type: 'order_approved',
      title: `سفارش #${orderNum} تایید نهایی شد!`,
      message: `مشتری فاکتور را تایید کرد. سفارش آماده برش پارچه و ارسال به کارگاه دوخت است.`,
      targetRole: 'vendor',
      orderId,
      orderNumber: orderNum,
      linkTab: 'vendor-portal',
      actionLabel: 'جزئیات سفارش دوخت',
    });
  };

  // Customer Requests Second Store
  const handleRequestSecondStore = (orderId: string, reason: string) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('fa-IR');
    const timeStr = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    let orderNum = '';
    setOrders(orders.map((o) => {
      if (o.id === orderId) {
        orderNum = o.orderNumber;
        return {
          ...o,
          status: 're_routed',
          reRouteCount: (o.reRouteCount || 0) + 1,
          reRouteReason: reason,
          assignedVendorId: undefined,
          assignedVendorName: undefined,
          assignedVendorPhone: undefined,
          invoice: undefined,
          timeline: [
            ...o.timeline,
            {
              id: `t-${Date.now()}`,
              title: 'درخواست اعزام فروشگاه دیگر جهت مقایسه',
              date: dateStr,
              time: timeStr,
              description: `مشتری درخواست فروشگاه جایگزین کرد (${reason}). سفارش بدون دریافت بیعانه جدید مجدداً برای سایر فروشگاه‌ها مزایده شد.`,
              actor: 'مشتری',
              type: 'comparison',
            },
          ],
        };
      }
      return o;
    }));

    // Notify vendors that an order is re-routed for comparison
    addNotification({
      type: 'order_assigned',
      title: `مزایده مجدد سفارش #${orderNum} جهت مقایسه کالیته`,
      message: `مشتری جهت بررسی تنوع پارچه‌های بیشتر درخواست فروشگاه جایگزین نموده است. سفارش هم‌اکنون در دسترس سایر فروشگاه‌های تخصصی است.`,
      targetRole: 'vendor',
      orderId,
      orderNumber: orderNum,
      linkTab: 'vendor-portal',
      actionLabel: 'شکار در مزایده',
    });
  };

  // Review & Rating Handlers
  const handleSubmitReview = (reviewData: Omit<VendorReview, 'id' | 'date'>) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('fa-IR');
    const timeStr = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    const existingIndex = reviews.findIndex(
      (r) => r.orderId === reviewData.orderId || (r.orderNumber && r.orderNumber === reviewData.orderNumber)
    );

    let newReview: VendorReview;

    if (existingIndex >= 0) {
      newReview = {
        ...reviews[existingIndex],
        ...reviewData,
        date: dateStr,
        time: timeStr,
      };
      setReviews((prev) => prev.map((r, i) => (i === existingIndex ? newReview : r)));
    } else {
      newReview = {
        ...reviewData,
        id: `rev-${Date.now()}`,
        date: dateStr,
        time: timeStr,
      };
      setReviews((prev) => [newReview, ...prev]);
    }

    // Update order with the review and mark installed if not already
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === reviewData.orderId || o.orderNumber === reviewData.orderNumber) {
          return {
            ...o,
            status: 'installed',
            customerReview: newReview,
          };
        }
        return o;
      })
    );

    // Recalculate vendor rating & rating count
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === reviewData.vendorId) {
          const otherReviews = reviews.filter((r) => r.vendorId === v.id && r.orderId !== reviewData.orderId);
          const allVendorReviews = [...otherReviews, newReview];
          const newAvg = (
            allVendorReviews.reduce((sum, r) => sum + r.rating, 0) / allVendorReviews.length
          );
          return {
            ...v,
            rating: parseFloat(newAvg.toFixed(1)),
            ratingCount: (v.ratingCount || 0) + (existingIndex >= 0 ? 0 : 1),
            reviews: allVendorReviews,
          };
        }
        return v;
      })
    );

    // Add confirmation notifications
    addNotification({
      type: 'order_approved',
      title: 'نظر و امتیاز شما با موفقیت ثبت شد',
      message: `امتیاز ${reviewData.rating} ستاره شما برای فروشگاه ${reviewData.vendorName} در کارنامه رسمی ثبت گردید.`,
      targetRole: 'customer',
      orderId: reviewData.orderId,
      orderNumber: reviewData.orderNumber,
      linkTab: 'customer-portal',
    });

    addNotification({
      type: 'order_approved',
      title: `مشتری نظر و امتیاز جدید ثبت کرد (${reviewData.rating}★)`,
      message: `${reviewData.customerName} برای سفارش #${reviewData.orderNumber} امتیاز ${reviewData.rating} ستاره ثبت کرد: «${reviewData.comment.slice(0, 45)}...»`,
      targetRole: 'vendor',
      orderId: reviewData.orderId,
      orderNumber: reviewData.orderNumber,
      linkTab: 'vendor-portal',
      actionLabel: 'مشاهده در کارنامه',
    });
  };

  const handleVendorReplyReview = (reviewId: string, replyText: string) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('fa-IR');

    let targetReview: VendorReview | undefined;

    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          targetReview = {
            ...r,
            vendorReply: {
              text: replyText,
              date: dateStr,
            },
          };
          return targetReview;
        }
        return r;
      })
    );

    if (targetReview) {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === targetReview!.orderId || o.orderNumber === targetReview!.orderNumber) {
            return {
              ...o,
              customerReview: targetReview,
            };
          }
          return o;
        })
      );

      addNotification({
        type: 'new_message',
        title: `پاسخ رسمی فروشگاه به نظر شما در سفارش #${targetReview.orderNumber}`,
        message: `فروشگاه ${targetReview.vendorName} به دیدگاه ثبت‌شده شما پاسخ داد: «${replyText.slice(0, 50)}...»`,
        targetRole: 'customer',
        orderId: targetReview.orderId,
        orderNumber: targetReview.orderNumber,
        linkTab: 'customer-portal',
        actionLabel: 'مشاهده پاسخ',
      });
    }
  };

  const handleMarkOrderInstalled = (orderId: string) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('fa-IR');
    const timeStr = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    let orderNum = '';

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          orderNum = o.orderNumber;
          return {
            ...o,
            status: 'installed',
            timeline: [
              ...o.timeline,
              {
                id: `t-${Date.now()}`,
                title: 'تایید نصب نهایی پرده‌ها و اتمام موفق سفارش',
                date: dateStr,
                time: timeStr,
                description: 'مشتری تحویل، دوخت و نصب کامل پرده‌ها را تایید کرد.',
                actor: 'مشتری',
                type: 'success',
              },
            ],
          };
        }
        return o;
      })
    );

    addNotification({
      type: 'order_approved',
      title: `سفارش #${orderNum} تکمیل شد`,
      message: 'نصب و تحویل پرده‌ها تایید شد. لطفاً تجربه خرید خود را با ثبت امتیاز ارزیابی فرمایید.',
      targetRole: 'customer',
      orderId,
      orderNumber: orderNum,
      linkTab: 'customer-portal',
      actionLabel: 'ثبت نظر و امتیاز',
    });

    addNotification({
      type: 'order_approved',
      title: `مشتری نصب سفارش #${orderNum} را تایید کرد`,
      message: `سفارش #${orderNum} با موفقیت تحویل و نصب شد و پرونده آن تکمیل گردید.`,
      targetRole: 'vendor',
      orderId,
      orderNumber: orderNum,
      linkTab: 'vendor-portal',
    });
  };

  const handleOpenVendorProfile = (vendorId: string) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    if (vendor) {
      setSelectedVendorForProfileModal(vendor);
    }
  };

  // Status updates from Admin
  // ==========================================================
  // پیشنهادها، گزارش ایرادها و فهرست رفع خطاها
  // ==========================================================
  const handleSubmitFeedback = (input: FeedbackSubmitInput): FeedbackItem | null => {
    const now = Date.now();
    const item: FeedbackItem = {
      id: `fb-${now}-${Math.random().toString(36).slice(2, 6)}`,
      code: makeFeedbackCode(),
      kind: input.kind,
      title: input.title,
      description: input.description,
      section: input.section,
      severity: input.severity,
      stepsToReproduce: input.stepsToReproduce,
      environment: input.kind === 'bug' ? collectEnvironment(activeTab) : undefined,
      authorId: currentUser?.id || `guest-${now}`,
      authorName: currentUser?.name || input.guestName || 'مهمان',
      authorRole: currentUser?.role || 'guest',
      contact: input.contact,
      createdAt: now,
      createdAtLabel: faDateTime(now),
      updatedAt: now,
      status: 'new',
      voters: currentUser?.id ? [currentUser.id] : [],
    };
    setFeedbackItems((prev) => [item, ...prev]);
    addNotification({
      type: 'new_message',
      title: input.kind === 'bug' ? `گزارش ایراد جدید: ${input.title}` : `پیشنهاد جدید: ${input.title}`,
      message: `${item.authorName} در بخش «${input.section}» ثبت کرد. کد پیگیری: ${item.code}`,
      targetRole: 'admin',
      linkTab: 'feedback',
    });
    return item;
  };

  const handleToggleFeedbackVote = (feedbackId: string) => {
    if (!currentUser?.id) return;
    const uid = currentUser.id;
    setFeedbackItems((prev) =>
      prev.map((f) =>
        f.id === feedbackId
          ? { ...f, voters: f.voters.includes(uid) ? f.voters.filter((v) => v !== uid) : [...f.voters, uid] }
          : f
      )
    );
  };

  const handleUpdateFeedback = (id: string, patch: Partial<Pick<FeedbackItem, 'status' | 'adminReply'>>) => {
    if (currentUser?.role !== 'admin') return;
    setFeedbackItems((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              ...patch,
              adminReplyAt: patch.adminReply !== undefined ? faDate() : f.adminReplyAt,
              updatedAt: Date.now(),
            }
          : f
      )
    );
  };

  const handleDeleteFeedback = (id: string) => {
    if (currentUser?.role !== 'admin') return;
    setFeedbackItems((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAddChangelog = (entry: Omit<ChangelogEntry, 'id' | 'createdAt' | 'isSystem'>) => {
    if (currentUser?.role !== 'admin') return;
    const created: ChangelogEntry = { ...entry, id: `cl-${Date.now()}`, createdAt: Date.now() };
    setChangelog((prev) => ({ ...prev, entries: [created, ...prev.entries] }));
  };

  const handleUpdateChangelog = (id: string, patch: Partial<ChangelogEntry>) => {
    if (currentUser?.role !== 'admin') return;
    setChangelog((prev) => ({ ...prev, entries: prev.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  };

  const handleDeleteChangelog = (id: string) => {
    if (currentUser?.role !== 'admin') return;
    setChangelog((prev) => {
      const target = prev.entries.find((e) => e.id === id);
      return {
        entries: prev.entries.filter((e) => e.id !== id),
        deletedSeedIds: target?.isSystem ? [...prev.deletedSeedIds, id] : prev.deletedSeedIds,
      };
    });
  };

  /** مورد «رفع شد» را به فهرست رفع‌شده‌ها منتقل می‌کند و به کاربر اطلاع می‌دهد */
  const handlePublishFixedToChangelog = (feedbackId: string) => {
    if (currentUser?.role !== 'admin') return;
    const f = feedbackItems.find((x) => x.id === feedbackId);
    if (!f || f.changelogId) return;
    const entry: ChangelogEntry = {
      id: `cl-${Date.now()}`,
      title: f.title,
      description: f.adminReply || f.description,
      category: f.kind === 'bug' ? 'fix' : 'improvement',
      date: faDate(),
      relatedFeedbackId: f.id,
      createdAt: Date.now(),
    };
    setChangelog((prev) => ({ ...prev, entries: [entry, ...prev.entries] }));
    setFeedbackItems((prev) => prev.map((x) => (x.id === feedbackId ? { ...x, changelogId: entry.id, updatedAt: Date.now() } : x)));
  };

  // ==========================================================
  // محدودیت‌ها و جریمه‌ها (عملیات مدیر سامانه)
  // ==========================================================
  const nowParts = () => {
    const d = new Date();
    return {
      date: d.toLocaleDateString('fa-IR'),
      time: d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const handleUpdateRestrictionSettings = (partial: Partial<RestrictionSettings>) => {
    setRestrictions((prev) => ({ ...prev, settings: { ...prev.settings, ...partial } }));
  };

  const handleAddSuspension = (vendorId: string, scope: SuspensionScope, reason: string, durationDays: number) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    if (!vendor || durationDays <= 0 || !reason.trim()) return false;
    const now = Date.now();
    const { date, time } = nowParts();
    const suspension: VendorSuspension = {
      id: `susp-${now}`,
      vendorId,
      vendorName: vendor.name,
      scope,
      reason: reason.trim(),
      durationDays,
      startAt: now,
      endAt: now + durationDays * DAY_MS,
      createdBy: currentUser?.name || 'مدیر سامانه',
      createdAt: `${date} - ${time}`,
    };
    setRestrictions((prev) => ({ ...prev, suspensions: [suspension, ...prev.suspensions] }));
    addNotification({
      type: 'new_message',
      title: scope === 'all' ? 'محرومیت موقت از خدمات سامانه' : 'محرومیت موقت از تابلوی شکار سفارشات',
      message: `${durationDays.toLocaleString('fa-IR')} روز محرومیت برای فروشگاه «${vendor.name}» اعمال شد. دلیل: ${reason.trim()}`,
      targetRole: 'vendor',
      linkTab: 'vendor-portal',
    });
    return true;
  };

  const handleLiftSuspension = (suspensionId: string, reason: string) => {
    setRestrictions((prev) => ({
      ...prev,
      suspensions: prev.suspensions.map((s) =>
        s.id === suspensionId ? { ...s, liftedAt: Date.now(), liftedReason: reason.trim() || 'لغو توسط مدیر' } : s
      ),
    }));
  };

  /** پایان دوره‌ی آزمایشی فروشنده‌ی جدید و تعیین سقف سفارش روزانه برای x ماه */
  const handleReleaseProbation = (vendorId: string, maxPerDay: number, months: number) => {
    const now = Date.now();
    setRestrictions((prev) => {
      const st = prev.vendorStates[vendorId] || createVendorState(vendorId, 'probation');
      return {
        ...prev,
        vendorStates: {
          ...prev.vendorStates,
          [vendorId]: {
            ...st,
            probation: 'released',
            dailyCap:
              maxPerDay > 0 && months > 0
                ? { maxPerDay, months, startAt: now, untilAt: now + months * 30 * DAY_MS }
                : undefined,
            reviewedAt: new Date().toLocaleDateString('fa-IR'),
          },
        },
      };
    });
  };

  const handleSetVendorBuffer = (vendorId: string, percent: number | null, note?: string) => {
    setRestrictions((prev) => {
      const st = prev.vendorStates[vendorId] || createVendorState(vendorId, 'released');
      return {
        ...prev,
        vendorStates: {
          ...prev.vendorStates,
          [vendorId]: {
            ...st,
            bufferOverride: percent === null ? undefined : Math.max(0, Math.min(100, Math.round(percent))),
            bufferNote: percent === null ? undefined : note,
          },
        },
      };
    });
  };

  const handleApplyDelayPenalty = (
    orderId: string,
    daysLate: number,
    perDayAmount: number,
    amount: number,
    reason: string
  ) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || !order.assignedVendorId || amount <= 0 || daysLate <= 0) return false;
    if (restrictions.delayPenalties.some((p) => p.orderId === orderId && p.status === 'applied')) return false;
    const { date, time } = nowParts();
    const penalty: DelayPenalty = {
      id: `dpen-${Date.now()}`,
      orderId,
      orderNumber: order.orderNumber,
      vendorId: order.assignedVendorId,
      vendorName: order.assignedVendorName || '',
      customerName: order.customerName,
      daysLate,
      perDayAmount,
      amount,
      reason: reason.trim(),
      createdAt: `${date} - ${time}`,
      status: 'applied',
    };
    setRestrictions((prev) => ({ ...prev, delayPenalties: [penalty, ...prev.delayPenalties] }));
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              timeline: [
                ...o.timeline,
                {
                  id: `t-${Date.now()}`,
                  title: 'اعمال جریمه تأخیر در تحویل و نصب',
                  date,
                  time,
                  description: `به‌دلیل ${daysLate.toLocaleString('fa-IR')} روز تأخیر فروشگاه در تحویل و نصب، مبلغ ${amount.toLocaleString('fa-IR')} تومان جریمه در فاکتور شما اعلام و از مبلغ قابل پرداخت کسر شد.`,
                  actor: 'مدیر سامانه',
                  type: 'note',
                },
              ],
            }
          : o
      )
    );
    addNotification({
      type: 'new_message',
      title: `جریمه تأخیر فروشگاه در سفارش #${order.orderNumber}`,
      message: `${amount.toLocaleString('fa-IR')} تومان بابت ${daysLate.toLocaleString('fa-IR')} روز تأخیر در تحویل و نصب در فاکتور شما اعلام شد.`,
      targetRole: 'customer',
      orderId,
      orderNumber: order.orderNumber,
      linkTab: 'customer-portal',
    });
    addNotification({
      type: 'new_message',
      title: `جریمه تأخیر در تحویل و نصب (سفارش #${order.orderNumber})`,
      message: `مبلغ ${amount.toLocaleString('fa-IR')} تومان بابت ${daysLate.toLocaleString('fa-IR')} روز تأخیر روی فاکتور مشتری اعمال شد.`,
      targetRole: 'vendor',
      orderId,
      orderNumber: order.orderNumber,
      linkTab: 'vendor-portal',
    });
    return true;
  };

  const handleRevokeDelayPenalty = (penaltyId: string) => {
    const { date, time } = nowParts();
    setRestrictions((prev) => ({
      ...prev,
      delayPenalties: prev.delayPenalties.map((p) =>
        p.id === penaltyId ? { ...p, status: 'revoked', revokedAt: `${date} - ${time}` } : p
      ),
    }));
  };

  /** کسر جریمه از کیف پول فروشنده (می‌تواند منفی شود) و ثبت در ریز تراکنش‌ها */
  const handleApplyWalletPenalty = (
    vendorId: string,
    kind: WalletPenaltyKind,
    amount: number,
    description: string,
    orderId?: string
  ) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    if (!vendor || amount <= 0 || !description.trim()) return false;
    const order = orderId ? orders.find((o) => o.id === orderId) : undefined;
    const { date, time } = nowParts();
    const newBalance = (vendor.walletBalance || 0) - amount;
    const txId = `tx-pen-${Date.now()}`;
    const label = WALLET_PENALTY_LABELS[kind];
    const tx: WalletTransaction = {
      id: txId,
      vendorId,
      type: kind === 'no_invoice' ? 'penalty_no_invoice' : 'penalty_custom',
      amount: -amount,
      description: `${label}${order ? ` — سفارش #${order.orderNumber}` : ''}: ${description.trim()}`,
      date,
      time,
      orderId: order?.id,
      orderNumber: order?.orderNumber,
      balanceAfter: newBalance,
    };
    setVendors((prev) =>
      prev.map((v) =>
        v.id === vendorId ? { ...v, walletBalance: newBalance, transactions: [tx, ...(v.transactions || [])] } : v
      )
    );
    const penalty: WalletPenalty = {
      id: `wpen-${Date.now()}`,
      vendorId,
      vendorName: vendor.name,
      kind,
      amount,
      description: description.trim(),
      orderId: order?.id,
      orderNumber: order?.orderNumber,
      transactionId: txId,
      createdAt: `${date} - ${time}`,
    };
    setRestrictions((prev) => ({ ...prev, walletPenalties: [penalty, ...prev.walletPenalties] }));
    addNotification({
      type: 'new_message',
      title: `${label}: ${amount.toLocaleString('fa-IR')} تومان از کیف پول شما کسر شد`,
      message: `${description.trim()} — مانده کیف پول: ${newBalance.toLocaleString('fa-IR')} تومان. جزئیات در «ریز تراکنش‌ها» قابل مشاهده است.`,
      targetRole: 'vendor',
      linkTab: 'vendor-portal',
    });
    return true;
  };

  const handleRefundWalletPenalty = (penaltyId: string) => {
    const penalty = restrictions.walletPenalties.find((p) => p.id === penaltyId);
    if (!penalty || penalty.refundedAt) return;
    const vendor = vendors.find((v) => v.id === penalty.vendorId);
    if (!vendor) return;
    const { date, time } = nowParts();
    const newBalance = (vendor.walletBalance || 0) + penalty.amount;
    const txId = `tx-penref-${Date.now()}`;
    const tx: WalletTransaction = {
      id: txId,
      vendorId: vendor.id,
      type: 'penalty_refund',
      amount: penalty.amount,
      description: `بازگشت جریمه (${WALLET_PENALTY_LABELS[penalty.kind]}): ${penalty.description}`,
      date,
      time,
      orderId: penalty.orderId,
      orderNumber: penalty.orderNumber,
      balanceAfter: newBalance,
    };
    setVendors((prev) =>
      prev.map((v) =>
        v.id === vendor.id ? { ...v, walletBalance: newBalance, transactions: [tx, ...(v.transactions || [])] } : v
      )
    );
    setRestrictions((prev) => ({
      ...prev,
      walletPenalties: prev.walletPenalties.map((p) =>
        p.id === penaltyId ? { ...p, refundedAt: `${date} - ${time}`, refundTransactionId: txId } : p
      ),
    }));
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const handleToggleVendorVerification = (vendorId: string) => {
    setVendors(vendors.map((v) => (v.id === vendorId ? { ...v, isVerified: !v.isVerified } : v)));
  };

  const handleAddBlogPost = (postData: Omit<BlogPost, 'id'>) => {
    const newPost: BlogPost = {
      id: `post-${Date.now()}`,
      ...postData,
    };
    setBlogPosts([newPost, ...blogPosts]);
  };

  const handleDeleteBlogPost = (postId: string) => {
    setBlogPosts(blogPosts.filter((p) => p.id !== postId));
  };

  // Direct editing of Orders and Vendors from Admin
  const handleUpdateOrder = (updatedOrder: VisitRequest) => {
    setOrders(orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
  };

  const handleUpdateVendor = (updatedVendor: CurtainVendor) => {
    setVendors(vendors.map((v) => (v.id === updatedVendor.id ? updatedVendor : v)));
  };

  // CMS: Master Catalogs
  const handleSaveMasterCatalog = (catalogData: Omit<MasterFabricCatalog, 'id'>, existingId?: string) => {
    if (existingId) {
      setMasterCatalogs(masterCatalogs.map((c) => (c.id === existingId ? { ...catalogData, id: existingId } : c)));
    } else {
      const newCat: MasterFabricCatalog = {
        ...catalogData,
        id: `mc-${Date.now()}`,
      };
      setMasterCatalogs([newCat, ...masterCatalogs]);
    }
  };

  const handleDeleteMasterCatalog = (catalogId: string) => {
    setMasterCatalogs(masterCatalogs.filter((c) => c.id !== catalogId));
  };

  // CMS: Custom Pages
  const handleSaveCustomPage = (pageData: Omit<CustomPage, 'id'>, existingId?: string) => {
    const now = new Date().toLocaleDateString('fa-IR');
    if (existingId) {
      setCustomPages(customPages.map((p) => (p.id === existingId ? { ...pageData, id: existingId, updatedAt: now } : p)));
    } else {
      const newPage: CustomPage = {
        ...pageData,
        id: `page-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      setCustomPages([...customPages, newPage]);
    }
  };

  const handleDeleteCustomPage = (pageId: string) => {
    setCustomPages(customPages.filter((p) => p.id !== pageId));
  };

  // CMS: Theme & Styles Settings
  const handleUpdateThemeSettings = (updatedSettings: Partial<SiteThemeSettings>) => {
    setThemeSettings((prev) => ({
      ...prev,
      ...updatedSettings,
    }));
  };

  // Operational Cities & Provincial Phase Management
  const handleUpdateOperationalCities = (updatedCities: OperationalCity[]) => {
    setOperationalCities(updatedCities);
    addNotification({
      type: 'special_offer',
      title: 'بروزرسانی فازبندی استانی و فعال‌سازی شهرها',
      message: 'تنظیمات فازبندی، وضعیت دریافت سفارش و ثبت‌نام همکاران شهرها با موفقیت در سامانه ذخیره شد.',
    });
  };

  // Vendor Catalog Submission Moderation
  const handleModerateSubmission = (submissionId: string, status: 'approved' | 'rejected', feedback?: string) => {
    setVendorSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              status,
              moderatorFeedback: feedback,
              approvedAt: status === 'approved' ? new Date().toLocaleDateString('fa-IR') : undefined,
            }
          : s
      )
    );
    addNotification({
      type: 'order_approved',
      title: 'بررسی کالیته اختصاصی همکار',
      message: `وضعیت کالیته اختصاصی همکار به ${status === 'approved' ? 'تایید شده' : 'رد شده'} تغییر یافت.`,
    });
  };

  // Ticket Management Handlers
  const handleCreateTicket = (
    newTicketData: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'messages'>,
    initialMessageText: string
  ) => {
    const now = new Date();
    const persianDate = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(now);

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TCK-${randomNum}`;

    const createdTicket: SupportTicket = {
      ...newTicketData,
      id: `tck-${Date.now()}`,
      ticketNumber,
      // تیکت در وهله اول بره روی حالت در حال رسیدگی
      status: 'investigating',
      createdAt: persianDate,
      updatedAt: persianDate,
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderRole: 'customer',
          senderName: newTicketData.customerName,
          message: initialMessageText,
          attachments: newTicketData.attachments,
          timestamp: persianDate,
          createdAt: Date.now(),
        }
      ]
    };

    setTickets((prev) => [createdTicket, ...prev]);

    addNotification({
      type: 'new_request',
      title: newTicketData.type === 'complaint' ? 'شکایت شما در سامانه ثبت شد' : 'تیکت پشتیبانی ثبت گردید',
      message: `تیکت #${ticketNumber} با موضوع «${newTicketData.subject}» ثبت و در وضعیت «در حال رسیدگی کارشناسی» قرار گرفت.`,
    });
  };

  // Helper to auto-close answered tickets after 5 days without customer response
  const checkAndAutoCloseTickets = (ticketList: SupportTicket[]): { updatedList: SupportTicket[]; autoClosedCount: number } => {
    const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    let autoClosedCount = 0;

    const persianDate = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(now));

    const updatedList = ticketList.map((ticket) => {
      if (ticket.status === 'answered') {
        const lastMsg = ticket.messages[ticket.messages.length - 1];
        const isLastMsgStaff = lastMsg && lastMsg.senderRole !== 'customer';
        const replyTimestamp = ticket.lastExpertReplyTimestamp || (isLastMsgStaff ? lastMsg.createdAt : null);

        if (replyTimestamp && (now - replyTimestamp >= FIVE_DAYS_MS)) {
          autoClosedCount++;
          const autoCloseMsg: TicketMessage = {
            id: `msg-auto-${Date.now()}-${ticket.id}`,
            senderRole: 'support',
            senderName: 'سیستم اتوماسیون دراپینو',
            message: 'این تیکت به علت عدم پاسخ و پیگیری مشتری پس از گذشت ۵ روز کاری از آخرین پاسخ کارشناس، به صورت خودکار بسته و مختومه گردید.',
            timestamp: persianDate,
            createdAt: now,
          };

          return {
            ...ticket,
            status: 'closed' as TicketStatus,
            autoClosedAt: persianDate,
            autoClosedReason: 'عدم پاسخگویی مشتری پس از ۵ روز کاری از پاسخ کارشناس',
            updatedAt: persianDate,
            resolvedAt: persianDate,
            messages: [...ticket.messages, autoCloseMsg],
          };
        }
      }
      return ticket;
    });

    return { updatedList, autoClosedCount };
  };

  // Auto-close check on tickets load
  useEffect(() => {
    const { updatedList, autoClosedCount } = checkAndAutoCloseTickets(tickets);
    if (autoClosedCount > 0) {
      setTickets(updatedList);
    }
  }, []);

  const handleRunAutoCloseCheck = () => {
    const { updatedList, autoClosedCount } = checkAndAutoCloseTickets(tickets);
    if (autoClosedCount > 0) {
      setTickets(updatedList);
      addNotification({
        type: 'new_message',
        title: 'اتوماسیون بستن تیکت‌های ۵ روزه',
        message: `${autoClosedCount} تیکت به دلیل سپری شدن مهلت ۵ روزه مشتری به صورت خودکار بسته شد.`,
      });
    } else {
      addNotification({
        type: 'order_approved',
        title: 'بررسی اتوماسیون تیکت‌ها',
        message: 'هیچ تیکتی با مهلت منقضی شده بیش از ۵ روز یافت نشد.',
      });
    }
    return autoClosedCount;
  };

  const handleSimulateFiveDaysPassed = (ticketId: string) => {
    const SIX_DAYS_MS = 6 * 24 * 60 * 60 * 1000;
    const pastTime = Date.now() - SIX_DAYS_MS;
    const persianPastDate = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(pastTime));

    setTickets((prev) => {
      const simulated = prev.map((t) => {
        if (t.id === ticketId) {
          const updatedMessages = t.messages.map((m, idx) => {
            if (idx === t.messages.length - 1 && m.senderRole !== 'customer') {
              return { ...m, createdAt: pastTime, timestamp: persianPastDate };
            }
            return m;
          });
          return {
            ...t,
            status: 'answered' as TicketStatus,
            lastExpertReplyTimestamp: pastTime,
            messages: updatedMessages,
          };
        }
        return t;
      });

      const { updatedList } = checkAndAutoCloseTickets(simulated);
      return updatedList;
    });

    addNotification({
      type: 'new_message',
      title: 'شبیه‌سازی گذشت ۵ روز کاری',
      message: 'تاریخ پاسخ کارشناس به ۶ روز قبل تغییر یافت و تیکت بلافاصله توسط سیستم خودکار بسته شد.',
    });
  };

  const handleReplyTicket = (ticketId: string, messageText: string, attachments?: TicketAttachment[]) => {
    const now = new Date();
    const persianDate = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(now);

    const isAdmin = currentUser?.role === 'admin';

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const newMsg: TicketMessage = {
            id: `msg-${Date.now()}`,
            senderRole: isAdmin ? 'admin' : 'customer',
            senderName: currentUser?.name || 'کاربر',
            message: messageText,
            attachments,
            timestamp: persianDate,
            createdAt: Date.now(),
          };
          return {
            ...t,
            updatedAt: persianDate,
            lastExpertReplyTimestamp: isAdmin ? Date.now() : undefined,
            status: isAdmin ? 'answered' : (t.status === 'answered' ? 'investigating' : t.status),
            autoClosedAt: undefined,
            autoClosedReason: undefined,
            messages: [...t.messages, newMsg],
          };
        }
        return t;
      })
    );

    addNotification({
      type: 'new_message',
      title: isAdmin ? 'ثبت پاسخ کارشناس در تیکت' : 'ثبت پاسخ مشتری در تیکت',
      message: isAdmin 
        ? 'پاسخ شما به مشتری ثبت گردید. در صورت عدم پاسخ مشتری ظرف ۵ روز، تیکت خودکار بسته خواهد شد.'
        : 'پاسخ شما با موفقیت در تاریخچه تیکت درج شد و وضعیت تیکت به در حال رسیدگی تغییر یافت.',
    });
  };

  const handleUpdateTicketStatus = (ticketId: string, status: TicketStatus, unionNotes?: string, unionCaseNumber?: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status,
            unionArbitrationNotes: unionNotes !== undefined ? unionNotes : t.unionArbitrationNotes,
            unionCaseNumber: unionCaseNumber !== undefined ? unionCaseNumber : t.unionCaseNumber,
            resolvedAt: status === 'resolved' || status === 'closed' ? new Date().toLocaleDateString('fa-IR') : t.resolvedAt,
          };
        }
        return t;
      })
    );
  };

  // Buy Box Handlers
  const handleUpdateBuyBoxSettings = (newSettings: BuyBoxSettings) => {
    setBuyBoxSettings(newSettings);
    saveStored('autopardeh_buy_box_settings', newSettings);
    addNotification({
      type: 'special_offer',
      title: 'تنظیمات بای‌باکس ذخیره شد',
      message: 'تعرفه‌ها و سقف‌های ماهانه بای‌باکس با موفقیت در سامانه ذخیره گردید.',
    });
  };

  const handleCancelBuyBoxReservation = (reservationId: string, refundAmount?: number) => {
    setBuyBoxReservations((prev) => {
      const res = prev.find((r) => r.id === reservationId);
      if (!res) return prev;
      const updated = prev.map((r) =>
        r.id === reservationId ? { ...r, status: 'cancelled' as const } : r
      );
      saveStored('autopardeh_buy_box_reservations', updated);

      // Refund to vendor wallet if specified
      if (refundAmount && refundAmount > 0) {
        setVendors((vList) =>
          vList.map((v) => {
            if (v.id === res.vendorId) {
              const newBalance = (v.walletBalance || 0) + refundAmount;
              const newTx: WalletTransaction = {
                id: `tx-rf-${Date.now()}`,
                vendorId: v.id,
                type: 'refund',
                amount: refundAmount,
                description: `استرداد وجه رزرو بای‌باکس مورخ ${res.date} به علت لغو توسط مدیریت`,
                date: new Intl.DateTimeFormat('fa-IR').format(new Date()),
                time: new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
                balanceAfter: newBalance,
              };
              return {
                ...v,
                walletBalance: newBalance,
                transactions: [newTx, ...(v.transactions || [])],
              };
            }
            return v;
          })
        );
      }
      return updated;
    });

    addNotification({
      type: 'special_offer',
      title: 'لغو و استرداد وجه رزرو بای‌باکس',
      message: `رزرو لغو و وجه ${refundAmount ? refundAmount.toLocaleString('fa-IR') + ' تومان' : ''} به کیف پول فروشگاه مسترد شد.`,
    });
  };

  // Vendor Reserves a Day in Advance for Buy Box (Max 8 days per Persian solar month)
  const handleReserveBuyBox = (dateIso: string, datePersian: string, price: number): { success: boolean; message: string } => {
    const vendor = vendors.find((v) => v.id === currentVendor?.id);
    if (!vendor) return { success: false, message: 'اطلاعات فروشگاه یافت نشد.' };

    // 0. محدودیت‌های بای‌باکس (۷ روز پس از اولین شکار + آگهی فعال در نردبان و ویترین + عدم محرومیت)
    const buyBoxEligibility = getBuyBoxEligibility(restrictions, vendor);
    if (!buyBoxEligibility.eligible) {
      return { success: false, message: buyBoxEligibility.reasons.join(' ') };
    }

    // 1. Check if date already reserved by any vendor in this city
    const alreadyReserved = buyBoxReservations.find(
      (r) => r.dateIso === dateIso && r.vendorCity === vendor.city && r.status !== 'cancelled'
    );
    if (alreadyReserved) {
      if (alreadyReserved.vendorId === vendor.id) {
        return { success: false, message: 'این تاریخ قبلاً توسط خود شما رزرو شده است.' };
      }
      return { 
        success: false, 
        message: `جایگاه بای‌باکس این تاریخ در شهر ${vendor.city} قبلاً توسط فروشگاه «${alreadyReserved.vendorName}» رزرو شده است.` 
      };
    }

    // 2. Strict Solar Month 8-day limit check
    const pMonthPrefix = datePersian ? datePersian.split('/').slice(0, 2).join('/') : '';
    const todayIsoStr = new Date().toISOString().split('T')[0];
    const vendorReservationsThisMonth = buyBoxReservations.filter((r) => {
      if (r.vendorId !== vendor.id || r.status === 'cancelled') return false;
      const rMonth = r.date ? r.date.split('/').slice(0, 2).join('/') : '';
      const isSamePersianMonth = rMonth === pMonthPrefix;
      const isSameIsoMonth = r.dateIso ? r.dateIso.slice(0, 7) === dateIso.slice(0, 7) : false;
      return isSamePersianMonth || isSameIsoMonth;
    });

    const maxMonthlyDays = buyBoxSettings.maxMonthlyDaysPerVendor || 8;
    if (vendorReservationsThisMonth.length >= maxMonthlyDays) {
      return {
        success: false,
        message: `سقف مجاز ${maxMonthlyDays} روز رزرو در این ماه شمسی برای فروشگاه شما تکمیل شده است. طبق قوانین جهت جلوگیری از انحصار، هر فروشگاه مجاز به حداکثر ۸ روز در هر ماه شمسی می‌باشد.`
      };
    }

    // 3. Wallet balance check
    if ((vendor.walletBalance || 0) < price) {
      const deficit = price - (vendor.walletBalance || 0);
      return {
        success: false,
        message: `موجودی کیف پول شما کافی نیست. مبلغ مورد نیاز: ${price.toLocaleString('fa-IR')} تومان (کسری: ${deficit.toLocaleString('fa-IR')} تومان). لطفاً ابتدا کیف پول خود را شارژ فرمایید.`
      };
    }

    // 4. Deduct price from vendor wallet
    const now = new Date();
    const isToday = dateIso === todayIsoStr;
    const newBalance = (vendor.walletBalance || 0) - price;

    const newTx: WalletTransaction = {
      id: `tx-bb-${Date.now()}`,
      vendorId: vendor.id,
      amount: price,
      type: 'buy_box_reservation_fee',
      description: `پرداخت هزینه رزرو جایگاه اختصاصی بای‌باکس در شهر ${vendor.city} برای تاریخ ${datePersian}`,
      date: now.toLocaleDateString('fa-IR'),
      time: now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      balanceAfter: newBalance,
    };

    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendor.id) {
          return {
            ...v,
            walletBalance: newBalance,
            transactions: [newTx, ...(v.transactions || [])],
          };
        }
        return v;
      })
    );

    // 5. Create reservation record
    const newReservation: BuyBoxReservation = {
      id: `bbox-res-${Date.now()}`,
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorPhone: vendor.phone,
      vendorCity: vendor.city,
      coveredDistricts: vendor.coveredDistricts,
      vendorTier: vendor.tier,
      vendorRating: vendor.rating,
      date: datePersian,
      dateIso: dateIso,
      pricePaid: price,
      status: isToday ? 'active' : 'reserved',
      ordersReceivedCount: 0,
      ordersAcceptedCount: 0,
      ordersExpiredCount: 0,
      reservedAt: `${now.toLocaleDateString('fa-IR')} - ${now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
      paymentTransactionId: newTx.id,
      notes: `رزرو جایگاه اولویت ۵۰٪ سفارشات در ${vendor.city}`,
    };

    const updatedReservations = [newReservation, ...buyBoxReservations];
    setBuyBoxReservations(updatedReservations);
    saveStored('autopardeh_buy_box_reservations', updatedReservations);

    addNotification({
      type: 'order_approved',
      title: 'رزرو جایگاه بای‌باکس با موفقیت ثبت شد 👑',
      message: `جایگاه اولویت ۵۰٪ سفارشات برای تاریخ ${datePersian} با پرداخت ${price.toLocaleString('fa-IR')} تومان به نام فروشگاه «${vendor.name}» ثبت گردید.`,
      targetRole: 'vendor',
      linkTab: 'vendor-portal',
    });

    return {
      success: true,
      message: `جایگاه اولویت بای‌باکس برای تاریخ ${datePersian} با موفقیت رزرو گردید.`
    };
  };

  // Vendor Accepts Incoming Buy Box Order
  const handleAcceptBuyBoxOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const vendor = vendors.find((v) => v.id === currentVendor?.id);
    if (!vendor) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('fa-IR');
    const timeStr = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'assigned',
            assignedVendorId: vendor.id,
            assignedVendorName: vendor.name,
            assignedVendorPhone: vendor.phone,
            assignedVendorRating: vendor.rating,
            buyBoxStatus: 'accepted',
            timeline: [
              ...o.timeline,
              {
                id: `t-${Date.now()}`,
                title: `تایید و پذیرش سفارش توسط فروشگاه برگزیده بای‌باکس (${vendor.name})`,
                date: dateStr,
                time: timeStr,
                description: `فروشگاه دارای نشان برگزیده بای‌باکس سفارش را در مهلت اختصاصی تایید نمود و مسئولیت اعزام کارشناس و کالیته پارچه‌ها را برعهده گرفت.`,
                actor: 'فروشگاه',
                type: 'assignment',
              },
            ],
          };
        }
        return o;
      })
    );

    setRestrictions((prev) => recordVendorClaim(prev, vendor.id));

    // Update reservation stats
    setBuyBoxReservations((prev) =>
      prev.map((r) => {
        if (r.vendorId === vendor.id && (r.status === 'active' || r.status === 'reserved')) {
          return {
            ...r,
            ordersAcceptedCount: (r.ordersAcceptedCount || 0) + 1,
          };
        }
        return r;
      })
    );

    addNotification({
      type: 'order_assigned',
      title: `سفارش بای‌باکس #${order.orderNumber} با موفقیت پذیرفته شد`,
      message: `شما مسئولیت اعزام کارشناس به نشانی ${order.district} را برعهده گرفتید. جهت هماهنگی ساعت حضور با مشتری تماس حاصل فرمایید.`,
      targetRole: 'vendor',
      orderId,
      orderNumber: order.orderNumber,
      linkTab: 'vendor-portal',
      actionLabel: 'مشاهده سفارش',
    });

    addNotification({
      type: 'order_assigned',
      title: `فروشگاه برگزیده روز (${vendor.name}) سفارش شما را تایید کرد`,
      message: `کارشناس کالیته به زودی جهت هماهنگی ساعت مراجعه به منزل با شما تماس خواهد گرفت.`,
      targetRole: 'customer',
      orderId,
      orderNumber: order.orderNumber,
      linkTab: 'customer-portal',
    });
  };

  // Vendor Rejects Buy Box Order (Falls Back to Competitive Hunting Board)
  const handleRejectBuyBoxOrderToHunting = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('fa-IR');
    const timeStr = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'bidding',
            isBuyBoxOrder: false,
            buyBoxStatus: 'fallback_to_hunting',
            timeline: [
              ...o.timeline,
              {
                id: `t-${Date.now()}`,
                title: 'آزادسازی سفارش و انتقال به تابلوی عمومی شکار همکاران',
                date: dateStr,
                time: timeStr,
                description: 'سفارش از اولویت اختصاصی بای‌باکس خارج و جهت شکار در اختیار کلیه فروشگاه‌های منطقه قرار گرفت.',
                actor: 'سیستم',
                type: 'creation',
              },
            ],
          };
        }
        return o;
      })
    );

    addNotification({
      type: 'new_request',
      title: `سفارش جدید آماده شکار در ${order.district}`,
      message: `سفارش #${order.orderNumber} آزاد شد و هم‌اکنون برای تمام همکاران در تابلوی شکار در دسترس است.`,
      targetRole: 'vendor',
      orderId,
      orderNumber: order.orderNumber,
      linkTab: 'vendor-portal',
      actionLabel: 'شکار در تابلو',
    });
  };

  // Vendor Catalog Selection
  const handleUpdateVendorCatalogs = (vendorId: string, catalogIds: string[]) => {
    setVendors(vendors.map((v) => (v.id === vendorId ? { ...v, availableCatalogIds: catalogIds } : v)));
  };

  // Buy Box Timeout Watchdog: Check pending Buy Box orders every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setOrders((prevOrders) => {
        let hasChanges = false;
        const updated = prevOrders.map((o) => {
          if (
            o.isBuyBoxOrder &&
            o.buyBoxStatus === 'pending_vendor_acceptance' &&
            o.buyBoxExpiresAt &&
            now > o.buyBoxExpiresAt
          ) {
            hasChanges = true;
            return {
              ...o,
              isBuyBoxOrder: false,
              buyBoxStatus: 'expired_fallback' as const,
              status: 'bidding' as const,
              timeline: [
                ...o.timeline,
                {
                  id: `t-${Date.now()}`,
                  title: 'اتمام مهلت اختصاصی بای‌باکس (انتقال خودکار به تابلوی شکار عمومی)',
                  date: new Date().toLocaleDateString('fa-IR'),
                  time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
                  description: 'به دلیل سپری شدن مهلت ۱۵ دقیقه‌ای تایید توسط فروشگاه بای‌باکس، سفارش جهت شکار سرعتی به تابلوی عمومی منتقل شد.',
                  actor: 'سیستم',
                  type: 'creation' as const,
                },
              ],
            };
          }
          return o;
        });

        if (hasChanges) {
          addNotification({
            type: 'new_request',
            title: 'آزادسازی سفارش منقضی‌شده بای‌باکس در تابلو',
            message: 'سفارش به دلیل اتمام مهلت ۱۵ دقیقه‌ای تایید بای‌باکس، هم‌اکنون در تابلوی شکار عمومی در دسترس همکاران قرار گرفت.',
            targetRole: 'vendor',
            linkTab: 'vendor-portal',
          });
        }

        return hasChanges ? updated : prevOrders;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Estimator flow
  const handleProceedFromEstimator = (details: { width: number; height: number; style: string; fabricTier: string }) => {
    setEstimatorDetails(details);
    setIsBookingModalOpen(true);
  };

  const handleSelectStyleFromCatalog = (styleName: string) => {
    setEstimatorDetails({
      width: 4.0,
      height: 2.8,
      style: styleName,
      fabricTier: styleName,
    });
    setIsBookingModalOpen(true);
  };

  // Navigation Handlers
  const handleNavigateFromNotification = (tab: string, orderId?: string) => {
    setActiveTab(tab);
    if (tab === 'customer-portal') setCurrentRole('customer');
    if (tab === 'vendor-portal') setCurrentRole('vendor');
    if (tab === 'admin-portal') setCurrentRole('admin');

    if (orderId) {
      const ord = orders.find((o) => o.id === orderId);
      if (ord) {
        setChatOrder(ord);
      }
    }
  };

  const handleOpenChatForOrder = (orderId: string) => {
    const ord = orders.find((o) => o.id === orderId);
    if (ord) {
      setChatOrder(ord);
    }
  };

  const handleSelectCustomPage = (page: CustomPage) => {
    setSelectedCustomPage(page);
    setActiveTab(`page-${page.slug}`);
  };

  // Check if activeTab matches a custom page
  const activeCustomPage = customPages.find((p) => `page-${p.slug}` === activeTab) || selectedCustomPage;

  // Render Content based on activeTab
  const renderContent = () => {
    if (activeTab.startsWith('page-') && activeCustomPage) {
      return (
        <CustomPageView
          page={activeCustomPage}
          onBackToHome={() => setActiveTab('home')}
          onOpenBookingModal={() => setIsBookingModalOpen(true)}
          themeSettings={themeSettings}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <>
            <HeroSection
              onOpenBookingModal={() => setIsBookingModalOpen(true)}
              onOpenEstimatorModal={() => setIsEstimatorModalOpen(true)}
              onExploreCatalog={() => setActiveTab('catalog')}
              pendingBidsCount={pendingBidsCount}
              themeSettings={themeSettings}
            />
            <CityTopVendorsSection
              selectedCity={selectedCity}
              vendors={vendors.filter((v) => !getActiveSuspension(restrictions, v.id, 'all'))}
              onOpenBookingModal={() => setIsBookingModalOpen(true)}
              onOpenVendorProfile={(vendor) => setSelectedVendorForProfileModal(vendor)}
              onOpenVendorPortfolio={(vendor) => setSelectedVendorForPortfolioModal(vendor)}
              currentUser={currentUser}
            />
            <HowItWorks onStartBooking={() => setIsBookingModalOpen(true)} />
            <FabricCatalogSection onSelectStyleForHomeVisit={handleSelectStyleFromCatalog} />
            <BlogSection posts={blogPosts} />
          </>
        );

      case 'customer-portal':
        if (!currentUser) {
          return (
            <div className="py-16 max-w-xl mx-auto px-4 text-center">
              <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm text-right space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl mx-auto">
                  <User className="w-6 h-6" />
                </div>
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-black text-stone-900">ورود به پیگیری سفارشات مشتری</h2>
                  <p className="text-xs text-stone-600">
                    جهت مشاهده وضعیت لحظه‌ای اعزام کارشناس کالیته، بررسی فاکتورها و گفتگوی آنلاین، لطفاً وارد حساب خود شوید یا به رایگان ثبت‌نام نمایید.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={() => handleOpenAuthModal('login', 'customer')}
                    className="flex-1 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer text-center"
                  >
                    ورود به حساب مشتری
                  </button>
                  <button
                    onClick={() => handleOpenAuthModal('register', 'customer')}
                    className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors border border-stone-200 cursor-pointer text-center"
                  >
                    ثبت‌نام مشتری جدید
                  </button>
                </div>
              </div>
            </div>
          );
        }
        return (
          <CustomerPortal
            orders={orders}
            onOpenBookingModal={() => setIsBookingModalOpen(true)}
            onApproveInvoice={handleApproveInvoice}
            onRequestSecondStore={handleRequestSecondStore}
            onOpenChat={(order) => setChatOrder(order)}
            currentUser={currentUser}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
            onSubmitReview={handleSubmitReview}
            onMarkOrderInstalled={handleMarkOrderInstalled}
            onOpenVendorProfile={handleOpenVendorProfile}
            tickets={tickets}
            vendors={vendors}
            delayPenalties={restrictions.delayPenalties}
            onCreateTicket={handleCreateTicket}
            onReplyTicket={handleReplyTicket}
          />
        );

      case 'vendor-portal':
        if (!currentUser) {
          return (
            <div className="py-16 max-w-xl mx-auto px-4 text-center">
              <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm text-right space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xl mx-auto">
                  <Store className="w-6 h-6" />
                </div>
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-black text-stone-900">ورود به کارتابل همکاران و فروشگاه‌ها</h2>
                  <p className="text-xs text-stone-600">
                    جهت شکار سفارش‌های جدید در منطقه شما، اعزام کارشناس کالیته، صدور فاکتور رسمی و مدیریت کیف پول وارد شوید.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={() => handleOpenAuthModal('login', 'vendor')}
                    className="flex-1 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer text-center"
                  >
                    ورود همکار و فروشگاه
                  </button>
                  <button
                    onClick={() => handleOpenAuthModal('register', 'vendor')}
                    className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors border border-stone-200 cursor-pointer text-center"
                  >
                    ثبت‌نام فروشگاه جدید
                  </button>
                </div>
              </div>
            </div>
          );
        }
        if (!currentVendor) {
          return (
            <div className="py-16 max-w-xl mx-auto px-4 text-center space-y-4">
              <h2 className="text-xl font-bold">اطلاعات فروشگاه یافت نشد.</h2>
              <p>برای دسترسی به کارتابل، ابتدا فروشگاه خود را ثبت کنید.</p>
              <button
                onClick={() => handleOpenAuthModal('register', 'vendor')}
                className="px-6 py-3 bg-amber-700 text-white rounded-xl"
              >
                ثبت‌نام فروشگاه
              </button>
            </div>
          );
        }
        {
          const fullSuspension = getActiveSuspension(restrictions, currentVendor.id, 'all');
          if (fullSuspension) {
            return <VendorSuspendedScreen vendor={currentVendor} suspension={fullSuspension} />;
          }
        }
        return (
          <VendorPortal
            currentVendor={currentVendor}
            restrictionSummary={buildVendorRestrictionSummary(restrictions, currentVendor, orders)}
            vendorSheba={
              (currentVendor as { shebaNumber?: string }).shebaNumber ||
              users.find(
                (u) => u.role === 'vendor' && (u.vendorId === currentVendor.id || u.phone === currentVendor.phone)
              )?.shebaNumber
            }
            orders={orders}
            masterCatalogs={masterCatalogs}
            reviews={reviews}
            vendors={vendors}
            onClaimOrder={handleClaimOrder}
            onIssueInvoice={handleIssueInvoice}
            onOpenChat={(order) => setChatOrder(order)}
            onTopUpWallet={handleTopUpWallet}
            onUpdateVendorCatalogs={handleUpdateVendorCatalogs}
            onOpenRegisterModal={() => handleOpenAuthModal('register', 'vendor')}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
            onReplyToReview={handleVendorReplyReview}
            onVendorLadder={handleVendorLadder}
            onSimulate20Vendors={handleSimulate20Vendors}
            onUploadPortfolioItem={handleUploadPortfolioItem}
            onDeletePortfolioItem={handleDeletePortfolioItem}
            buyBoxSettings={buyBoxSettings}
            buyBoxReservations={buyBoxReservations}
            onReserveBuyBox={handleReserveBuyBox}
            onAcceptBuyBoxOrder={handleAcceptBuyBoxOrder}
            onRejectBuyBoxOrderToHunting={handleRejectBuyBoxOrderToHunting}
            operationalCities={operationalCities}
            onSwitchVendor={currentUser.role === 'admin' ? setCurrentVendorId : undefined}
          />
        );

      case 'admin-portal':
        if (currentUser?.role !== 'admin') {
          return (
            <div className="py-16 max-w-xl mx-auto px-4 text-center">
              <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm text-right space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-black text-stone-900">پنل مدیریت ارشد دراپینو</h2>
                  <p className="text-xs text-stone-600">
                    این پنل فقط در دسترس ناظران و مدیران ارشد اتحادیه و سامانه است. لطفاً با حساب مدیریت وارد شوید.
                  </p>
                </div>
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={() => handleOpenAuthModal('login', 'admin')}
                    className="px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
                  >
                    ورود با حساب مدیر سیستم
                  </button>
                </div>
              </div>
            </div>
          );
        }
        return (
          <AdminPortal
            orders={orders}
            vendors={vendors}
            blogPosts={blogPosts}
            masterCatalogs={masterCatalogs}
            customPages={customPages}
            themeSettings={themeSettings}
            operationalCities={operationalCities}
            vendorSubmissions={vendorSubmissions}
            tickets={tickets}
            buyBoxSettings={buyBoxSettings}
            buyBoxReservations={buyBoxReservations}
            onUpdateBuyBoxSettings={handleUpdateBuyBoxSettings}
            onCancelBuyBoxReservation={handleCancelBuyBoxReservation}
            discountCoupons={discountCoupons}
            onAddDiscountCoupon={handleAddDiscountCoupon}
            onUpdateDiscountCoupon={handleUpdateDiscountCoupon}
            onDeleteDiscountCoupon={handleDeleteDiscountCoupon}
            onToggleDiscountCoupon={handleToggleDiscountCoupon}
            onIssueAutomaticDiscountCoupon={handleIssueAutomaticDiscountCoupon}
            onReplyTicket={handleReplyTicket}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onRunAutoCloseCheck={handleRunAutoCloseCheck}
            onSimulateFiveDaysPassed={handleSimulateFiveDaysPassed}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onToggleVendorVerification={handleToggleVendorVerification}
            onAddBlogPost={handleAddBlogPost}
            onDeleteBlogPost={handleDeleteBlogPost}
            onUpdateOrder={handleUpdateOrder}
            onUpdateVendor={handleUpdateVendor}
            restrictions={restrictions}
            onUpdateRestrictionSettings={handleUpdateRestrictionSettings}
            onAddSuspension={handleAddSuspension}
            onLiftSuspension={handleLiftSuspension}
            onReleaseProbation={handleReleaseProbation}
            onSetVendorBuffer={handleSetVendorBuffer}
            onApplyDelayPenalty={handleApplyDelayPenalty}
            onRevokeDelayPenalty={handleRevokeDelayPenalty}
            onApplyWalletPenalty={handleApplyWalletPenalty}
            onRefundWalletPenalty={handleRefundWalletPenalty}
            onSaveMasterCatalog={handleSaveMasterCatalog}
            onDeleteMasterCatalog={handleDeleteMasterCatalog}
            onSaveCustomPage={handleSaveCustomPage}
            onDeleteCustomPage={handleDeleteCustomPage}
            onUpdateThemeSettings={handleUpdateThemeSettings}
            onPreviewCustomPage={handleSelectCustomPage}
            onUpdateOperationalCities={handleUpdateOperationalCities}
            onModerateSubmission={handleModerateSubmission}
            onModeratePortfolioItem={handleModeratePortfolioItem}
            users={users}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
            onUpdateUser={handleUpdateUser}
            onChangeUserPassword={handleChangeUserPassword}
            onOpenProjectDownload={() => setIsProjectDownloadModalOpen(true)}
            onApproveVendor={(vendorId, notes) => {
              setVendors((prev) =>
                prev.map((v) =>
                  v.id === vendorId
                    ? {
                        ...v,
                        isVerified: true,
                        verificationStatus: 'verified',
                        adminVerificationNotes: notes,
                      }
                    : v
                )
              );
              addNotification({
                type: 'order_approved',
                title: 'تایید پروانه و هویت همکار',
                message: 'پروانه کسب همکار استعلام و در سیستم فعال گردید.',
              });
            }}
            onRejectVendor={(vendorId, reason) => {
              setVendors((prev) =>
                prev.map((v) =>
                  v.id === vendorId
                    ? {
                        ...v,
                        isVerified: false,
                        verificationStatus: 'rejected',
                        rejectionReason: reason,
                      }
                    : v
                )
              );
              addNotification({
                type: 'special_offer',
                title: 'رد پرونده مدارک همکار',
                message: `مدارک پروانه با ذکر دلیل «${reason}» رد شد.`,
              });
            }}
          />
        );

      case 'vendor-landing':
        return (
          <VendorLandingPage
            onOpenVendorRegister={() => handleOpenAuthModal('register', 'vendor')}
            onOpenVendorLogin={() => handleOpenAuthModal('login', 'vendor')}
            operationalCities={operationalCities}
            themeSettings={themeSettings}
          />
        );

      case 'wholesaler-landing':
        return (
          <WholesalerLandingPage
            onOpenWholesalerRegister={() => handleOpenAuthModal('register', 'wholesaler')}
            onOpenWholesalerLogin={() => handleOpenAuthModal('login', 'wholesaler')}
            themeSettings={themeSettings}
          />
        );

      case 'wholesaler-portal':
        return (
          <WholesalerPortal
            wholesalerUser={
              currentUser?.role === 'wholesaler'
                ? currentUser
                : (users.find((u) => u.role === 'wholesaler') || currentUser || users[0])
            }
            fabrics={wholesaleFabrics}
            onAddFabric={handleAddWholesaleFabric}
            onUpdateFabric={handleUpdateWholesaleFabric}
            onDeleteFabric={handleDeleteWholesaleFabric}
            onToggleAvailability={handleToggleWholesaleAvailability}
            orders={wholesaleOrders}
            onUpdateOrderStatus={(orderId, status, trackingCode) => {
              setWholesaleOrders((prev) =>
                prev.map((o) =>
                  o.id === orderId
                    ? { ...o, status, trackingCode: trackingCode || o.trackingCode }
                    : o
                )
              );
              addNotification({
                type: 'order_approved',
                title: 'بروزرسانی وضعیت سفارش بنکداری',
                message: `سفارش عمده #${orderId} به وضعیت جدید تغییر یافت.`,
              });
            }}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
          />
        );

      case 'catalog':
        return (
          <div className="pt-6">
            <FabricCatalogSection onSelectStyleForHomeVisit={handleSelectStyleFromCatalog} />
          </div>
        );

      case 'feedback':
        return (
          <FeedbackPage
            currentUser={currentUser}
            feedback={feedbackItems}
            changelog={changelog}
            onSubmitFeedback={handleSubmitFeedback}
            onToggleVote={handleToggleFeedbackVote}
            onUpdateFeedback={handleUpdateFeedback}
            onDeleteFeedback={handleDeleteFeedback}
            onAddChangelog={handleAddChangelog}
            onUpdateChangelog={handleUpdateChangelog}
            onDeleteChangelog={handleDeleteChangelog}
            onPublishFixedToChangelog={handlePublishFixedToChangelog}
          />
        );

      case 'blog':
        return (
          <div className="pt-6">
            <BlogSection posts={blogPosts} />
          </div>
        );

      default:
        return (
          <div className="py-20 text-center text-stone-600">
            <p>صفحه مورد نظر یافت نشد.</p>
            <button
              onClick={() => setActiveTab('home')}
              className="mt-4 px-4 py-2 bg-amber-700 text-white rounded-xl text-xs font-bold"
            >
              بازگشت به صفحه اصلی
            </button>
          </div>
        );
    }
  };

  return (
    <div 
      className={`min-h-screen bg-[#FAFAF8] text-[#1C1917] flex flex-col font-['${themeSettings.fontFamily || 'Vazirmatn'}'] ${
        isMobilePreview ? 'p-4 sm:p-8 bg-stone-800' : 'pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0'
      }`}
    >
      
      {/* If Mobile Simulator is toggled */}
      {isMobilePreview ? (
        <div className="max-w-[420px] mx-auto w-full bg-white rounded-[40px] shadow-2xl border-[10px] border-stone-900 overflow-hidden flex flex-col relative h-[90vh]">
          
          {/* Simulated Mobile Status Bar */}
          <div className="bg-stone-900 text-white px-6 pt-2 pb-1 flex items-center justify-between text-[11px] shrink-0">
            <span>09:41</span>
            <div className="w-20 h-4 bg-black rounded-full mx-auto" />
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          {/* Mobile Frame Header */}
          <div ref={mobileContentRef} className="overflow-y-auto flex-1 pb-16">
            <Header
              currentRole={currentRole}
              currentUser={currentUser}
              onRoleChange={handleRoleChange}
              onOpenAuthModal={handleOpenAuthModal}
              onLogout={() => setIsLogoutConfirmOpen(true)}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onOpenBookingModal={() => setIsBookingModalOpen(true)}
              onOpenEstimatorModal={() => setIsEstimatorModalOpen(true)}
              pendingBidsCount={pendingBidsCount}
              unreadNotificationsCount={unreadCount}
              onOpenNotifications={() => setIsNotificationCenterOpen(true)}
              onOpenNotificationSettings={() => setIsNotificationSettingsOpen(true)}
              customPages={customPages}
              themeSettings={themeSettings}
              onSelectCustomPage={handleSelectCustomPage}
              selectedCity={selectedCity}
              onOpenCityModal={() => setIsCityModalOpen(true)}
            />

            {renderContent()}

            <Footer
              onOpenBookingModal={() => setIsBookingModalOpen(true)}
              onOpenEstimatorModal={() => setIsEstimatorModalOpen(true)}
              onNavigateTab={handleFooterNavigation}
              themeSettings={themeSettings}
              customPages={customPages}
              onSelectCustomPage={handleSelectCustomPage}
            />
          </div>

          {/* Mobile Bottom Dock Bar */}
          <MobileBottomNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            pendingBidsCount={pendingBidsCount}
            currentRole={currentRole}
            currentUser={currentUser}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
            onOpenAuthModal={(m) => handleOpenAuthModal(m || 'login', 'customer')}
          />

          {/* Exit Mobile Simulator floating pill */}
          <button
            onClick={() => setIsMobilePreview(false)}
            className="absolute top-12 left-3 bg-stone-900/80 hover:bg-stone-900 text-white text-[11px] px-2.5 py-1 rounded-full shadow-lg z-50 backdrop-blur-xs cursor-pointer"
          >
            خروج از شبیه‌ساز
          </button>
        </div>
      ) : (
        /* Regular Web / Responsive View */
        <>
          <Header
            currentRole={currentRole}
            currentUser={currentUser}
            onRoleChange={handleRoleChange}
            onOpenAuthModal={handleOpenAuthModal}
            onLogout={() => setIsLogoutConfirmOpen(true)}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onOpenBookingModal={() => setIsBookingModalOpen(true)}
            onOpenEstimatorModal={() => setIsEstimatorModalOpen(true)}
            pendingBidsCount={pendingBidsCount}
            unreadNotificationsCount={unreadCount}
            onOpenNotifications={() => setIsNotificationCenterOpen(true)}
            onOpenNotificationSettings={() => setIsNotificationSettingsOpen(true)}
            customPages={customPages}
            themeSettings={themeSettings}
            onSelectCustomPage={handleSelectCustomPage}
            selectedCity={selectedCity}
            onOpenCityModal={() => setIsCityModalOpen(true)}
          />

          <main className="flex-1">
            {renderContent()}
          </main>

          <Footer
            onOpenBookingModal={() => setIsBookingModalOpen(true)}
            onOpenEstimatorModal={() => setIsEstimatorModalOpen(true)}
            onNavigateTab={handleFooterNavigation}
            themeSettings={themeSettings}
            customPages={customPages}
            onSelectCustomPage={handleSelectCustomPage}
          />

          {/* Mobile bottom nav on small viewports */}
          <MobileBottomNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            pendingBidsCount={pendingBidsCount}
            currentRole={currentRole}
            currentUser={currentUser}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
            onOpenAuthModal={(m) => handleOpenAuthModal(m || 'login', 'customer')}
          />

        </>
      )}

      {/* Real-Time Floating Notification Toast */}
      <NotificationToast onNavigate={handleNavigateFromNotification} />

      {/* Notification Center Drawer */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        onOpenSettings={() => {
          setIsNotificationCenterOpen(false);
          setIsNotificationSettingsOpen(true);
        }}
        onNavigate={handleNavigateFromNotification}
        onOpenChatForOrder={handleOpenChatForOrder}
      />

      {/* Notification Customization Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationSettingsOpen}
        onClose={() => setIsNotificationSettingsOpen(false)}
      />

      {/* Order Chat Modal */}
      {chatOrder && (
        <OrderChatModal
          isOpen={Boolean(chatOrder)}
          onClose={() => setChatOrder(null)}
          order={chatOrder}
          currentUserRole={currentRole}
          currentUserName={
            currentRole === 'vendor' 
              ? (currentVendor?.name || currentUser?.name || 'فروشگاه')
              : currentRole === 'customer' 
                ? (currentUser?.name || chatOrder.customerName)
                : 'مدیر سامانه'
          }
        />
      )}

      {/* Request Booking Modal */}
      <NewRequestModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setEstimatorDetails(undefined);
        }}
        onSubmitRequest={handleCreateRequest}
        initialDetails={estimatorDetails}
        initialCity={selectedCity}
        currentUser={currentUser}
        operationalCities={operationalCities}
        buyBoxSettings={buyBoxSettings}
        buyBoxReservations={buyBoxReservations}
        vendors={vendors}
        discountCoupons={discountCoupons}
        onUseDiscountCoupon={handleUseDiscountCoupon}
      />

      {/* Price Estimator Modal */}
      <CurtainEstimatorModal
        isOpen={isEstimatorModalOpen}
        onClose={() => setIsEstimatorModalOpen(false)}
        onProceedToBooking={handleProceedFromEstimator}
      />

      {/* Auth Modal (Login / Role-Based Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        registeredUsers={users}
        initialRole={authModalRole}
        initialMode={authModalMode}
        operationalCities={operationalCities}
      />

      {/* Project Source Code & Files Download Modal */}
      <ProjectDownloadModal
        isOpen={isProjectDownloadModalOpen}
        onClose={() => setIsProjectDownloadModalOpen(false)}
        users={users}
        vendors={vendors}
        orders={orders}
        masterCatalogs={masterCatalogs}
        themeSettings={themeSettings}
        operationalCities={operationalCities}
        wholesaleFabrics={wholesaleFabrics}
      />

      {/* City Selection Modal (Opens on first load and via header button) */}
      <CitySelectModal
        isOpen={isCityModalOpen}
        onClose={() => {
          setStoredString('autopardeh_city_chosen', 'true');
          setIsCityModalOpen(false);
        }}
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
        operationalCities={operationalCities}
      />

      {/* Profile Edit Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onSaveProfile={handleSaveProfile}
        tickets={tickets}
        vendors={vendors}
        orders={orders}
        onCreateTicket={handleCreateTicket}
        onReplyTicket={handleReplyTicket}
      />

      {/* Vendor Profile & Reviews Modal */}
      <VendorProfileModal
        isOpen={Boolean(selectedVendorForProfileModal)}
        onClose={() => setSelectedVendorForProfileModal(null)}
        vendor={selectedVendorForProfileModal}
        reviews={reviews}
        onOpenBookingModal={() => {
          setSelectedVendorForProfileModal(null);
          setIsBookingModalOpen(true);
        }}
      />

      {/* Vendor Portfolio Showcase Modal */}
      <VendorPortfolioModal
        isOpen={Boolean(selectedVendorForPortfolioModal)}
        onClose={() => setSelectedVendorForPortfolioModal(null)}
        vendor={selectedVendorForPortfolioModal}
        onOpenBookingModal={() => {
          setSelectedVendorForPortfolioModal(null);
          setIsBookingModalOpen(true);
        }}
      />

      {/* Logout Confirmation Dialog */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-right shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-100">
            <h3 className="font-black text-stone-900 text-base mb-2">
              خروج از حساب کاربری
            </h3>
            <p className="text-xs text-stone-600 mb-6 leading-relaxed">
              آیا مطمئن هستید که می‌خواهید از حساب کاربری «{currentUser?.name}» خارج شوید؟ برای مشاهده و مدیریت سفارشات باید مجدداً وارد شوید.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                خروج قطعی
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <DrapinoMain />
    </NotificationProvider>
  );
}
