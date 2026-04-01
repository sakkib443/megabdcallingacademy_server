// ==========================================
// BdCalling Academy Chatbot Intent Detection
// Keyword-based pattern matching (BN + EN)
// ==========================================

export interface DetectedIntent {
  intent: string;
  confidence: number;
  language: 'bn' | 'en';
  courseName?: string;
}

interface IntentPattern {
  intent: string;
  keywords: {
    en: string[];
    bn: string[];
  };
  priority: number;
}

// ─── Intent Patterns ────────────────────────────
const intentPatterns: IntentPattern[] = [
  {
    intent: 'greeting',
    keywords: {
      en: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'what\'s up', 'greetings'],
      bn: ['আসসালামু', 'সালাম', 'হ্যালো', 'হাই', 'শুভ সকাল', 'শুভ বিকেল', 'শুভ সন্ধ্যা', 'কেমন আছ', 'কেমন আছেন', 'নমস্কার'],
    },
    priority: 1,
  },
  {
    intent: 'course_list',
    keywords: {
      en: ['courses', 'all courses', 'course list', 'what courses', 'which courses', 'available courses', 'show courses', 'offer courses', 'training programs', 'programs'],
      bn: ['কোর্স', 'কোর্সগুলো', 'সব কোর্স', 'কোর্স লিস্ট', 'কোর্স দেখাও', 'কি কি কোর্স', 'কোন কোন কোর্স', 'ট্রেনিং', 'প্রজেক্ট', 'শেখা'],
    },
    priority: 5,
  },
  {
    intent: 'course_fee',
    keywords: {
      en: ['fee', 'fees', 'price', 'cost', 'how much', 'pricing', 'rate', 'charge', 'tuition', 'expensive', 'cheap', 'affordable'],
      bn: ['ফি', 'দাম', 'কত', 'মূল্য', 'খরচ', 'টাকা', 'প্রাইস', 'চার্জ', 'ফিস'],
    },
    priority: 6,
  },
  {
    intent: 'course_details',
    keywords: {
      en: ['about course', 'course details', 'tell me about', 'course info', 'what is', 'describe', 'explain', 'curriculum', 'syllabus', 'module', 'overview', 'learn in'],
      bn: ['কোর্স সম্পর্কে', 'বিস্তারিত', 'কোর্সের বিবরণ', 'কি শেখানো', 'সিলেবাস', 'কারিকুলাম', 'মডিউল', 'কি কি শিখবো', 'কি শিখব'],
    },
    priority: 7,
  },
  {
    intent: 'admission',
    keywords: {
      en: ['enroll', 'admit', 'admission', 'join', 'register', 'sign up', 'how to enroll', 'how to join', 'apply', 'get started', 'start learning', 'enrolment'],
      bn: ['ভর্তি', 'এনরোল', 'ভর্তি হতে চাই', 'কিভাবে ভর্তি', 'ভর্তির নিয়ম', 'রেজিস্টার', 'জয়েন', 'শুরু করতে', 'আবেদন', 'ভর্তি হবো', 'ভর্তি প্রক্রিয়া'],
    },
    priority: 8,
  },
  {
    intent: 'payment',
    keywords: {
      en: ['payment', 'pay', 'bkash', 'bikash', 'nagad', 'bank', 'card', 'credit card', 'debit', 'transaction', 'transfer', 'sslcommerz', 'online payment'],
      bn: ['পেমেন্ট', 'টাকা দিবো', 'বিকাশ', 'নগদ', 'ব্যাংক', 'কার্ড', 'পেমেন্ট করবো', 'টাকা পাঠাবো', 'পে', 'লেনদেন'],
    },
    priority: 8,
  },
  {
    intent: 'installment',
    keywords: {
      en: ['installment', 'emi', 'installments', 'monthly payment', 'pay later', 'split payment', 'partial payment'],
      bn: ['কিস্তি', 'ইএমআই', 'কিস্তিতে', 'মাসিক পেমেন্ট', 'ভাগ করে', 'কিস্তি সুবিধা'],
    },
    priority: 9,
  },
  {
    intent: 'mentors',
    keywords: {
      en: ['mentor', 'mentors', 'instructor', 'teacher', 'trainer', 'faculty', 'who teaches', 'expert', 'instructors'],
      bn: ['মেন্টর', 'শিক্ষক', 'ট্রেইনার', 'ইন্সট্রাক্টর', 'কে পড়ায়', 'কে শেখায়', 'ফ্যাকাল্টি', 'মেন্টরস'],
    },
    priority: 5,
  },
  {
    intent: 'events',
    keywords: {
      en: ['event', 'events', 'seminar', 'seminars', 'webinar', 'workshop', 'free seminar', 'upcoming event', 'free class'],
      bn: ['ইভেন্ট', 'সেমিনার', 'ওয়েবিনার', 'ওয়ার্কশপ', 'ফ্রি সেমিনার', 'আসন্ন ইভেন্ট', 'ফ্রি ক্লাস', 'অনুষ্ঠান'],
    },
    priority: 5,
  },
  {
    intent: 'certificate',
    keywords: {
      en: ['certificate', 'certification', 'verify', 'verification', 'credential', 'diploma', 'certified'],
      bn: ['সার্টিফিকেট', 'সনদ', 'সার্টিফিকেশন', 'ভেরিফাই', 'ভেরিফিকেশন', 'সনদপত্র'],
    },
    priority: 7,
  },
  {
    intent: 'contact',
    keywords: {
      en: ['contact', 'address', 'location', 'office', 'where', 'phone', 'email', 'reach', 'call', 'number', 'find you', 'visit'],
      bn: ['যোগাযোগ', 'ঠিকানা', 'অফিস', 'কোথায়', 'ফোন', 'ইমেইল', 'নম্বর', 'কল', 'লোকেশন', 'ফোন নম্বর', 'মোবাইল'],
    },
    priority: 6,
  },
  {
    intent: 'office_hours',
    keywords: {
      en: ['office hours', 'timing', 'open', 'close', 'when open', 'schedule', 'working hours', 'business hours', 'opening time'],
      bn: ['অফিস টাইম', 'সময়সূচি', 'কখন খোলা', 'কখন বন্ধ', 'খোলা বন্ধ', 'কার্যদিবস', 'ওয়ার্কিং আওয়ার'],
    },
    priority: 7,
  },
  {
    intent: 'job_placement',
    keywords: {
      en: ['job', 'placement', 'career', 'employment', 'hire', 'work', 'opportunity', 'placement rate', 'get job', 'job support', 'job guarantee'],
      bn: ['জব', 'চাকরি', 'প্লেসমেন্ট', 'ক্যারিয়ার', 'কর্মসংস্থান', 'চাকরি পাওয়া', 'জব সাপোর্ট', 'জব হবে', 'চাকরি হবে', 'নিয়োগ'],
    },
    priority: 6,
  },
  {
    intent: 'about',
    keywords: {
      en: ['about', 'about you', 'about academy', 'who are you', 'what is', 'tell me about academy', 'bdcalling', 'introduce', 'company'],
      bn: ['একাডেমি সম্পর্কে', 'তোমরা কে', 'আপনারা কারা', 'বিডি কলিং', 'পরিচয়', 'একাডেমি কি', 'প্রতিষ্ঠান'],
    },
    priority: 3,
  },
  {
    intent: 'discount',
    keywords: {
      en: ['discount', 'offer', 'promo', 'coupon', 'deal', 'special offer', 'reduction', 'sale', 'off'],
      bn: ['ছাড়', 'ডিসকাউন্ট', 'অফার', 'কুপন', 'প্রমো', 'বিশেষ অফার', 'কম দামে'],
    },
    priority: 7,
  },
  {
    intent: 'freelancing',
    keywords: {
      en: ['freelance', 'freelancing', 'fiverr', 'upwork', 'remote work', 'work from home', 'self employed', 'marketplace', 'outsourcing'],
      bn: ['ফ্রিল্যান্স', 'ফ্রিল্যান্সিং', 'আউটসোর্সিং', 'ফাইভার', 'আপওয়ার্ক', 'ঘরে বসে কাজ', 'মার্কেটপ্লেস', 'রিমোট'],
    },
    priority: 7,
  },
  {
    intent: 'class_schedule',
    keywords: {
      en: ['class', 'classes', 'class time', 'schedule', 'batch', 'timetable', 'when class', 'class schedule', 'live class', 'online class', 'offline class'],
      bn: ['ক্লাস', 'ক্লাসের সময়', 'ব্যাচ', 'শিডিউল', 'কখন ক্লাস', 'লাইভ ক্লাস', 'অনলাইন ক্লাস', 'অফলাইন ক্লাস', 'ক্লাস টাইম'],
    },
    priority: 6,
  },
  {
    intent: 'human_support',
    keywords: {
      en: ['human', 'real person', 'talk to someone', 'customer service', 'support', 'agent', 'representative', 'speak to', 'help me', 'complaint'],
      bn: ['মানুষ', 'মানুষের সাথে', 'কথা বলতে চাই', 'কাস্টমার সার্ভিস', 'সাপোর্ট', 'হেল্প', 'সাহায্য', 'অভিযোগ'],
    },
    priority: 10,
  },
  {
    intent: 'thanks',
    keywords: {
      en: ['thank', 'thanks', 'thank you', 'appreciate', 'helpful', 'great', 'awesome', 'nice', 'good'],
      bn: ['ধন্যবাদ', 'থ্যাংকস', 'শুকরিয়া', 'জাযাকাল্লাহ', 'ভালো', 'চমৎকার'],
    },
    priority: 2,
  },
  {
    intent: 'goodbye',
    keywords: {
      en: ['bye', 'goodbye', 'see you', 'later', 'take care', 'good night'],
      bn: ['বিদায়', 'আল্লাহ হাফেজ', 'খোদা হাফেজ', 'পরে কথা হবে', 'ভালো থাকবেন'],
    },
    priority: 2,
  },
];

