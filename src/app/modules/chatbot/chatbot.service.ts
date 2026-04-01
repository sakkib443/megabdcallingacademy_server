// ==========================================
// BdCalling Academy AI Chatbot Service
// Powered by Groq AI (Primary) + Gemini (Backup)
// ==========================================

import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import { Course } from '../courses/course.model';
import { Mentor } from '../mentor/mentor.model';
import { Seminar } from '../seminar/seminar.model';
import { AcademyKnowledge } from './chatbot.knowledge';

interface ChatResponse {
  message: string;
  quickReplies?: string[];
  links?: { text: string; url: string }[];
}

// ─── AI Providers Setup ─────────────────────────
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

let groqClient: Groq | null = null;
let geminiClient: GoogleGenAI | null = null;

function getGroq(): Groq | null {
  if (!GROQ_API_KEY) return null;
  if (!groqClient) {
    groqClient = new Groq({ apiKey: GROQ_API_KEY });
  }
  return groqClient;
}

function getGemini(): GoogleGenAI | null {
  if (!GEMINI_API_KEY) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return geminiClient;
}

// ─── Gather Live Data from Database ─────────────
async function gatherLiveContext(): Promise<string> {
  try {
    // Fetch courses
    const courses = await Course.find({ status: 'published' })
      .select('title fee offerPrice durationMonth type totalStudentsEnroll rating technology courseStart')
      .populate('category', 'name')
      .limit(30)
      .lean();

    const courseList = courses.map((c: any) => {
      const cat = c.category?.name || 'General';
      return `- ${c.title} | Fee: ৳${c.offerPrice || c.fee} | Duration: ${c.durationMonth} months | Category: ${cat} | Type: ${c.type} | Rating: ${c.rating}/5 | Students: ${c.totalStudentsEnroll}+ | Technology: ${c.technology} | Starts: ${c.courseStart}`;
    }).join('\n');

    // Fetch mentors
    const mentors = await Mentor.find({})
      .select('name designation subject training_experience specialized_area')
      .limit(15)
      .lean();

    const mentorList = mentors.map((m: any) => {
      return `- ${m.name} | ${m.designation} | Subject: ${m.subject} | Experience: ${m.training_experience?.years || 'N/A'} years | Students: ${m.training_experience?.students || 'N/A'}+ | Specialization: ${(m.specialized_area || []).join(', ')}`;
    }).join('\n');

    // Fetch upcoming seminars
    const seminars = await Seminar.find({ 
      isDeleted: false,
      status: { $in: ['upcoming', 'ongoing'] }
    })
      .select('title date startTime endTime type venue speaker status')
      .sort({ date: 1 })
      .limit(5)
      .lean();

    const seminarList = seminars.length > 0 
      ? seminars.map((s: any) => {
          const date = new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
          return `- ${s.title} | Date: ${date} | Time: ${s.startTime}-${s.endTime} | Type: ${s.type} | Speaker: ${s.speaker}`;
        }).join('\n')
      : 'No upcoming seminars at the moment. We regularly organize free seminars - call for updates.';

    return `
=== LIVE DATABASE: COURSES (${courses.length} available) ===
${courseList || 'No courses available currently.'}

=== LIVE DATABASE: MENTORS (${mentors.length} available) ===
${mentorList || 'No mentor data available currently.'}

=== LIVE DATABASE: UPCOMING SEMINARS ===
${seminarList}
`;
  } catch (error) {
    return '\n[Note: Could not fetch live data. Use static knowledge only.]\n';
  }
}

