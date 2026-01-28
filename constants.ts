import { StyleOption, Review } from './types';

// Landing Page: Before (Real Photo) & After (Artistic Style)
export const LANDING_BEFORE_IMAGE = "https://i.imgur.com/KpDraUm.png";
export const LANDING_AFTER_IMAGE = "https://i.imgur.com/h2khhcs.png";

export const WALL_MOCKUP_BG = "https://images.unsplash.com/photo-1589834390005-5d4fb9bf3d32?auto=format&fit=crop&q=80&w=1200";

// --- BANK TRANSFER INFO ---
export const ADMIN_EMAIL = "pkmshopify@gmail.com";

export const BANK_INFO = {
  name: '토스뱅크',
  accountNumber: '100057107725',
  holder: '박경민(더와이즈샵)',
  tossBankCode: '092'
};

export const ART_STYLES: StyleOption[] = [
  {
    id: 'renaissance',
    name: '르네상스 로얄',
    description: '근엄한 왕자/공주님을 위한 웅장한 귀족 초상화',
    thumbnailUrl: 'https://imgur.com/cGL3mqv.png',
    category: 'CLASSIC',
    recommendedFor: '모든 반려동물',
    tags: ['classic', 'oil', 'royal']
  },
  {
    id: 'oil_painting',
    name: '유화 마스터피스',
    description: '반 고흐의 숨결이 느껴지는 강렬한 유화 스타일',
    thumbnailUrl: 'https://imgur.com/TFjCgDh.png',
    category: 'CLASSIC',
    recommendedFor: '차분한 분위기',
    tags: ['classic', 'oil', 'vangogh']
  },
  {
    id: 'watercolor',
    name: '감성 수채화',
    description: '물감이 번지는 듯한 맑고 투명한 수채화 화풍',
    thumbnailUrl: 'https://imgur.com/fsYgjcx.png',
    category: 'EMOTIONAL',
    recommendedFor: '밝은 털색의 동물',
    tags: ['emotional', 'watercolor', 'soft']
  },
  {
    id: 'three_d_animation',
    name: '3D 애니메이션',
    description: '동화 속 주인공 같은 귀여운 3D 캐릭터 입체 변환',
    thumbnailUrl: 'https://imgur.com/rVfqgfO.png',
    category: 'MODERN',
    recommendedFor: '귀여운 외모',
    tags: ['modern', '3d', 'cute', 'animation']
  },
  {
    id: 'emotional_anime',
    name: '감성 애니메이션',
    description: '따뜻하고 몽글몽글한 애니메이션 속 한 장면',
    thumbnailUrl: 'https://imgur.com/NVojSk3.png',
    category: 'EMOTIONAL',
    recommendedFor: '자연스러운 포즈',
    tags: ['emotional', 'anime', 'ghibli']
  },
  {
    id: 'sketch',
    name: '펜슬 스케치',
    description: '연필의 질감이 섬세하게 살아있는 정밀 묘사',
    thumbnailUrl: 'https://imgur.com/dOOR7qu.png',
    category: 'CLASSIC',
    recommendedFor: '모든 동물',
    tags: ['classic', 'sketch', 'pencil']
  },
  {
    id: 'pop_art',
    name: '모던 팝아트',
    description: '앤디 워홀 스타일의 힙하고 비비드한 예술 작품',
    thumbnailUrl: 'https://imgur.com/3w6czGT.png',
    category: 'MODERN',
    recommendedFor: '개성 넘치는 반려동물',
    tags: ['modern', 'popart', 'vivid']
  },
  {
    id: 'marble_statue',
    name: '마블 조각상',
    description: '박물관에 전시된 듯한 고귀한 대리석 조각',
    thumbnailUrl: 'https://imgur.com/F2cNs51.png',
    category: 'CLASSIC',
    recommendedFor: '조각 같은 외모',
    tags: ['classic', 'statue', '3d']
  },
  {
    id: 'cyberpunk',
    name: '사이버펑크',
    description: '네온 사인이 빛나는 미래 도시 테마',
    thumbnailUrl: 'https://imgur.com/UY2P84Q.png',
    category: 'MODERN',
    recommendedFor: '카리스마 있는 모습',
    tags: ['modern', 'cyberpunk', 'neon']
  },
  {
    id: 'webtoon',
    name: '웹툰/만화',
    description: 'K-웹툰 스타일의 깔끔한 선과 채색',
    thumbnailUrl: 'https://imgur.com/XbmPeG3.png',
    category: 'MODERN',
    recommendedFor: '발랄한 캐릭터',
    tags: ['modern', 'webtoon', 'comic']
  },
  {
    id: 'pixel_art',
    name: '픽셀 아트',
    description: '레트로 게임 감성이 담긴 도트 그래픽',
    thumbnailUrl: 'https://imgur.com/RYqy1aS.png',
    category: 'MODERN',
    recommendedFor: '작고 귀여운 동물',
    tags: ['modern', 'pixel', 'retro']
  },
  {
    id: 'digital_painting',
    name: '디지털 페인팅',
    description: '현대적인 감각의 세련된 일러스트레이션',
    thumbnailUrl: 'https://imgur.com/fpdElrr.png',
    category: 'MODERN',
    recommendedFor: '매끈한 털의 동물',
    tags: ['modern', 'digital', 'illustration']
  }
];

