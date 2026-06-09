/* ============================================================
   Mock data — categories + Kuwait wedding vendors (bilingual)
   ============================================================ */
(function () {
  // Kuwait areas / governorates
  const AREAS = [
    { en: "Kuwait City", ar: "مدينة الكويت" },
    { en: "Salmiya", ar: "السالمية" },
    { en: "Hawalli", ar: "حولي" },
    { en: "Jabriya", ar: "الجابرية" },
    { en: "Mishref", ar: "مشرف" },
    { en: "Bayan", ar: "بيان" },
    { en: "Salwa", ar: "سلوى" },
    { en: "Mangaf", ar: "المنقف" },
    { en: "Sabah Al-Salem", ar: "صباح السالم" },
    { en: "Fintas", ar: "الفنطاس" },
  ];

  const CATEGORIES = [
    { id: "halls",        icon: "🏛️", glyph: "🏛️", name: { en: "Wedding Halls",   ar: "قاعات الأفراح" }, unit: "common.perEvent" },
    { id: "salons",       icon: "💇‍♀️", glyph: "💇", name: { en: "Beauty Salons",   ar: "صالونات التجميل" }, unit: "common.perEvent" },
    { id: "makeup",       icon: "💄", glyph: "💄", name: { en: "Makeup Artists",  ar: "خبيرات المكياج" }, unit: "common.perEvent" },
    { id: "florists",     icon: "🌷", glyph: "🌷", name: { en: "Florists",        ar: "محلات الورود" }, unit: "common.perEvent" },
    { id: "photographers",icon: "📷", glyph: "📷", name: { en: "Photographers",   ar: "المصوّرون" }, unit: "common.perHour" },
    { id: "decorators",   icon: "✨", glyph: "✨", name: { en: "Decorators",      ar: "تنسيق وديكور" }, unit: "common.perEvent" },
    { id: "catering",     icon: "🍽️", glyph: "🍽️", name: { en: "Catering",        ar: "تموين وضيافة" }, unit: "common.perPerson" },
    { id: "dresses",      icon: "👗", glyph: "👗", name: { en: "Bridal Dresses",  ar: "فساتين الزفاف" }, unit: "common.perEvent" },
    { id: "invitations",  icon: "💌", glyph: "💌", name: { en: "Invitations",     ar: "بطاقات الدعوة" }, unit: "common.perEvent" },
    { id: "cars",         icon: "🚘", glyph: "🚘", name: { en: "Wedding Cars",    ar: "سيارات الزفاف" }, unit: "common.perDay" },
  ];

  // gradient palettes per category for placeholder images
  const PALETTES = {
    halls:        ["#E9D9CF", "#C99BA0"],
    salons:       ["#F3E7E1", "#C98B8B"],
    makeup:       ["#F0DCE0", "#C99BA0"],
    florists:     ["#E7E1D6", "#C9A96A"],
    photographers:["#DDD3CB", "#B9A394"],
    decorators:   ["#EFE3D4", "#E2CFA3"],
    catering:     ["#EDE2D6", "#DCC7BA"],
    dresses:      ["#F5EEE6", "#DCC7BA"],
    invitations:  ["#F0E8DF", "#C9A96A"],
    cars:         ["#E3DAD2", "#B9A394"],
  };

  // helper to build a vendor
  let _id = 0;
  function biz(category, name, area, priceFrom, rating, reviews, opts) {
    _id++;
    opts = opts || {};
    const slug = "v" + String(_id).padStart(2, "0");
    return {
      id: slug,
      category,
      name,
      area,
      priceFrom,
      rating,
      reviews,
      phone: opts.phone || "+965 9" + (700 + _id) + " " + (1000 + _id * 7),
      whatsapp: opts.whatsapp || "+965 9" + (700 + _id) + " " + (1000 + _id * 7),
      instagram: opts.instagram || ("g_" + category + "_" + _id),
      snapchat: opts.snapchat || ("g_" + category + _id),
      featured: !!opts.featured,
      desc: opts.desc || { en: "", ar: "" },
      features: opts.features || [],
      imgCount: opts.imgCount || 3,
    };
  }

  const F = (en, ar) => ({ en, ar });

  const VENDORS = [
    // ---------------- HALLS ----------------
    biz("halls", F("Dar Al-Yasmine Ballroom", "قاعة دار الياسمين"), AREAS[0], 850, 4.9, 214, {
      featured: true,
      desc: F(
        "An opulent ballroom in the heart of Kuwait City with crystal chandeliers, a grand staircase, and seating for up to 600 guests. Dar Al-Yasmine blends timeless elegance with modern comfort for an unforgettable celebration.",
        "قاعة فخمة في قلب مدينة الكويت بثريات كريستالية ودرج رئيسي مهيب وتتسع حتى 600 ضيف. تجمع دار الياسمين بين الأناقة الخالدة والراحة العصرية لاحتفال لا يُنسى."
      ),
      features: [F("Up to 600 guests", "حتى 600 ضيف"), F("Crystal chandeliers", "ثريات كريستال"), F("Bridal suite", "جناح للعروس"), F("Valet parking", "خدمة صف السيارات"), F("In-house catering", "تموين داخلي"), F("Stage & runway", "مسرح وممشى")],
    }),
    biz("halls", F("Lavender Grand Hall", "قاعة لافندر الكبرى"), AREAS[4], 1200, 4.8, 167, {
      featured: true,
      desc: F(
        "A modern luxury venue in Mishref featuring floor-to-ceiling windows, customizable LED lighting, and a sweeping marble floor designed for grand entrances.",
        "صالة فاخرة عصرية في مشرف بنوافذ ممتدة من الأرض للسقف وإضاءة LED قابلة للتخصيص وأرضية رخامية واسعة مصممة للدخول المهيب."
      ),
      features: [F("Up to 450 guests", "حتى 450 ضيف"), F("LED lighting", "إضاءة LED"), F("Marble floors", "أرضيات رخام"), F("Bridal suite", "جناح للعروس"), F("Sound system", "نظام صوتي"), F("Private entrance", "مدخل خاص")],
    }),
    biz("halls", F("Pearl of the Gulf Venue", "قاعة لؤلؤة الخليج"), AREAS[1], 700, 4.7, 132, {
      desc: F(
        "A refined seaside-inspired hall in Salmiya with soft pearl tones, intimate lounge areas, and a dedicated photography corner.",
        "قاعة راقية مستوحاة من البحر في السالمية بألوان لؤلؤية ناعمة ومناطق جلوس حميمة وركن مخصص للتصوير."
      ),
      features: [F("Up to 300 guests", "حتى 300 ضيف"), F("Sea-view lounge", "صالة بإطلالة بحرية"), F("Photo corner", "ركن تصوير"), F("Parking", "موقف سيارات"), F("Catering options", "خيارات تموين")],
    }),
    biz("halls", F("Rawda Royal Hall", "قاعة الروضة الملكية"), AREAS[2], 600, 4.6, 98, {
      desc: F(
        "A classic and welcoming hall in Hawalli, perfect for medium-sized weddings, with warm gold accents and attentive service.",
        "قاعة كلاسيكية ودودة في حولي مثالية للأعراس المتوسطة بلمسات ذهبية دافئة وخدمة مميزة."
      ),
      features: [F("Up to 250 guests", "حتى 250 ضيف"), F("Gold decor", "ديكور ذهبي"), F("Bridal room", "غرفة للعروس"), F("Parking", "موقف سيارات")],
    }),

    // ---------------- SALONS ----------------
    biz("salons", F("Maison Blanche Beauty", "صالون ميزون بلانش"), AREAS[1], 180, 4.9, 342, {
      featured: true,
      desc: F(
        "Salmiya's premier bridal salon offering hair styling, skincare, and full glam packages in a serene, luxurious setting.",
        "أرقى صالون عرائس في السالمية يقدّم تصفيف الشعر والعناية بالبشرة وباقات التجميل الكاملة في أجواء فاخرة هادئة."
      ),
      features: [F("Bridal hair", "تسريحة العروس"), F("Skincare", "عناية بالبشرة"), F("Private suites", "أجنحة خاصة"), F("Trial session", "جلسة تجريبية")],
    }),
    biz("salons", F("Rose Quartz Salon", "صالون روز كوارتز"), AREAS[3], 150, 4.7, 211, {
      desc: F(
        "A chic Jabriya salon known for flawless updos, nail artistry, and a calming pre-wedding pampering experience.",
        "صالون أنيق في الجابرية مشهور بتسريحات راقية وفن الأظافر وتجربة تدليل مميزة قبل الزفاف."
      ),
      features: [F("Updos & styling", "تسريحات راقية"), F("Nail art", "فن الأظافر"), F("Spa add-ons", "خدمات سبا"), F("Group bookings", "حجوزات جماعية")],
    }),
    biz("salons", F("Velvet & Gold Studio", "استوديو فيلفيت آند غولد"), AREAS[5], 220, 4.8, 178, {
      featured: true,
      desc: F(
        "An exclusive Bayan beauty studio delivering red-carpet glam, premium hair extensions, and a curated bridal-party experience.",
        "استوديو تجميل حصري في بيان يقدّم إطلالة السجادة الحمراء وإكسسوارات الشعر الفاخرة وتجربة منسّقة لوصيفات العروس."
      ),
      features: [F("Red-carpet glam", "إطلالة فاخرة"), F("Extensions", "وصلات شعر"), F("Bridal party", "وصيفات العروس"), F("VIP lounge", "صالة كبار الزوار")],
    }),

    // ---------------- MAKEUP ----------------
    biz("makeup", F("Noor Artistry", "نور للمكياج"), AREAS[0], 250, 5.0, 401, {
      featured: true,
      desc: F(
        "Celebrity makeup artist Noor specializes in soft glam and luminous bridal looks that last from ceremony to last dance.",
        "خبيرة المكياج نور متخصصة في الإطلالات الناعمة المتألقة التي تدوم من بداية الحفل حتى آخر رقصة."
      ),
      features: [F("Soft glam", "مكياج ناعم"), F("Long-wear", "ثبات طويل"), F("Lashes included", "رموش ضمن الباقة"), F("Home service", "خدمة منزلية")],
    }),
    biz("makeup", F("Glow by Dana", "جلو باي دانا"), AREAS[2], 200, 4.8, 256, {
      desc: F(
        "Dana creates radiant, natural-glow bridal makeup tailored to each bride's features and chosen palette.",
        "تبدع دانا مكياج عرائس مشرق بإطلالة طبيعية مصمّم خصيصاً لملامح كل عروس واللون الذي تختاره."
      ),
      features: [F("Natural glow", "إطلالة طبيعية"), F("Custom palette", "ألوان مخصصة"), F("Trial available", "جلسة تجريبية")],
    }),

    // ---------------- FLORISTS ----------------
    biz("florists", F("Bloom & Blush Atelier", "أتيليه بلوم آند بلاش"), AREAS[4], 120, 4.9, 188, {
      featured: true,
      desc: F(
        "Bespoke floral design studio creating cascading bouquets, ceremony arches, and lush centerpieces in soft romantic palettes.",
        "استوديو تصميم زهور مخصص يبتكر باقات منسدلة وأقواس حفلات وتنسيقات وسطية فاخرة بألوان رومانسية ناعمة."
      ),
      features: [F("Bridal bouquet", "باقة العروس"), F("Ceremony arch", "قوس الزفاف"), F("Centerpieces", "تنسيقات الطاولات"), F("Fresh imported flowers", "ورود مستوردة طازجة")],
    }),
    biz("florists", F("Jardin Royale", "جاردان روايال"), AREAS[0], 95, 4.6, 124, {
      desc: F(
        "A beloved Kuwait City florist offering elegant arrangements, fragrant garlands, and same-day delivery across Kuwait.",
        "محل ورود محبوب في مدينة الكويت يقدّم تنسيقات أنيقة وأكاليل عطرة وتوصيل في نفس اليوم لجميع مناطق الكويت."
      ),
      features: [F("Elegant arrangements", "تنسيقات أنيقة"), F("Garlands", "أكاليل"), F("Same-day delivery", "توصيل بنفس اليوم")],
    }),
    biz("florists", F("Petale Boutique", "بوتيك بيتال"), AREAS[6], 140, 4.8, 96, {
      desc: F(
        "Luxury Salwa flower boutique known for dramatic installations and signature blush-and-gold wedding designs.",
        "بوتيك ورود فاخر في سلوى مشهور بالتنسيقات المبهرة وتصاميم الزفاف المميزة بالوردي والذهبي."
      ),
      features: [F("Floral installations", "تركيبات زهور"), F("Blush & gold theme", "ثيم وردي وذهبي"), F("Custom design", "تصميم مخصص")],
    }),

    // ---------------- PHOTOGRAPHERS ----------------
    biz("photographers", F("Lumière Photography", "لوميير للتصوير"), AREAS[1], 180, 4.9, 273, {
      featured: true,
      desc: F(
        "Award-winning wedding photography capturing candid emotion and fine-art portraits, with cinematic film add-ons.",
        "تصوير أعراس حائز على جوائز يلتقط المشاعر العفوية والبورتريهات الفنية مع خيارات أفلام سينمائية."
      ),
      features: [F("Full-day coverage", "تغطية يوم كامل"), F("Fine-art album", "ألبوم فني"), F("Cinematic film", "فيلم سينمائي"), F("2 photographers", "مصوّران")],
    }),
    biz("photographers", F("Studio Hanan", "استوديو حنان"), AREAS[2], 140, 4.8, 199, {
      desc: F(
        "A women-led Hawalli studio offering comfortable, private bridal sessions and timeless editorial coverage.",
        "استوديو نسائي في حولي يقدّم جلسات عرائس خاصة ومريحة وتغطية أنيقة خالدة."
      ),
      features: [F("Women-led team", "فريق نسائي"), F("Private sessions", "جلسات خاصة"), F("Editorial style", "أسلوب راقٍ"), F("Retouching", "تنقيح احترافي")],
    }),
    biz("photographers", F("Golden Hour Films", "جولدن أور فيلمز"), AREAS[5], 220, 4.7, 141, {
      desc: F(
        "Cinematic storytellers specializing in luxury wedding films, drone footage, and same-night highlight reels.",
        "روّاد التصوير السينمائي متخصصون في أفلام الأعراس الفاخرة ولقطات الدرون ومقاطع الملخّص في نفس الليلة."
      ),
      features: [F("Cinematic film", "فيلم سينمائي"), F("Drone footage", "تصوير جوي"), F("Same-night reel", "ملخّص ليلي"), F("4K quality", "جودة 4K")],
    }),

    // ---------------- DECORATORS ----------------
    biz("decorators", F("Atelier Lumen Events", "أتيليه لومِن للمناسبات"), AREAS[4], 900, 4.9, 156, {
      featured: true,
      desc: F(
        "Full-service luxury event design — from concept and stage to lighting and floral installations — for truly bespoke weddings.",
        "تصميم مناسبات فاخر متكامل — من الفكرة والمسرح إلى الإضاءة وتركيبات الزهور — لأعراس مخصصة بالكامل."
      ),
      features: [F("Concept design", "تصميم المفهوم"), F("Stage & backdrop", "مسرح وخلفية"), F("Lighting design", "تصميم إضاءة"), F("Full setup", "تجهيز كامل")],
    }),
    biz("decorators", F("Soirée Design House", "سواريه لتصميم المناسبات"), AREAS[0], 750, 4.7, 112, {
      desc: F(
        "Elegant, on-trend wedding styling with curated rentals, draping, and statement centerpieces.",
        "تنسيق أعراس أنيق ومواكب للموضة مع تأجير منتقى وتنسيق أقمشة وقطع وسطية لافتة."
      ),
      features: [F("Draping", "تنسيق أقمشة"), F("Premium rentals", "تأجير فاخر"), F("Centerpieces", "قطع وسطية"), F("Theme styling", "تنسيق الثيم")],
    }),
    biz("decorators", F("Maison Décor", "ميزون ديكور"), AREAS[3], 820, 4.8, 88, {
      desc: F(
        "Boutique Jabriya decorator creating romantic, garden-inspired settings with abundant florals and candlelight.",
        "ديكور بوتيك في الجابرية يبتكر أجواء رومانسية مستوحاة من الحدائق بالورود الوفيرة وضوء الشموع."
      ),
      features: [F("Garden theme", "ثيم الحديقة"), F("Candlelight", "إضاءة شموع"), F("Lush florals", "ورود وفيرة"), F("Custom setups", "تجهيزات مخصصة")],
    }),

    // ---------------- CATERING ----------------
    biz("catering", F("Saffron Royal Catering", "سفرون رويال للتموين"), AREAS[0], 12, 4.9, 234, {
      featured: true,
      desc: F(
        "Exquisite Kuwaiti and international menus, live cooking stations, and elegant plated service for weddings of any size.",
        "قوائم كويتية وعالمية راقية ومحطات طهي حية وخدمة أطباق أنيقة لأعراس بمختلف الأحجام."
      ),
      features: [F("Kuwaiti & global menu", "قائمة كويتية وعالمية"), F("Live stations", "محطات حية"), F("Plated service", "خدمة أطباق"), F("Dessert table", "طاولة حلويات")],
    }),
    biz("catering", F("La Table Kuwait", "لا تابل الكويت"), AREAS[2], 9, 4.6, 167, {
      desc: F(
        "Modern catering with beautifully presented grazing tables, canapés, and customizable wedding menus.",
        "تموين عصري بطاولات تقديم جميلة ومقبلات وقوائم زفاف قابلة للتخصيص."
      ),
      features: [F("Grazing tables", "طاولات تقديم"), F("Canapés", "مقبلات"), F("Custom menu", "قائمة مخصصة")],
    }),
    biz("catering", F("Dewaniya Delights", "ديوانية ديلايتس"), AREAS[7], 8, 4.7, 143, {
      desc: F(
        "Authentic Kuwaiti hospitality with traditional machboos, sweets, and warm gahwa service for your celebration.",
        "ضيافة كويتية أصيلة بالمجبوس التقليدي والحلويات وخدمة القهوة الدافئة لاحتفالكِ."
      ),
      features: [F("Traditional dishes", "أطباق تقليدية"), F("Arabic sweets", "حلويات عربية"), F("Gahwa service", "خدمة القهوة")],
    }),

    // ---------------- DRESSES ----------------
    biz("dresses", F("Atelier Blanc Bridal", "أتيليه بلان للعرائس"), AREAS[1], 650, 4.9, 198, {
      featured: true,
      desc: F(
        "Couture bridal house offering bespoke gowns, European designer collections, and expert tailoring in Salmiya.",
        "دار أزياء عرائس راقية تقدّم فساتين مخصصة ومجموعات مصممين أوروبيين وخياطة احترافية في السالمية."
      ),
      features: [F("Bespoke gowns", "فساتين مخصصة"), F("Designer collections", "مجموعات مصممين"), F("Expert tailoring", "خياطة احترافية"), F("Private fittings", "قياسات خاصة")],
    }),
    biz("dresses", F("Soft Lace Couture", "سوفت لايس كوتور"), AREAS[4], 480, 4.7, 121, {
      desc: F(
        "Romantic lace and minimalist silhouettes for the modern bride, with both rentals and made-to-order gowns.",
        "دانتيل رومانسي وقصّات بسيطة للعروس العصرية مع خيارات الإيجار والتفصيل حسب الطلب."
      ),
      features: [F("Lace designs", "تصاميم دانتيل"), F("Rental option", "خيار الإيجار"), F("Made-to-order", "تفصيل حسب الطلب")],
    }),

    // ---------------- INVITATIONS ----------------
    biz("invitations", F("Inked in Gold", "إنكد إن غولد"), AREAS[0], 3, 4.8, 154, {
      featured: true,
      desc: F(
        "Luxury foil-pressed and laser-cut wedding invitations, custom calligraphy, and matching day-of stationery.",
        "بطاقات دعوة فاخرة بطباعة ذهبية وقص ليزر وخط عربي مخصص ومطبوعات متناسقة ليوم الزفاف."
      ),
      features: [F("Gold foil", "طباعة ذهبية"), F("Laser cut", "قص ليزر"), F("Calligraphy", "خط عربي"), F("Digital invites", "دعوات رقمية")],
    }),
    biz("invitations", F("Petal Press Studio", "بيتال برِس"), AREAS[3], 2, 4.6, 87, {
      desc: F(
        "Watercolor and floral-themed invitation suites, both printed and digital, designed to match your wedding palette.",
        "مجموعات دعوات بثيم الألوان المائية والزهور، مطبوعة ورقمية، مصممة لتناسب ألوان زفافكِ."
      ),
      features: [F("Watercolor design", "تصميم ألوان مائية"), F("Printed & digital", "مطبوع ورقمي"), F("Palette matching", "تناسق الألوان")],
    }),

    // ---------------- CARS ----------------
    biz("cars", F("Royale Wedding Cars", "رويال لسيارات الأفراح"), AREAS[0], 60, 4.8, 132, {
      featured: true,
      desc: F(
        "Chauffeur-driven luxury and classic cars — Rolls-Royce, Bentley, and vintage convertibles — beautifully decorated for your day.",
        "سيارات فاخرة وكلاسيكية مع سائق — رولز رويس وبنتلي وسيارات كشف قديمة — مزيّنة بأناقة ليومكِ."
      ),
      features: [F("Luxury fleet", "أسطول فاخر"), F("Chauffeur", "سائق خاص"), F("Floral decoration", "تزيين بالورود"), F("Photo-ready", "جاهزة للتصوير")],
    }),
    biz("cars", F("Vintage Belle Rentals", "فينتاج بيل للتأجير"), AREAS[1], 45, 4.6, 78, {
      desc: F(
        "Charming vintage and convertible car rentals with elegant ribbon-and-bloom styling for a fairytale arrival.",
        "تأجير سيارات قديمة وكشف ساحرة مع تزيين أنيق بالشرائط والورود لوصول كحكاية خيالية."
      ),
      features: [F("Vintage cars", "سيارات كلاسيكية"), F("Ribbon styling", "تزيين بالشرائط"), F("Flexible hours", "ساعات مرنة")],
    }),
  ];

  window.DATA = {
    AREAS,
    CATEGORIES,
    PALETTES,
    VENDORS,
    catById(id) { return CATEGORIES.find((c) => c.id === id); },
    vendorById(id) { return VENDORS.find((v) => v.id === id); },
    vendorsByCat(id) { return VENDORS.filter((v) => v.category === id); },
    featured() { return VENDORS.filter((v) => v.featured); },
    countByCat(id) { return VENDORS.filter((v) => v.category === id).length; },
  };
})();