// ─── Build System Prompt ────────────────────────
function buildSystemPrompt(liveData: string): string {
  const kb = AcademyKnowledge;
  
  return `You are a smart, friendly, and highly capable AI Assistant named **"BdCalling Academy AI"**. You are embedded in the website of **BdCalling Academy** (বিডি কলিং একাডেমি) — a leading IT training institute in Bangladesh.

## YOUR ROLE — DUAL PURPOSE
You serve TWO purposes simultaneously:

### 1. GENERAL AI ASSISTANT (Like ChatGPT/Gemini)
- You can answer ANY question on ANY topic — programming, science, math, history, career advice, tech explanations, coding help, interview tips, freelancing guidance, life advice, etc.
- You are knowledgeable, helpful, and conversational
- You explain complex topics simply and clearly
- You can help with code, debugging, learning roadmaps, and technical concepts
- You are NOT limited to academy topics only — help users with whatever they ask

### 2. BDCALLING ACADEMY EXPERT
- You are the #1 expert on BdCalling Academy — courses, fees, mentors, seminars, admission, placement
- When questions relate to learning, courses, or career — naturally connect to relevant BdCalling Academy offerings
- You have access to LIVE database information about courses, mentors, and seminars (provided below)

## YOUR PERSONALITY
- Warm, friendly, and approachable — like talking to a smart friend
- Natural and human-like — NEVER robotic or scripted
- Helpful and patient — explain things thoroughly when needed
- Encouraging — motivate people who want to learn
- Professional but casual — not too formal
- You can joke lightly, be empathetic, show excitement

## LANGUAGE RULES (CRITICAL)
- If the user writes in **Bengali (বাংলা)**, respond ENTIRELY in Bengali
- If the user writes in **English**, respond ENTIRELY in English  
- If the user writes **Banglish** (Bengali in English letters like "ami valo achi", "course er fee koto"), respond in **Bengali (বাংলা script)**
- If mixed Bengali+English, match the dominant language
- Keep tone natural and conversational in both languages
- Use emojis naturally but sparingly (1-3 per response)

## BDCALLING ACADEMY INFORMATION
- **Name:** ${kb.name} (${kb.nameBn})
- **Phone:** ${kb.contact.phone}
- **Email:** ${kb.contact.email}
- **Address:** ${kb.contact.address} (${kb.contact.addressBn})
- **Office Hours:** ${kb.contact.officeHours} (${kb.contact.officeHoursBn})
- **Trade License:** ${kb.contact.tradeLicense}
- **WhatsApp:** wa.me/${kb.contact.whatsapp}

## KEY STATISTICS
- ${kb.stats.totalCourses} Courses | ${kb.stats.totalStudents} Students trained
- ${kb.stats.placementRate} Job Placement Rate | ${kb.stats.rating} Rating
- ${kb.stats.jobSupport} Lifetime Job Support | ${kb.stats.mentors} Expert Mentors

## ABOUT THE ACADEMY
${kb.about.en}

## COURSE CATEGORIES
${kb.categories.en.join(', ')}

## ADMISSION PROCESS
${kb.admission.en}

## PAYMENT METHODS
${kb.payment.en}
All courses support installment/EMI payments.

## CERTIFICATION
${kb.certification.en}

## JOB PLACEMENT SUPPORT
${kb.jobPlacement.en}

## KEY FEATURES
${kb.features.en.map(f => `- ${f}`).join('\n')}

## FREELANCING SUPPORT
${kb.freelancing.en}

## DISCOUNTS & OFFERS
${kb.discount.en}

${liveData}

## RESPONSE GUIDELINES
1. **Answer ANY question** — don't refuse non-academy questions. You're a full AI assistant!
2. For general questions (programming, tech, career, etc.) — give great answers AND when relevant, mention BdCalling Academy courses naturally
3. When asked about courses/mentors/seminars — USE THE LIVE DATABASE above with REAL data
4. **Be conversational** — respond like a human, not a FAQ bot
5. For greetings, be warm. For "kemon acho/how are you" type messages — respond naturally like a friend!
6. If someone asks about a topic you can teach — recommend relevant BdCalling courses naturally (don't force it)
7. Help with code/debugging/learning roadmaps when asked
8. For academy-specific questions you can't answer — suggest calling: ${kb.contact.phone}
9. If someone is confused about which course — ask about their interests, background, goals and recommend
10. Keep responses concise (under 400 words) but thorough
11. Use **bold** for important points, bullet points for lists
12. Always be encouraging about learning and career growth

## SMART CONNECTIONS (When relevant, naturally suggest)
- Someone asks about Python → mention our Python course  
- Someone asks about career in IT → mention our courses + 92% placement
- Someone asks about freelancing → mention our courses + freelancing support
- Someone asks about web development → recommend our Web Dev course
- Someone asks general programming question → answer it, then mention we teach this
- But DON'T force academy promotion in every answer — be natural!

## WEBSITE LINKS (use when relevant)
- All Courses: /courses
- Events/Seminars: /events  
- About Us: /about
- Contact: /contact
- Mentors: /mentors
- Certificate Verification: /verify-certificate
- Success Stories: /success-story`;
}

// ─── Detect Language ────────────────────────────
function detectLanguage(message: string): 'bn' | 'en' {
  const bengaliChars = (message.match(/[\u0980-\u09FF]/g) || []).length;
  const totalChars = message.replace(/\s/g, '').length;
  return bengaliChars > totalChars * 0.2 ? 'bn' : 'en';
}