// ─── Language Detection ─────────────────────────
function detectLanguage(message: string): 'bn' | 'en' {
  // Bengali Unicode range: \u0980-\u09FF
  const bengaliPattern = /[\u0980-\u09FF]/;
  const bengaliChars = (message.match(/[\u0980-\u09FF]/g) || []).length;
  const totalChars = message.replace(/\s/g, '').length;
  
  if (bengaliPattern.test(message) && bengaliChars > totalChars * 0.3) {
    return 'bn';
  }
  return 'en';
}

// ─── Extract Course Name ────────────────────────
function extractCourseName(message: string): string | undefined {
  const lowerMessage = message.toLowerCase();
  
  // Common course keywords to look for
  const courseKeywords = [
    'web development', 'web dev', 'graphics design', 'graphic design',
    'digital marketing', 'seo', 'ui ux', 'ui/ux', 'uiux',
    'python', 'java', 'javascript', 'react', 'next.js', 'nextjs',
    'app development', 'android', 'ios', 'flutter', 'mern',
    'data science', 'machine learning', 'ai', 'artificial intelligence',
    'cyber security', 'networking', 'ccna', 'linux',
    'video editing', 'motion graphics', 'autocad', '3d', 'animation',
    'wordpress', 'php', 'laravel', 'node', 'nodejs',
    'ielts', 'english', 'spoken english',
    'database', 'sql', 'mongodb', 'oracle',
    // Bengali course names
    'ওয়েব ডেভেলপমেন্ট', 'গ্রাফিক্স ডিজাইন', 'ডিজিটাল মার্কেটিং',
    'পাইথন', 'জাভা', 'অ্যাপ ডেভেলপমেন্ট', 'ভিডিও এডিটিং',
    'সাইবার সিকিউরিটি', 'নেটওয়ার্কিং', 'ডাটাবেস',
    'আইইএলটিএস', 'ইংরেজি',
  ];

  for (const keyword of courseKeywords) {
    if (lowerMessage.includes(keyword)) {
      return keyword;
    }
  }

  return undefined;
}

