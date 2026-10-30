// 品牌基本資料（NAP）：全站、結構化資料都從這裡讀，改一處即可
export const SITE = {
  name: "宥涒室內裝潢",
  tagline: "用心築造，讓家更有質感",
  description:
    "宥涒室內裝潢是深耕大桃園地區的室內裝修統包團隊，提供室內裝潢、老屋翻修、新成屋裝潢、中古屋裝修、系統櫃安裝與室內設計諮詢。從空間規劃、材質挑選到施工細節，重視基礎工程與進度回報，服務桃園、中壢及周邊地區。",
  phone: "0952-656-256",
  phoneIntl: "+886-952-656-256",
  address: {
    region: "桃園市",
    locality: "桃園區",
    street: "大興路290巷7號4樓",
    full: "桃園市桃園區大興路290巷7號4樓",
    country: "TW",
  },
  areaServed: ["桃園", "中壢", "大桃園地區"],
  line: "https://line.me/ti/p/K6dtyB0X6o",
  facebook: "https://www.facebook.com/profile.php?id=61562676700124",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("桃園市桃園區大興路290巷7號4樓"),
  mapEmbed: "https://www.google.com/maps?q=" + encodeURIComponent("桃園市桃園區大興路290巷7號4樓") + "&output=embed",
};

// 統包可承接的工程項目（來源：品牌首頁「服務項目」）
export const WORK_ITEMS = [
  "拆除工程",
  "水電工程",
  "泥作與防水工程",
  "木作工程",
  "油漆工程",
  "鋁門窗工程",
  "系統櫃安裝",
  "地板、窗簾、壁紙工程",
  "各類室內裝修與修繕工程",
];

export const NAV = [
  { href: "/services/", label: "服務項目" },
  { href: "/cases/", label: "工程實績" },
  { href: "/process/", label: "裝修流程" },
  { href: "/blog/", label: "裝修知識" },
  { href: "/faq/", label: "常見問題" },
  { href: "/about/", label: "關於宥涒" },
];