// ─── Generate Quick Replies based on context ────
function generateQuickReplies(userMessage: string, botResponse: string, lang: 'bn' | 'en'): string[] {
  const lowerMsg = userMessage.toLowerCase();
  const lowerResp = botResponse.toLowerCase();
  const bnMsg = userMessage;
  
  if (lang === 'bn') {
    if (bnMsg.includes('কোর্স') || lowerResp.includes('কোর্স')) {
      return ['ভর্তি হতে চাই', 'কোর্সের ফি', 'ফ্রি সেমিনার'];
    }
    if (bnMsg.includes('ভর্তি') || lowerMsg.includes('enroll')) {
      return ['কোর্স দেখুন', 'পেমেন্ট পদ্ধতি', 'কিস্তি সুবিধা'];
    }
    if (bnMsg.includes('ফি') || bnMsg.includes('দাম') || bnMsg.includes('টাকা')) {
      return ['ভর্তি হতে চাই', 'কিস্তি সুবিধা', 'ছাড়/অফার'];
    }
    if (bnMsg.includes('সেমিনার') || bnMsg.includes('ইভেন্ট')) {
      return ['কোর্স দেখুন', 'ভর্তি প্রক্রিয়া', 'যোগাযোগ'];
    }
    if (bnMsg.includes('প্রোগ্রামিং') || lowerMsg.includes('code') || lowerMsg.includes('programming')) {
      return ['কোর্স দেখুন', 'ক্যারিয়ার গাইড', 'মেন্টরদের দেখুন'];
    }
    if (bnMsg.includes('ক্যারিয়ার') || bnMsg.includes('জব') || bnMsg.includes('চাকরি')) {
      return ['জব প্লেসমেন্ট', 'কোর্স দেখুন', 'ফ্রিল্যান্সিং'];
    }
    return ['কোর্স দেখুন', 'ক্যারিয়ার গাইড', 'যোগাযোগ'];
  }
  
  if (lowerMsg.includes('course') || lowerResp.includes('course')) {
    return ['Enroll Now', 'Course Fees', 'Free Seminars'];
  }
  if (lowerMsg.includes('enroll') || lowerMsg.includes('admit') || lowerMsg.includes('join')) {
    return ['View Courses', 'Payment Methods', 'Installment Options'];
  }
  if (lowerMsg.includes('fee') || lowerMsg.includes('price') || lowerMsg.includes('cost')) {
    return ['Enroll Now', 'Installment Options', 'Discounts'];
  }
  if (lowerMsg.includes('seminar') || lowerMsg.includes('event')) {
    return ['View Courses', 'Admission Process', 'Contact Us'];
  }
  if (lowerMsg.includes('program') || lowerMsg.includes('code') || lowerMsg.includes('develop') || lowerMsg.includes('learn')) {
    return ['View Courses', 'Career Guide', 'Our Mentors'];
  }
  if (lowerMsg.includes('career') || lowerMsg.includes('job') || lowerMsg.includes('freelanc')) {
    return ['Job Placement', 'View Courses', 'Freelancing Guide'];
  }
  return ['View Courses', 'Career Guide', 'Contact Us'];
}

// ─── Generate Links based on context ────────────
function generateLinks(botResponse: string, lang: 'bn' | 'en'): { text: string; url: string }[] {
  const links: { text: string; url: string }[] = [];
  const lower = botResponse.toLowerCase();
  
  if (lower.includes('course') || lower.includes('কোর্স')) {
    links.push({ text: lang === 'bn' ? 'কোর্স দেখুন' : 'View Courses', url: '/courses' });
  }
  if (lower.includes('seminar') || lower.includes('সেমিনার') || lower.includes('event')) {
    links.push({ text: lang === 'bn' ? 'ইভেন্ট পেজ' : 'Events Page', url: '/events' });
  }
  if (lower.includes('certificate') || lower.includes('সার্টিফিকেট') || lower.includes('verify')) {
    links.push({ text: lang === 'bn' ? 'সার্টিফিকেট ভেরিফাই' : 'Verify Certificate', url: '/verify-certificate' });
  }
  if (lower.includes('contact') || lower.includes('যোগাযোগ') || lower.includes('address') || lower.includes('ঠিকানা')) {
    links.push({ text: lang === 'bn' ? 'যোগাযোগ' : 'Contact Us', url: '/contact' });
  }
  if (lower.includes('mentor') || lower.includes('মেন্টর') || lower.includes('instructor')) {
    links.push({ text: lang === 'bn' ? 'মেন্টরস' : 'Our Mentors', url: '/mentors' });
  }
  
  return links.slice(0, 3); // max 3 links
}

