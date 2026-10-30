// 工程實績。文案與照片來源：GEO-Saas enjoy-no1 首頁、enjoy-no2、enjoy-no3
import type { Block } from "./services";

export interface Case {
  slug: string;
  title: string;
  type: string;
  summary: string;
  cover: string;
  services: string[];
  blocks: Block[];
}

export const CASES: Case[] = [
  {
    slug: "32-year-old-house",
    title: "32 年老屋大改造",
    type: "老屋翻修",
    summary:
      "屋齡 32 年的住宅，從牆面修繕、重新粉刷，到地板更新與燈光規劃，一步步改善老舊的居家環境，讓空間告別斑駁與陳舊。",
    cover: "1aa27b04310744c4a346ae3bd63f6052.jpg",
    services: ["old-house-renovation", "interior-decoration"],
    blocks: [
      {
        heading: "翻修前：老舊與斑駁",
        body: "揮別老舊與灰塵，留下了老屋的痕跡。原本的地板、牆面與燈具都已老化，需要從基礎開始整理。",
        image: "2e83c9c114994cc5b835526d5b11e504.jpg",
      },
      {
        heading: "翻修後：協調俐落的新面貌",
        body: "整體空間風格讓客廳視覺更協調，營造舒適大方的居家氛圍。規劃嵌燈與特色燈具，透過光線層次提升整體空間的質感；整理門片與細節，整體風格更加一致，展現簡約俐落的新面貌。",
        image: "1aa27b04310744c4a346ae3bd63f6052.jpg",
      },
      {
        heading: "動線與門片整理",
        body: "從牆面修繕、重新粉刷到地板更新，搭配重新整理的門片與燈光，讓走道與各房間的動線更明亮清爽。",
        image: "41e5c40ef4bcee360158fdc2cd1a2b96.jpg",
      },
    ],
  },
  {
    slug: "loft-living-room",
    title: "躍層住宅客廳翻新",
    type: "室內裝潢",
    summary:
      "房屋經長時間使用，出現天花板老舊、採光不均、牆面劣化與收納不足等問題。透過天花板、照明、木地板與牆面收納整合，讓客廳更明亮、整潔且富有層次。",
    cover: "67e63cee64654e20a7500fe41611cc9b.png",
    services: ["interior-decoration", "space-design"],
    blocks: [
      {
        heading: "翻新前",
        body: "房屋經過長時間使用，出現天花板老舊、室內採光不均、牆面劣化及收納空間不足問題。具有特殊躍層結構的住宅，更需要仔細評估空間配置與生活動線。",
        image: "342bfdeb2bd3441f8f03066b129315cb.png",
      },
      {
        heading: "完成後",
        body: "天花板重新規劃嵌燈配置，讓室內光線更加均勻柔和；木地板為空間增添溫潤自然的質感，搭配簡約俐落的牆面設計，牆面展示與收納機能整合，讓原本空間展現出更明亮、整潔且富有層次的效果。",
        image: "67e63cee64654e20a7500fe41611cc9b.png",
      },
    ],
  },
  {
    slug: "wood-tone-home",
    title: "溫潤木質調住宅",
    type: "住宅裝修",
    summary:
      "以溫潤的木質色調搭配淺色系櫃體，營造明亮、舒適又耐看的居家氛圍。系統櫃提升收納機能，黑框玻璃隔間讓空間保有通透感與層次。",
    cover: "34fb38e8c23f4df582fbf321cbf613d6.png",
    services: ["system-cabinets", "space-design", "turnkey"],
    blocks: [
      {
        heading: "空間規劃亮點",
        body: "系統櫃體設計，提升收納機能；開放式展示層架，兼具美感與實用性；電視牆與收納櫃整合，讓空間更加俐落。",
        image: "34fb38e8c23f4df582fbf321cbf613d6.png",
      },
      {
        heading: "通透的玻璃隔間",
        body: "黑框玻璃隔間讓空間保有通透感與層次，木質地板搭配暖色燈光，增添居家溫度。",
        image: "64032842f36b48f4a6a6624f08c053cb.png",
      },
      {
        heading: "明亮舒適的客廳",
        body: "簡約米白牆面搭配溫潤木質地板，再以灰藍色窗簾點綴，營造明亮、舒適又有質感的居家空間。",
        image: "279256c7d6964e2ebc25cd623fbf39e2.png",
      },
    ],
  },
  {
    slug: "old-house-construction-log",
    title: "老屋翻修施工紀錄",
    type: "施工過程",
    summary:
      "從拆除、防水、給排水管線到進度回報，記錄老屋翻修中看不見、卻最重要的基礎工程。",
    cover: "12e5e03a10bb44679300dab48be1fbb5.png",
    services: ["old-house-renovation", "construction-planning"],
    blocks: [
      {
        heading: "拆除與基礎整理",
        body: "翻新第一步，從基礎整理開始。依照現場狀況拆除老舊裝潢與不需要的設施，讓後續工程有更完善的施工條件。",
        image: "54b8f74c691b474f91e2c7093de98f99.png",
      },
      {
        heading: "給排水管線配置",
        body: "重新檢視給排水管路，依照空間需求規劃管線位置，並確認接頭與管路配置，讓日常用水更加便利，減少後續維修的困擾。",
        image: "12e5e03a10bb44679300dab48be1fbb5.png",
      },
      {
        heading: "防水工程施作",
        body: "從基層整理到防水層施作，每個細節都仔細處理，降低日後滲漏水的風險，為居家環境打好基礎。",
        image: "1251c6f8c0d84591b0dd2a67ec298783.png",
      },
      {
        heading: "防水層與泥作",
        body: "防水層完成後再進行泥作，每一道工序確實做好，才能進入下一個階段。",
        image: "2752554eed1a4fd9a08afff32a313020.png",
      },
      {
        heading: "施工進度回報",
        body: "透過施工照片與進度回報，讓屋主即使無法親自到場，也能掌握施工狀況，清楚了解每個階段的施工內容。",
        image: "3b8313afcbc44292a6bdeba4153c3773.png",
      },
      {
        heading: "管線壓力檢查",
        body: "管線配置完成後進行檢查，確認接頭與管路狀況，再進入後續封板與泥作工程。",
        image: "b6d0c11001684d13231de8a46a6dce7e.jpg",
      },
    ],
  },
];

export const getCase = (slug: string) => CASES.find((c) => c.slug === slug);
