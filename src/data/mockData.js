export const RESTAURANT_INFO = {
  name: "BuyurAbi Lezzet Sofrası",
  tagline: "Geleneksel & Modern Lezzetler Masanızda",
  address: "Bağdat Caddesi No:142, Kadıköy / İstanbul",
  phone: "0850 300 28 99",
  wifiPassword: "buyurabi_free_wifi",
  workingHours: "10:00 - 23:30",
  rating: 4.9
};

export const MENU_CATEGORIES = [
  { id: "all", name: "Tümü", icon: "utensils" },
  { id: "populer", name: "Popüler Lezzetler", icon: "flame" },
  { id: "corba", name: "Çorbalar", icon: "soup" },
  { id: "izgara", name: "Izgara & Kebap", icon: "drumstick" },
  { id: "pide", name: "Pide & Lahmacun", icon: "pizza" },
  { id: "burger", name: "Gurme Burger", icon: "sandwich" },
  { id: "tatli", name: "Tatlılar", icon: "cake-slice" },
  { id: "icecek", name: "İçecekler", icon: "cup-soda" }
];

export const INITIAL_MENU_ITEMS = [
  {
    id: "item-1",
    categoryId: "izgara",
    name: "Zırh Kıyma Adana Kebap",
    description: "Özel baharatlar ile zırhta çekilmiş kuzu eti, közlenmiş biber, domates ve sumaklı soğan eşliğinde.",
    price: 340,
    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=600&q=80",
    tags: ["Popüler", "Acılı", "Şefin Seçimi"],
    calories: "520 kcal",
    prepTime: "15-20 dk",
    available: true,
    options: {
      porsiyon: ["Tek Porsiyon", "1.5 Porsiyon (+₺120)"],
      garnitur: ["Sumaklı Soğan", "Bulgur Pilavı", "Köz Patlıcan"],
      acilik: ["Az Acılı", "Orta Acılı", "Bol Acılı"]
    }
  },
  {
    id: "item-2",
    categoryId: "izgara",
    name: "Tereyağlı İskender Kebap",
    description: "İnce kıyılmış bonfile döner, kızarmış pide yatağında, özel domates sosu ve manda yoğurdu ile.",
    price: 380,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
    tags: ["Popüler", "Şefin Seçimi"],
    calories: "680 kcal",
    prepTime: "12-15 dk",
    available: true,
    options: {
      porsiyon: ["Standart", "Duble (+₺140)"],
      yag: ["Bol Tereyağı", "Orta Tereyağı"]
    }
  },
  {
    id: "item-3",
    categoryId: "pide",
    name: "Taş Fırın Kuşbaşılı Kaşarlı Pide",
    description: "Kuru dinlendirilmiş dana kuşbaşı, erimiş Trabzon kaşarı ve çıtır taş fırın hamuru.",
    price: 290,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
    tags: ["Çıtır", "Geleneksel"],
    calories: "590 kcal",
    prepTime: "10-15 dk",
    available: true,
    options: {
      yumurta: ["Yumurtasız", "Üzerine Yumurtalı (+₺20)"],
      kenar: ["Sade Kenar", "Tereyağ Sürülmüş"]
    }
  },
  {
    id: "item-4",
    categoryId: "corba",
    name: "Geleneksel Süzme Mercimek Çorbası",
    description: "Koyu kıvamlı süzme sarı mercimek, tereyağlı kırmızı biber sosu ve çıtır kruton ekmek ile.",
    price: 110,
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80",
    tags: ["Sıcak", "Vejetaryen"],
    calories: "210 kcal",
    prepTime: "5 dk",
    available: true,
    options: {
      ekstra: ["Kurutulmuş Ekmek", "Limon & Kruton"]
    }
  },
  {
    id: "item-5",
    categoryId: "burger",
    name: "BuyurAbi Özel Gurme Burger",
    description: "180gr Dana kaburga köftesi, karamelize soğan, Füme kaburga, cheddar peyniri ve trüflü mayonez.",
    price: 320,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
    tags: ["Popüler", "Çok Satan"],
    calories: "740 kcal",
    prepTime: "15 dk",
    available: true,
    options: {
      pisme: ["Orta Pişmiş", "İyi Pişmiş"],
      patates: ["Cahun Baharatlı Patates", "Sade Patates Koyu"]
    }
  },
  {
    id: "item-6",
    categoryId: "tatli",
    name: "Hatay Usulü Çıtır Künefe",
    description: "Özel tuzsuz künefe peyniri, çıtır kadayıf, üzerine Antep fıstığı tozu ve manda kaymağı.",
    price: 210,
    image: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=600&q=80",
    tags: ["Sıcak Tatlı", "Kaymaklı"],
    calories: "450 kcal",
    prepTime: "15 dk",
    available: true,
    options: {
      ekstra: ["Kaymaklı", "Dondurmalı (+₺30)"]
    }
  },
  {
    id: "item-7",
    categoryId: "tatli",
    name: "Gaziantep Fıstıklı Havuç Dilim Baklava",
    description: "Bol fıstıklı, 40 kat ince yufka, doğal şeker pancarı şerbeti ve Maraş dondurması eşliğinde.",
    price: 240,
    image: "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=600&q=80",
    tags: ["Geleneksel"],
    calories: "490 kcal",
    prepTime: "5 dk",
    available: true,
    options: {
      servis: ["Dondurmalı", "Sade Kaymaklı"]
    }
  },
  {
    id: "item-8",
    categoryId: "icecek",
    name: "Yayık Ev Yapımı Bol Köpüklü Ayran",
    description: "Günlük koyun ve manda yoğurdundan yayıkta hazırlanmış buz gibi taze ayran.",
    price: 60,
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80",
    tags: ["Soğuk", "Doğal"],
    calories: "110 kcal",
    prepTime: "2 dk",
    available: true
  },
  {
    id: "item-9",
    categoryId: "icecek",
    name: "Közde Ağır Pişmiş Türk Kahvesi",
    description: "Özel kavrulmuş taze çekim Türk kahvesi, yanında çikolatalı lokum ve soğuk su ikramı ile.",
    price: 75,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    tags: ["Sıcak", "Keyif"],
    calories: "25 kcal",
    prepTime: "5 dk",
    available: true,
    options: {
      seker: ["Sade", "Az Şekerli", "Orta Şekerli", "Şekerli"]
    }
  }
];