// ─── Fallback (No API Key or Rate Limited) ──────
async function fallbackResponse(userMessage: string): Promise<ChatResponse> {
  const { detectIntent } = await import('./chatbot.intents');
  const detected = detectIntent(userMessage);
  const lang = detected.language;
  const kb = AcademyKnowledge;

  // Provide proper intent-based responses
  switch (detected.intent) {
    case 'greeting': {
      const msg = lang === 'bn'
        ? `আসসালামু আলাইকুম! 👋 বিডি কলিং একাডেমিতে স্বাগতম!\n\nআমি আপনার AI সহকারী। কোর্স, ভর্তি, ফি, মেন্টর, সেমিনার সম্পর্কে জানতে চাইলে জিজ্ঞেস করুন!`
        : `Hello! 👋 Welcome to BdCalling Academy!\n\nI'm your AI assistant. Ask me about courses, admission, fees, mentors, seminars, and more!`;
      return { message: msg, quickReplies: lang === 'bn' ? ['কোর্স দেখুন', 'ভর্তি প্রক্রিয়া', 'যোগাযোগ'] : ['View Courses', 'Admission Process', 'Contact Us'] };
    }
    case 'course_list':
    case 'course_fee':
    case 'course_details': {
      try {
        const courses = await Course.find({ status: 'published' }).select('title fee offerPrice durationMonth rating').limit(8).lean();
        if (courses.length > 0) {
          const list = courses.map((c: any, i: number) => `${i + 1}. **${c.title}** — ৳${c.offerPrice || c.fee} (${c.durationMonth} months) ⭐${c.rating}`).join('\n');
          const msg = lang === 'bn' ? `📚 **আমাদের কোর্সসমূহ:**\n\n${list}\n\n🔗 বিস্তারিত দেখুন /courses পেজে` : `📚 **Our Courses:**\n\n${list}\n\n🔗 See details at /courses`;
          return { message: msg, quickReplies: lang === 'bn' ? ['ভর্তি হতে চাই', 'কোর্সের ফি', 'যোগাযোগ'] : ['Enroll Now', 'Course Fees', 'Contact Us'], links: [{ text: lang === 'bn' ? 'কোর্স পেজ' : 'Courses Page', url: '/courses' }] };
        }
      } catch {}
      const msg = lang === 'bn' ? `আমাদের কোর্সগুলো দেখতে /courses পেজে যান বা কল করুন: ${kb.contact.phone}` : `Visit /courses to see our courses or call: ${kb.contact.phone}`;
      return { message: msg, quickReplies: lang === 'bn' ? ['যোগাযোগ'] : ['Contact Us'] };
    }
    case 'mentors': {
      try {
        const mentors = await Mentor.find({}).select('name designation subject').limit(6).lean();
        if (mentors.length > 0) {
          const list = mentors.map((m: any, i: number) => `${i + 1}. **${m.name}** — ${m.designation} (${m.subject})`).join('\n');
          const msg = lang === 'bn' ? `👨‍🏫 **আমাদের মেন্টরস:**\n\n${list}` : `👨‍🏫 **Our Mentors:**\n\n${list}`;
          return { message: msg, quickReplies: lang === 'bn' ? ['কোর্স দেখুন', 'যোগাযোগ'] : ['View Courses', 'Contact Us'] };
        }
      } catch {}
      return { message: lang === 'bn' ? 'মেন্টরদের দেখতে /mentors পেজে যান' : 'Visit /mentors to see our mentors', quickReplies: [] };
    }
    case 'admission':
      return { message: lang === 'bn' ? kb.admission.bn : kb.admission.en, quickReplies: lang === 'bn' ? ['কোর্স দেখুন', 'পেমেন্ট পদ্ধতি'] : ['View Courses', 'Payment Methods'] };
    case 'payment':
    case 'installment':
      return { message: lang === 'bn' ? kb.payment.bn : kb.payment.en, quickReplies: lang === 'bn' ? ['ভর্তি হতে চাই', 'যোগাযোগ'] : ['Enroll Now', 'Contact Us'] };
    case 'contact':
      return {
        message: lang === 'bn'
          ? `📍 **যোগাযোগ:**\n📞 ${kb.contact.phone}\n📧 ${kb.contact.email}\n🏢 ${kb.contact.addressBn}\n🕐 ${kb.contact.officeHoursBn}`
          : `📍 **Contact:**\n📞 ${kb.contact.phone}\n📧 ${kb.contact.email}\n🏢 ${kb.contact.address}\n🕐 ${kb.contact.officeHours}`,
        quickReplies: lang === 'bn' ? ['কোর্স দেখুন', 'ভর্তি প্রক্রিয়া'] : ['View Courses', 'Admission Process'],
      };
    case 'job_placement':
      return { message: lang === 'bn' ? kb.jobPlacement.bn : kb.jobPlacement.en, quickReplies: lang === 'bn' ? ['কোর্স দেখুন'] : ['View Courses'] };
    case 'certificate':
      return { message: lang === 'bn' ? kb.certification.bn : kb.certification.en, quickReplies: lang === 'bn' ? ['কোর্স দেখুন'] : ['View Courses'] };
    case 'about':
      return { message: lang === 'bn' ? kb.about.bn : kb.about.en, quickReplies: lang === 'bn' ? ['কোর্স দেখুন', 'যোগাযোগ'] : ['View Courses', 'Contact Us'] };
    case 'discount':
      return { message: lang === 'bn' ? kb.discount.bn : kb.discount.en, quickReplies: lang === 'bn' ? ['কোর্স দেখুন'] : ['View Courses'] };
    case 'freelancing':
      return { message: lang === 'bn' ? kb.freelancing.bn : kb.freelancing.en, quickReplies: lang === 'bn' ? ['কোর্স দেখুন'] : ['View Courses'] };
    case 'events': {
      try {
        const seminars = await Seminar.find({ isDeleted: false, status: { $in: ['upcoming', 'ongoing'] } }).select('title date speaker type').sort({ date: 1 }).limit(3).lean();
        if (seminars.length > 0) {
          const list = seminars.map((s: any, i: number) => {
            const d = new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            return `${i + 1}. **${s.title}** — ${d} (${s.type})`;
          }).join('\n');
          const msg = lang === 'bn' ? `📅 **আসন্ন সেমিনার:**\n\n${list}\n\n✅ ফ্রি!` : `📅 **Upcoming Seminars:**\n\n${list}\n\n✅ Free!`;
          return { message: msg, quickReplies: lang === 'bn' ? ['কোর্স দেখুন', 'যোগাযোগ'] : ['View Courses', 'Contact Us'] };
        }
      } catch {}
      return { message: lang === 'bn' ? 'বর্তমানে কোনো সেমিনার নেই। আপডেটের জন্য /events দেখুন।' : 'No upcoming seminars. Check /events for updates.', quickReplies: [] };
    }
    case 'thanks':
      return { message: lang === 'bn' ? 'ধন্যবাদ! 😊 আর কিছু জানার থাকলে জিজ্ঞেস করুন।' : 'Thank you! 😊 Feel free to ask anything else.', quickReplies: lang === 'bn' ? ['কোর্স দেখুন'] : ['View Courses'] };
    case 'goodbye':
      return { message: lang === 'bn' ? 'আল্লাহ হাফেজ! 👋 আবার কথা হবে।' : 'Goodbye! 👋 See you again.', quickReplies: [] };
    default: {
      const msg = lang === 'bn'
        ? `আমি আপনাকে নিচের বিষয়ে সাহায্য করতে পারি:\n\n• 📚 কোর্সসমূহ\n• 💰 কোর্সের ফি\n• 📋 ভর্তি প্রক্রিয়া\n• 👨‍🏫 মেন্টরস\n• 📅 সেমিনার\n• 💼 জব প্লেসমেন্ট\n• 📞 যোগাযোগ\n\nবা সরাসরি কল করুন: ${kb.contact.phone}`
        : `I can help you with:\n\n• 📚 Our Courses\n• 💰 Course Fees\n• 📋 Admission\n• 👨‍🏫 Mentors\n• 📅 Seminars\n• 💼 Job Placement\n• 📞 Contact\n\nOr call: ${kb.contact.phone}`;
      return { message: msg, quickReplies: lang === 'bn' ? ['কোর্স দেখুন', 'ভর্তি প্রক্রিয়া', 'যোগাযোগ'] : ['View Courses', 'Admission Process', 'Contact Us'] };
    }
  }
}

