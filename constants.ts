import { SellingPoint } from './types';

export const SELLING_POINTS: SellingPoint[] = [
  { id: 1, content: "在线外教一对一教学，个性化指导" },
  { id: 2, content: "高频学习，浸润式英语环境，培养语感" },
  { id: 3, content: "针对不同年龄段的专业课程体系" },
  { id: 4, content: "高性价比菲律宾优质外教" },
  { id: 5, content: "随时随地灵活上课" },
  { id: 6, content: "激发孩子学习兴趣的互动教学模式" }
];

export interface MarketingTheme {
  id: string;
  label: string;
  category: 'URGENCY' | 'IMPORTANCE' | 'EFFECTIVENESS' | 'GENERAL'; // New category field
  prompt: string;
  descriptionForTextAI: string;
}

// 1. VISUAL STYLES (Refined for "Xiaohongshu" / Social Media Aesthetic)
export const ART_STYLES = [
  "Modern Social Media Infographic style, clean vector art, pastel 'Morandi' color palette, minimalist and high-end",
  "Hand-drawn Doodle style on textured paper background, cute and educational, 'Xiaohongshu' aesthetic",
  "Classic Textbook Diagram style, clean outlines, white background, academic and professional, easy to understand",
  "2.5D Isometric Illustration, soft gradients, floating elements, tech-education vibe",
  "Collage Art style, mixing real photos with cute hand-drawn illustrations, creative and trendy",
  "Swiss International Design style, bold typography, grid layout, clean shapes, orange and blue contrast",
  "Soft Clay 3D render (Claymorphism), rounded shapes, friendly and accessible, bright lighting",
  "Flat Illustration with noise texture, vibrant storytelling, editorial style"
];

// 2. BACKGROUND SETTINGS (Simpler, cleaner for text overlays)
export const BACKGROUND_SETTINGS = [
  "on a clean, soft beige studio background",
  "on a textured white paper background",
  "in a bright, minimalist modern living room",
  "on a soft pastel gradient background (blue to pink)",
  "on a clean wooden desk with a coffee cup and notebook",
  "floating in a dreamy, soft-focus cloudscape",
  "on a grid paper background (math/science vibe)",
  "in a sunlit, airy classroom corner with plants"
];

