import type { Dictionary } from './de';

/**
 * Moroccan Darija in Arabic script — not Modern Standard Arabic.
 *
 * The difference matters for this audience. MSA is the language of official
 * forms and news broadcasts; a customer sending a parcel to their family in
 * Nador speaks Darija, and a site written in MSA reads as distant and
 * bureaucratic. So: «الطرود ديالك» rather than «طرودكم», «شحال» rather than «كم».
 *
 * Loan words that Moroccans genuinely use in daily speech are kept in the form
 * they are spoken (كولي for a parcel, ترونسبور for transport), because
 * replacing them with formal equivalents would be less comprehensible, not more.
 *
 * Written right to left — see `dir()` in ../index.ts.
 */
export const ar: Dictionary = {
  common: {
    calculatePrice: 'حسب الثمن',
    bookShipment: 'صيفط طرد',
    trackShipment: 'تبّع الطرد',
    bulkyQuote: 'طلب ثمن للحوايج الكبار',
    back: 'رجع',
    next: 'من بعد',
    submit: 'صيفط',
    save: 'سجّل',
    cancel: 'إلغاء',
    loading: 'كيتحمّل …',
    saving: 'كيتسجّل …',
    search: 'قلّب',
    from: 'من',
    to: 'إلى',
    weight: 'الوزن',
    pieces: 'عدد الطرود',
    pickup: 'الجّبد من الدار',
    yes: 'إيه',
    nope: 'لا',
    optional: 'اختياري',
    required: 'ضروري',
    status: 'الحالة',
    price: 'الثمن',
    total: 'المجموع',
    route: 'الطريق',
    date: 'التاريخ',
    close: 'سدّ',
    errorGeneric: 'وقع شي مشكل. عاود جرّب من فضلك.',
    skipToContent: 'تخطى إلى المحتوى',
  },
  nav: {
    home: 'الرئيسية',
    calculator: 'حساب الثمن',
    booking: 'صيفط',
    tracking: 'تتبّع الطرد',
    bulky: 'حوايج كبار',
    contact: 'اتصل بينا',
    login: 'دخول',
    logout: 'خروج',
    account: 'الحساب ديالي',
    admin: 'الإدارة',
    driver: 'الشوفير',
    mainNavigation: 'التنقّل الرئيسي',
    menu: 'حل القائمة',
  },
  home: {
    eyebrow: 'ألمانيا ↔ المغرب',
    headline: 'الطرود ديالك من ألمانيا للمغرب بكل أمان',
    subline:
      'كنجبدو الطرود، السّاكات والكرطونات ديالك من منطقة راين-ماين وكنوصلوهم لناضور والنواحي — برقم ديال الطرد ثابت، كود QR وتتبّع كامل للحالة.',
    pricePerKg: 'بداية من 2 € للكيلو',
    minimumPrice: 'أقل ثمن 20 €',
    pickupPrice: 'الجّبد من الدار +10 €',
    bulkyPrice: 'الحوايج الكبار: ثمن خاص',
    whyTitle: 'علاش {brand}؟',
    whySubtitle: 'خدمة قريبة منك، واضحة، وبلا مصاريف مخبّية.',
  },
  calculator: {
    title: 'حسب الثمن',
    subtitle: 'الثمن ديالك ف 30 ثانية — بلا ما تسجّل.',
    direction: 'الاتجاه',
    originCity: 'مدينة الانطلاق',
    destinationCity: 'مدينة الوصول',
    weightLabel: 'الوزن بالكيلو',
    pickupLabel: 'جبدو ليا من الدار',
    pickupHint: 'كنجيو نجبدو الطرد عندك (+10 €). ولا تقدر تجيبو لينا بنفسك.',
    typeLabel: 'نوع الطرد',
    typeStandard: 'طرد عادي',
    typeStandardHint: 'كوليات، ساكات، كرطونات',
    typeDocuments: 'وثائق',
    typeDocumentsHint: 'باسبورات، عقود، وثائق رسمية',
    typeBulky: 'كبير / ثقيل',
    typeBulkyHint: 'موبيليا، ماكينات، بيسكليط …',
    yourPrice: 'الثمن ديالك',
    breakdownWeight: 'النقل ({weight})',
    breakdownMinimum: 'أقل ثمن',
    breakdownDocuments: 'وثائق (ثمن ثابت)',
    documentsExplain:
      'ثمن ثابت 10 € حتى {max} كيلو — مهما كان الوزن. للباسبورات، العقود والوكالات. إلا كان أثقل ولا كثر من جوج ظروف، صيفطو بحال طرد عادي.',
    breakdownPickup: 'الجّبد من الدار',
    bulkyNotice: 'خاصك ثمن خاص',
    bulkyExplain:
      'للحوايج الكبار ولا الثقال كنعطيوك ثمن خاص. صيفط لينا تصاور والقياسات — غادي توصلك العرض عادةً ف أقل من 24 ساعة.',
  },
  booking: {
    title: 'صيفط طرد',
    stepShipment: 'الطرد',
    stepSender: 'المُرسِل',
    stepRecipient: 'المُرسَل إليه',
    stepConfirm: 'التأكيد',
    confirmDetails: 'كنأكّد بلي المعلومات اللي كتبت صحيحة.',
    confirmProhibited: 'كنأكّد بلي الطرد ديالي ما فيه حتى شي حاجة ممنوعة ولا غير مصرّح بيها.',
    confirmTerms: 'كنوافق على شروط الإرسال وعلى سياسة الخصوصية.',
    successTitle: 'الطرد ديالك تسجّل.',
    successHint: 'كتب رقم الطرد ديالك — بيه تقدر تشوف الحالة ف أي وقت.',
    shareText: 'الطرد ديالي {number} تسجّل. تبّعو من هنا: {url}',
  },
  tracking: {
    title: 'تتبّع الطرد',
    subtitle: 'دخّل رقم الطرد باش تشوف الحالة ديالو دابا.',
    placeholder: 'مثلاً ',
    notFound: 'ما لقينا والو بهاد الرقم. عاود شوف الرقم وجرّب من جديد.',
    lastUpdate: 'آخر تحديث',
    history: 'المراحل',
    sealed: 'مختوم برقم الأمان {seal}',
    privacyNote: 'حفاظاً على الخصوصية، ما كنبيّنوش هنا العناوين، الأرقام ولا الأثمنة.',
  },
  bulky: {
    title: 'طلب للحوايج الكبار',
    subtitle: 'صيفط تصاور وعطينا القياسات — كنجاوبوك بثمن ثابت.',
    successTitle: 'كنشوفو ف الطلب ديالك.',
    successHint: 'غادي توصلك العرض ديالك عادةً ف أقل من 24 ساعة.',
  },
  footer: {
    legal: 'معلومات قانونية',
    company: 'الشركة',
    service: 'الخدمات',
    imprint: 'معلومات الناشر',
    privacy: 'الخصوصية',
    terms: 'الشروط العامة',
    shippingTerms: 'شروط الإرسال',
    prohibited: 'الحوايج الممنوعة',
    liability: 'المسؤولية والتأمين',
  },
};