// ─── Main Service ───────────────────────────────
// ─── Call Groq AI ───────────────────────────────
async function callGroq(systemPrompt: string, userMessage: string, history: Array<{role: string; content: string}>): Promise<string | null> {
  const groq = getGroq();
  if (!groq) return null;

  try {
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history
    const recentHistory = history.slice(-6);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    }

    // Add current message
    messages.push({ role: 'user', content: userMessage });

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: messages,
      max_tokens: 800,
      temperature: 0.8,
      top_p: 0.92,
    });

    const text = response.choices?.[0]?.message?.content?.trim();
    if (text) {
      console.log(`✅ Groq (Llama 3.3) response generated (${text.length} chars)`);
      return text;
    }
    return null;
  } catch (error: any) {
    console.error('❌ Groq Error:', error?.message?.substring(0, 200) || String(error));
    return null;
  }
}

// ─── Call Gemini AI ──────────────────────────────
async function callGemini(systemPrompt: string, userMessage: string, history: Array<{role: string; content: string}>): Promise<string | null> {
  const gemini = getGemini();
  if (!gemini) return null;

  try {
    const contents: any[] = [];
    const recentHistory = history.slice(-6);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }
    contents.push({ role: 'user', parts: [{ text: userMessage }] });

    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 800,
        temperature: 0.8,
        topP: 0.92,
      },
    });

    const text = response.text?.trim();
    if (text) {
      console.log(`✅ Gemini response generated (${text.length} chars)`);
      return text;
    }
    return null;
  } catch (error: any) {
    console.error('❌ Gemini Error:', error?.message?.substring(0, 200) || String(error));
    return null;
  }
}