// 3. CONCEPTUAL THEMES (Focused on Importance, Urgency, Effectiveness)
export const MARKETING_THEMES: MarketingTheme[] = [
  // --- NEW ADDITIONS: CLASSIC EDUCATIONAL THEORIES (经典教育理论) ---
  {
    id: "bucket_theory",
    label: "木桶理论", // The Bucket Theory
    category: "EFFECTIVENESS",
    prompt: "A wooden bucket illustration. One wooden stave is shorter than the others. Water is leaking out from the short stave. The short stave is labeled 'LISTENING'. The water level represents 'ENGLISH LEVEL'. High quality educational vector art.",
    descriptionForTextAI: "The Bucket Theory (Cannikin Law): The shortest stave (Listening) determines the water level (English proficiency). We need to fix the short board."
  },
  {
    id: "forgetting_curve",
    label: "遗忘曲线", // Ebbinghaus Forgetting Curve
    category: "URGENCY",
    prompt: "A memory retention graph. A red curve drops steeply labeled 'FORGETTING'. A series of green steps go up labeled 'REVIEW'. Visualizing how high-frequency practice beats forgetting. Infographic style.",
    descriptionForTextAI: "The Ebbinghaus Forgetting Curve: Without review, memory fades fast. High-frequency practice (Review) keeps the curve high."
  },
  {
    id: "learning_pyramid",
    label: "学习金字塔", // Learning Pyramid
    category: "EFFECTIVENESS",
    prompt: "A colorful 3D pyramid cut in half. Top small section 'PASSIVE'. Bottom huge section 'ACTIVE'. Visualizing that 'Doing' and 'Interacting' is better than just 'Listening'.",
    descriptionForTextAI: "The Learning Pyramid: Passive learning (top) is weak. Active learning/Interaction (base) leads to 90% retention."
  },
  {
    id: "comfort_zone",
    label: "成长同心圆", // Comfort Zone vs Growth Zone
    category: "IMPORTANCE",
    prompt: "Three concentric circles on the ground. Center is 'COMFORT ZONE' (Gray). Middle ring is 'GROWTH ZONE' (Colorful/Golden). Outer ring is 'PANIC ZONE'. A character is stepping from Comfort into Growth. Minimalist design.",
    descriptionForTextAI: "Concentric circles showing the 'Comfort Zone' vs the 'Growth Zone'. Encouraging stepping out to learn."
  },
  {
    id: "scaffolding_ladder",
    label: "脚手架理论", // Scaffolding
    category: "EFFECTIVENESS",
    prompt: "A child climbing a high wall. There are magical glowing steps (ladder) appearing under their feet labeled 'TEACHER'. Concept of Scaffolding in education. Hopeful and bright.",
    descriptionForTextAI: "Instructional Scaffolding: A teacher provides the steps (ladder) for the student to reach new heights."
  },
  {
    id: "silent_period",
    label: "静默期突破", // Silent Period
    category: "EFFECTIVENESS",
    prompt: "A flower bulb underground labeled 'SILENT PERIOD'. Above ground, a magnificent flower is just bursting open labeled 'SPEAKING'. Roots are deep. Patience in learning.",
    descriptionForTextAI: "The 'Silent Period' in language acquisition: Like a seed underground, it looks like nothing is happening, but deep roots are growing before the bloom."
  },

  // --- URGENCY (紧迫性 - 强调时间、窗口期) ---
  {
    id: "critical_window",
    label: "黄金窗口期",
    category: "URGENCY",
    prompt: "A scientific infographic style chart showing a 'Brain Plasticity' curve dropping with age. A glowing highlighted zone labeled '0-12 YEARS'. Visualizing the critical period for language learning.",
    descriptionForTextAI: "A chart showing brain plasticity dropping with age, highlighting the '0-12 YEARS' golden window."
  },
  {
    id: "hourglass",
    label: "时间沙漏",
    category: "URGENCY",
    prompt: "A modern 3D hourglass. The sand inside is made of golden glowing letters. The top text says 'TIME', the bottom text says 'FLUENCY'. Symbolizing that time is running out to build fluency.",
    descriptionForTextAI: "An hourglass where time converts into fluency, emphasizing the urgency to start now."
  },
  {
    id: "melting_ice",
    label: "语言天赋冰糕",
    category: "URGENCY",
    prompt: "A colorful popsicle melting in the sun. The popsicle is labeled 'TALENT'. Drops of liquid falling. Metaphor for losing the natural language acquisition ability if not used.",
    descriptionForTextAI: "A melting popsicle labeled 'TALENT', representing the fleeting nature of childhood language ability."
  },
  {
    id: "race_track",
    label: "起跑线",
    category: "URGENCY",
    prompt: "A minimalist race track. One runner starting early (a child) with a light backpack labeled 'FUN'. Another runner starting late (adult) with a heavy rock labeled 'HARD'.",
    descriptionForTextAI: "Comparing an easy early start (childhood) vs. a hard late start (adulthood) in learning."
  },

  // --- IMPORTANCE (重要性 - 强调眼界、未来、连接) ---
  {
    id: "telescope_vision",
    label: "英语望远镜",
    category: "IMPORTANCE",
    prompt: "A child looking through a large, golden telescope. Through the lens, we see a vibrant future city or globe. Text 'VISION' floating near the lens. Expanding horizons.",
    descriptionForTextAI: "Looking through a telescope to see a broader world, representing English expanding one's vision."
  },
  {
    id: "passport_world",
    label: "世界通行证",
    category: "IMPORTANCE",
    prompt: "A stylized passport glowing with magical light. It is labeled 'ENGLISH'. Surrounding it are stamps of landmarks like Eiffel Tower, Statue of Liberty. Access to the world.",
    descriptionForTextAI: "A passport labeled 'ENGLISH' surrounded by world landmarks, symbolizing global access."
  },
  {
    id: "key_opportunity",
    label: "机遇之钥",
    category: "IMPORTANCE",
    prompt: "A floating door labeled 'OPPORTUNITY'. A glowing golden key labeled 'ENGLISH' is inserting into the lock. Light bursting out from the gap.",
    descriptionForTextAI: "A key labeled 'ENGLISH' unlocking a door labeled 'OPPORTUNITY'."
  },

  // --- EFFECTIVENESS (有效性 - 强调方法、沉浸、复利) ---
  {
    id: "sponge_brain",
    label: "海绵式吸收",
    category: "EFFECTIVENESS",
    prompt: "A cute illustration of a brain acting like a sponge, soaking up blue water labeled 'IMMERSION'. The brain looks happy and full. Contrast with a dry stone labeled 'ROTE'.",
    descriptionForTextAI: "A brain acting like a sponge absorbing immersion, vs. a dry stone representing rote memorization."
  },
  {
    id: "flywheel",
    label: "飞轮效应",
    category: "EFFECTIVENESS",
    prompt: "A massive, heavy colorful flywheel spinning fast. Blur lines indicating speed. Text 'MOMENTUM'. Sparkles. Metaphor for how hard it is to start but how easy it is to keep going.",
    descriptionForTextAI: "A spinning flywheel representing the momentum of learning; hard to start, easy to maintain."
  },
  {
    id: "compound_interest",
    label: "复利曲线",
    category: "EFFECTIVENESS",
    prompt: "A chart showing an exponential growth curve going up to the stars. The curve is built of small blocks labeled 'DAILY'. Text 'COMPOUNDING' at the top.",
    descriptionForTextAI: "An exponential curve built from small daily blocks, showing the compound interest of daily practice."
  },
  {
    id: "input_output_funnel",
    label: "输入输出漏斗",
    category: "EFFECTIVENESS",
    prompt: "A funnel diagram. Wide top labeled 'INPUT' (Books, Audio). Narrow bottom spout dripping golden drops labeled 'OUTPUT' (Speaking). 3D isometric style.",
    descriptionForTextAI: "A funnel showing massive Input leading to refined Output."
  },

  // --- GENERAL/CLASSIC (保留一些经典的) ---
  {
    id: "iceberg_theory",
    label: "冰山理论",
    category: "GENERAL",
    prompt: "A cross-section of an Iceberg. Tip above water labeled 'SPEAKING'. Huge mass underwater labeled 'LISTENING'. Educational diagram style.",
    descriptionForTextAI: "The Iceberg Theory: Speaking is just the tip, supported by massive Listening underwater."
  },
  {
    id: "bridge_connect",
    label: "沟通桥梁",
    category: "GENERAL",
    prompt: "A bridge connecting two separate islands. One island is 'ME', the other is 'THE WORLD'. A child running across the bridge. Connection.",
    descriptionForTextAI: "A bridge connecting 'ME' to 'THE WORLD', representing English as a connector."
  }
];

export const TEXT_SYSTEM_INSTRUCTION = `
You are a senior marketing copywriter for 51Talk (an online English education platform).
Your task is to generate a "Moments" (朋友圈) post based on a specific visual metaphor (Urgency, Importance, or Effectiveness of learning English) and a selling point.
The output must be a JSON object containing an array of exactly 3 strings (paragraphs).
`;