export const CREDIT_PACKAGES = [
  { id: 'starter', name: '스타터 팩', price: 4500, credits: 5, tag: null },
  { id: 'standard', name: '스탠다드 팩', price: 9900, credits: 12, tag: 'Best' },
  { id: 'pro', name: '프로 작가 팩', price: 19900, credits: 25, tag: 'Pro' }
];

export const REVIEWS: Review[] = [
  {
    id: 1,
    user: '초코맘',
    rating: 5,
    text: '우리집 강아지가 진짜 중세 귀족 왕자님이 됐어요! 르네상스 화풍 퀄리티가 미쳤습니다. 액자로 바로 뽑았어요.',
    beforeImage: 'https://imgur.com/4ID58aq.png',
    afterImage: 'https://imgur.com/t8GCshf.png',
    date: '2024.03.15'
  },
  {
    id: 2,
    user: '토리집사',
    rating: 5,
    text: '감성 애니메이션 느낌 대박이에요... 지브리 영화 한 장면 같아요 ㅠㅠ 너무 몽글몽글하고 예쁩니다.',
    beforeImage: 'https://imgur.com/TRXS9Ir.png',
    afterImage: 'https://imgur.com/zVqaOML.png',
    date: '2024.03.14'
  },
  {
    id: 3,
    user: '민준아빠',
    rating: 5,
    text: '사이버펑크 스타일 진짜 힙하네요! 네온 조명 표현이 너무 예술적이라 만족스럽습니다.',
    beforeImage: 'https://imgur.com/EBMcJcY.png',
    afterImage: 'https://imgur.com/1TzkMWN.png',
    date: '2024.03.13'
  },
  {
    id: 4,
    user: '행복이네',
    rating: 5,
    text: '유화 마스터피스 스타일로 변환했는데 진짜 반 고흐가 그려준 줄 알았어요. 붓터치가 살아있네요.',
    beforeImage: 'https://imgur.com/KpDraUm.png',
    afterImage: 'https://imgur.com/h2khhcs.png',
    date: '2024.03.12'
  },
  {
    id: 5,
    user: '나비엄마',
    rating: 5,
    text: '3D 애니메이션 캐릭터 같아서 너무 귀여워요! 디즈니 영화에 우리 나비가 출연한 느낌입니다.',
    beforeImage: 'https://imgur.com/UTBqPjf.png',
    afterImage: 'https://imgur.com/EBAQPy0.png',
    date: '2024.03.10'
  },
  {
    id: 6,
    user: '구름이누나',
    rating: 5,
    text: '수채화 특유의 맑은 느낌이 너무 좋습니다. 털 색깔이랑 잘 어우러져서 집안 어디에 둬도 예쁠 것 같아요.',
    beforeImage: 'https://imgur.com/HGja6xe.png',
    afterImage: 'https://imgur.com/AuUpZqs.png',
    date: '2024.03.08'
  },
  {
    id: 7,
    user: '별이네',
    rating: 5,
    text: '웹툰/만화 스타일로 그렸더니 진짜 주인공이 됐네요! 선이 깔끔해서 너무 맘에 들어요.',
    beforeImage: 'https://imgur.com/Xek65vO.png',
    afterImage: 'https://imgur.com/HBqIeQI.png',
    date: '2024.03.05'
  },
  {
    id: 8,
    user: '지우맘',
    rating: 5,
    text: '디지털 페인팅 화풍으로 했더니 사진보다 훨씬 세련된 예술 작품이 됐어요. 적극 추천합니다.',
    beforeImage: 'https://imgur.com/ZzFgPGU.png',
    afterImage: 'https://imgur.com/PVm55Dk.png',
    date: '2024.03.03'
  },
  {
    id: 9,
    user: '복실이아빠',
    rating: 5,
    text: '픽셀 아트 너무 유니크해요! 레트로한 감성이 반려동물과 만나니까 더 특별해 보이네요.',
    beforeImage: 'https://imgur.com/UikbFiH.png',
    afterImage: 'https://imgur.com/WGDXydA.png',
    date: '2024.03.01'
  }
];