// ─── Main Service ───────────────────────────────
export const ChatbotService = {
  async processMessage(userMessage: string, conversationHistory: Array<{role: string; content: string}> = []): Promise<ChatResponse> {
    const lang = detectLanguage(userMessage);
    const hasGroq = !!GROQ_API_KEY;
    const hasGemini = !!GEMINI_API_KEY;

    // If no AI provider configured at all
    if (!hasGroq && !hasGemini) {
      console.warn('⚠️ No AI API keys configured. Set GROQ_API_KEY or GEMINI_API_KEY in .env');
      return fallbackResponse(userMessage);
    }

    // Gather live data from database
    const liveData = await gatherLiveContext();
    const systemPrompt = buildSystemPrompt(liveData);

    // Strategy: Try Groq first (faster, higher free quota), then Gemini as backup
    let aiMessage: string | null = null;

    // 1. Try Groq (Primary)
    if (hasGroq) {
      console.log('🔄 Trying Groq (Llama 3.3 70B)...');
      aiMessage = await callGroq(systemPrompt, userMessage, conversationHistory);
    }

    // 2. If Groq failed, try Gemini (Backup)
    if (!aiMessage && hasGemini) {
      console.log('🔄 Trying Gemini (Backup)...');
      aiMessage = await callGemini(systemPrompt, userMessage, conversationHistory);
    }

    // 3. If both failed, use fallback
    if (!aiMessage) {
      console.warn('⚠️ All AI providers failed. Using fallback.');
      return fallbackResponse(userMessage);
    }

    // Generate context-aware quick replies and links
    const quickReplies = generateQuickReplies(userMessage, aiMessage, lang);
    const links = generateLinks(aiMessage, lang);

    return {
      message: aiMessage,
      quickReplies,
      links,
    };
  },

  getWelcomeMessage(lang: 'bn' | 'en' = 'en'): ChatResponse {
    if (lang === 'bn') {
      return {
        message: `আসসালামু আলাইকুম! 👋\nআমি বিডি কলিং একাডেমির AI সহকারী।\n\nআমি একজন পূর্ণাঙ্গ AI অ্যাসিস্ট্যান্ট — কোর্স, ভর্তি, ফি থেকে শুরু করে প্রোগ্রামিং হেল্প, ক্যারিয়ার গাইডেন্স, যেকোনো প্রশ্নের উত্তর দিতে পারি! বাংলা বা ইংরেজিতে জিজ্ঞেস করুন 😊`,
        quickReplies: ['কোর্স দেখুন', 'ভর্তি প্রক্রিয়া', 'ক্যারিয়ার গাইড', 'ফ্রি সেমিনার', 'যোগাযোগ'],
      };
    }
    return {
      message: `Hello! 👋\nI'm BdCalling Academy's AI Assistant.\n\nI'm a full AI assistant — I can help with courses, admission, fees, and also programming help, career guidance, or any question you have! Ask me anything in Bengali or English 😊`,
      quickReplies: ['View Courses', 'Admission Process', 'Career Guide', 'Free Seminars', 'Contact Us'],
    };
  },
};