// ─── Main Intent Detection Function ─────────────
export function detectIntent(message: string): DetectedIntent {
  const language = detectLanguage(message);
  const lowerMessage = message.toLowerCase();
  const normalizedBn = message; // Bengali doesn't need lowercase
  
  let bestIntent = 'unknown';
  let bestScore = 0;
  let courseName: string | undefined;

  for (const pattern of intentPatterns) {
    let score = 0;
    const keywords = language === 'bn' ? pattern.keywords.bn : pattern.keywords.en;
    // Also check both languages for mixed messages
    const allKeywords = [...pattern.keywords.en, ...pattern.keywords.bn];

    for (const keyword of allKeywords) {
      if (language === 'bn') {
        if (normalizedBn.includes(keyword) || lowerMessage.includes(keyword.toLowerCase())) {
          score += pattern.priority;
        }
      } else {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          score += pattern.priority;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestIntent = pattern.intent;
    }
  }

  // Extract course name if intent is course-related
  if (['course_list', 'course_fee', 'course_details'].includes(bestIntent)) {
    courseName = extractCourseName(message);
  }

  // Calculate confidence (0-1)
  const confidence = bestScore > 0 ? Math.min(bestScore / 20, 1) : 0;

  return {
    intent: bestScore > 0 ? bestIntent : 'unknown',
    confidence,
    language,
    courseName,
  };
}