export const TABLES_LIST = [
  { id: 1, name: "Masa 1", zone: "İç Mekan", capacity: 4, status: "dolu", currentOrderTotal: 630 },
  { id: 2, name: "Masa 2", zone: "İç Mekan", capacity: 2, status: "bos", currentOrderTotal: 0 },
  { id: 3, name: "Masa 3", zone: "Bahçe", capacity: 6, status: "siparis_bekliyor", currentOrderTotal: 960 },
  { id: 4, name: "Masa 4 (Sizin Masanız)", zone: "Bahçe", capacity: 4, status: "dolu", currentOrderTotal: 450 },
  { id: 5, name: "Masa 5", zone: "Teras", capacity: 2, status: "hesap_istedi", currentOrderTotal: 840 },
  { id: 6, name: "Masa 6", zone: "Teras", capacity: 4, status: "bos", currentOrderTotal: 0 },
  { id: 7, name: "Masa 7", zone: "Bahçe", capacity: 4, status: "bos", currentOrderTotal: 0 },
  { id: 8, name: "Masa 8", zone: "VIP Salon", capacity: 8, status: "dolu", currentOrderTotal: 1850 }
];

export const INITIAL_ORDERS = [
  {
    id: "ORD-9402",
    tableId: 4,
    tableName: "Masa 4",
    customerName: "Ahmet Y.",
    time: "3 dk önce",
    timestamp: Date.now() - 3 * 60 * 1000,
    status: "yeni", // yeni, hazirlaniyor, masada, tamamlandi
    items: [
      { id: "item-1", name: "Zırh Kıyma Adana Kebap", price: 340, qty: 1, note: "Bol acılı ve bulgur pilavlı olsun" },
      { id: "item-8", name: "Yayık Ev Yapımı Bol Köpüklü Ayran", price: 60, qty: 1, note: "Buzlu" }
    ],
    totalPrice: 400,
    paymentMethod: "Masada Kredi Kartı",
    orderNote: "Biberler bol közlensin lütfen."
  },
  {
    id: "ORD-9398",
    tableId: 3,
    tableName: "Masa 3",
    customerName: "Selin K.",
    time: "12 dk önce",
    timestamp: Date.now() - 12 * 60 * 1000,
    status: "hazirlaniyor",
    items: [
      { id: "item-2", name: "Tereyağlı İskender Kebap", price: 380, qty: 2, note: "Bol tereyağlı" },
      { id: "item-6", name: "Hatay Usulü Çıtır Künefe", price: 210, qty: 1, note: "Kaymaklı" }
    ],
    totalPrice: 970,
    paymentMethod: "Masada Nakit",
    orderNote: "Yemeklerin yanında 2 bardak çay rica ediyoruz."
  },
  {
    id: "ORD-9385",
    tableId: 5,
    tableName: "Masa 5",
    customerName: "Mehmet T.",
    time: "28 dk önce",
    timestamp: Date.now() - 28 * 60 * 1000,
    status: "masada",
    items: [
      { id: "item-5", name: "BuyurAbi Özel Gurme Burger", price: 320, qty: 2, note: "Orta pişmiş" },
      { id: "item-7", name: "Gaziantep Fıstıklı Havuç Dilim Baklava", price: 240, qty: 1, note: "Dondurmalı" }
    ],
    totalPrice: 880,
    paymentMethod: "Online Ödeme (Ödendi)",
    orderNote: ""
  }
];

export const INITIAL_WAITER_REQUESTS = [
  { id: "req-1", tableId: 5, tableName: "Masa 5", type: "hesap", message: "Hesap İstiyor (Kredi Kartı)", time: "2 dk önce" },
  { id: "req-2", tableId: 1, tableName: "Masa 1", type: "garson", message: "Garson Çağırıyor (Ekstra Peçete & Tuz)", time: "5 dk önce" }
];
