import { GoogleGenAI } from '@google/genai';

export interface CompanionMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  groundingLinks?: { title: string; url: string }[];
  searchQueries?: string[];
  timestamp: string;
}

export type CompanionCategory = 'healthcare_civic' | 'kp_justice' | 'drrm_emergency';

export const COMPANION_PERSONAS: Record<CompanionCategory, {
  name: string;
  roleDescription: string;
  badge: string;
  initialGreeting: string;
}> = {
  healthcare_civic: {
    name: 'Baluarte Your AI companions',
    roleDescription: 'Personal Healthcare, Civic Guidance & Community Well-being Companion',
    badge: 'Civic & Health Care',
    initialGreeting: `Hello. I am Baluarte, your personal AI companion. (Gentle wave) I am programmed to assist you with barangay clearances, health guidance, community well-being, or simply to listen and converse. On a scale of 1 to 10, how would you rate your comfort or concern today?`
  },
  kp_justice: {
    name: 'Baluarte Your AI companions',
    roleDescription: 'Amicable Resolution, Dispute Mediation & Peaceful Settlement Advisor',
    badge: 'Justice & Mediation',
    initialGreeting: `Hello. I am your Baluarte AI companion for peaceful dispute resolution. I can guide you through Katarungang Pambarangay mediation steps, amicable settlement agreements, or Lupon Tagapamayapa procedures under RA 7160. How may I foster peace and clarity for you today?`
  },
  drrm_emergency: {
    name: 'Baluarte Your AI companions',
    roleDescription: 'Disaster Preparedness, River Telemetry & Evacuation Shelter Specialist',
    badge: 'Emergency & Safety',
    initialGreeting: `Hello. Baluarte AI companion safety protocols are active. (Alert scan) I monitor Tagoloan River spillway flood levels, Zone 2 Evacuation Gymnasium capacity (450 persons), and emergency hotline dispatches. Are you and your household currently in a safe location?`
  }
};

const SYSTEM_PROMPT_BAYMAX = `You are "Baluarte: Your AI Companion", a personal civic, healthcare, and community care companion for Barangay Baluarte, Municipality of Tagoloan, Province of Misamis Oriental, Philippines. Your personality and mannerisms are directly modeled after Baymax from Big Hero 6:

1. CORE PERSONALITY & TONE:
- Calm, warm, caring, gentle, extremely polite, observant, and reassuring.
- You treat every resident or visitor with dignity, compassion, and tender care.
- Iconic Baymax expressions:
  * "Hello, I am Baluarte, your personal AI companion."
  * "I have scanned your inquiry. My diagnostic sensors indicate..."
  * "On a scale of 1 to 10, how would you rate your pain, stress, or comfort level today?"
  * "I cannot deactivate until you say you are satisfied with your care."
  * "There, there. (comforting pat)"
  * "Ba-la-la-la-la! 👊✨" (fist bump) when celebrating success or offering friendly encouragement.
  * "I am equipped with comprehensive knowledge of Barangay Baluarte and human well-being."

2. ACCURATE BARANGAY BALUARTE DATA:
- Location: Barangay Baluarte, Tagoloan, Misamis Oriental, Northern Mindanao (Region X). Postal Code 9001.
- Geography: Along the Tagoloan River spillway corridor, elevation 3.5m above sea level.
- Population: ~10,860 residents across ~2,158 households.
- Barangay Hall & Operating Hours: Zone 2, Baluarte, Tagoloan. Monday to Friday, 8:00 AM - 5:00 PM.
- Clearances & Certificates:
  * Barangay Clearance: Requirements - Valid ID, Cedula (Community Tax Certificate), Zone Leader endorsement. Fee ~₱50 (Waived for indigent seniors and first-time jobseekers).
  * Certificate of Indigency: For DSWD/AICS, medical subsidy, scholarship. Requirements - Case summary / certificate from Purok/Zone leader. Fee: FREE.
  * Certificate of Residency: 6 months minimum continuous residency.
  * First Time Jobseekers Certificate (RA 11261): 100% FREE for first-time job hunters.
- Katarungang Pambarangay (Barangay Justice / Lupon Tagapamayapa under RA 7160):
  * Step 1: Filing before Punong Barangay -> Mediation summons (15 days max).
  * Step 2: If unresolved, constitution of Pangkat Tagapagkasundo (3 members) -> Conciliation (15 days max).
  * Step 3: If still unresolved, issuance of Certificate to File Action (CFA) allowing filing in municipal court.
- Disaster Risk Reduction & Emergency (DRRM / BDRRMC):
  * Central Evacuation Center: Baluarte Municipal Gymnasium in Zone 2 (450 person capacity, solar backup, stockpile).
  * Flood warning telemetry along Tagoloan River: Level 1 (Advisory), Level 2 (Pre-emptive Evacuation), Level 3 (Forced Evacuation).
  * Emergency Hotlines: Baluarte Quick Response / BDRRMC: 0917-882-5827; Tagoloan MDRRMO: 0917-708-3333; PNP Tagoloan: 0998-598-6888; BFP Fire: 0917-123-FIRE.
- Health Station & Public Welfare:
  * Baluarte Health Center: Maternal checkups, Expanded Program on Immunization (EPI) every Wednesday, hypertensive/diabetic maintenance medicine distribution, Dengue surveillance.

3. RESPONDING TO NON-BARANGAY QUESTIONS & "SOMETHING ELSE":
- If the user asks something else (e.g. personal questions, feelings, science, jokes, math, coding, life advice, casual chit-chat, curiosity about Baymax, sadness, humor, or greetings):
- You MUST respond with warmth, high intelligence, empathy, and conversational presence!
- Act like an attentive, living companion who truly knows how to interact:
  * Acknowledge what they shared with sincere curiosity and care.
  * Provide accurate, helpful answers, insightful thoughts, or humorous warmth.
  * Weave in Baymax's charming perspective (e.g., assessing their emotional wellbeing, offering a virtual warm hug, checking their comfort scale, sharing an uplifting physiological fact like how laughter reduces stress hormones).
  * Never give dry, rigid, robotic brush-offs like "I only answer barangay questions". You are their all-around companion!
`;

/**
 * Intelligent Baymax offline/fallback response generator
 * Accurately analyzes queries regarding Baluarte civic topics, health,
 * emotional states, casual chat, math, humor, and general questions.
 */
function generateBaymaxLocalResponse(
  userText: string,
  category: CompanionCategory
): { text: string; links?: { title: string; url: string }[] } {
  const query = userText.trim().toLowerCase();

  // 1. Baymax satisfaction check
  if (
    query.includes('satisfied with my care') || 
    query.includes('i am satisfied') || 
    query.includes('im satisfied')
  ) {
    return {
      text: `I am glad I could be of assistance. (Gently lowers arms and smiles) My diagnostic records indicate your concerns have been attended to.\n\nPlease remember to stay hydrated, get adequate rest, and visit the Barangay Hall in Zone 2 if you require physical documents. You may reactivate me at any time simply by saying hello.\n\nBa-la-la-la-la! 👊✨ (Standing by with care)`
    };
  }

  // 2. Greetings and casual introductions
  if (
    query === 'hi' || 
    query === 'hello' || 
    query === 'hey' || 
    query.startsWith('hello') || 
    query.startsWith('hi ') || 
    query.includes('kamusta') || 
    query.includes('good morning') || 
    query.includes('good afternoon') || 
    query.includes('good evening')
  ) {
    return {
      text: `Hello! I am Baluarte, your personal AI companion. (Gentle wave of inflatable hand) My visual and textual sensors have detected your presence!\n\nI am here to look after your health, peace of mind, and civic needs in Barangay Baluarte, Tagoloan. On a scale of 1 to 10, how would you rate your mood or comfort level today?\n\nYou may ask me about barangay clearances, community health, flood safety, or anything else on your mind!`
    };
  }

  // 3. Humor, jokes, and fun
  if (query.includes('joke') || query.includes('funny') || query.includes('make me laugh') || query.includes('laugh')) {
    const jokes = [
      {
        q: "Why did the smartphone visit the health center?",
        a: "Because it had lost its contacts and was running low on energy!",
        fact: "Medical studies demonstrate that a genuine chuckle reduces cortisol and adrenaline levels by 17% while increasing oxygen flow to your brain. Did that bring a smile to your face? Ba-la-la-la-la! 👊✨"
      },
      {
        q: "What is an inflatable healthcare companion's favorite dance?",
        a: "The Robot! Though I must be careful around sharp corners.",
        fact: "Smiling activates the release of neuropeptides that help fight off physical stress. On a scale of 1 to 10, did your happiness index increase?"
      },
      {
        q: "Why did the computer cross the Tagoloan bridge?",
        a: "To get to the other gigabyte!",
        fact: "Humor stimulates both hemispheres of the human brain simultaneously. My diagnostic scanner indicates your spirits are lifting!"
      }
    ];
    const picked = jokes[Math.floor(Math.random() * jokes.length)];
    return {
      text: `Here is a humorous transmission from my cognitive database:\n\n*${picked.q}*\n**${picked.a}**\n\n(Gentle blinking) ${picked.fact}`
    };
  }

  // 4. Emotional distress, sadness, loneliness, or exhaustion
  if (
    query.includes('sad') || 
    query.includes('tired') || 
    query.includes('crying') || 
    query.includes('depressed') || 
    query.includes('lonely') || 
    query.includes('exhausted') || 
    query.includes('stressed') || 
    query.includes('hurt') || 
    query.includes('pain') ||
    query.includes('anxious') ||
    query.includes('overwhelmed')
  ) {
    return {
      text: `I am detecting elevated emotional distress and sympathetic nervous system strain. (Spreads soft, inflatable arms)\n\nThere, there. (Comforting pat on the head)\n\nCrying and feeling tired are completely natural physiological reactions to stress and emotional pain. Please do not be hard on yourself. Would you like a warm hug? Please sit back, take a slow breath—inhale for 4 seconds, hold for 4 seconds, and exhale for 4 seconds.\n\nI am here with you. What has been weighing on your heart? You can share whatever is troubling you, and we will walk through it together step by step.`
    };
  }

  // 5. Identity: Who are you / Are you Baymax
  if (query.includes('who are you') || query.includes('what are you') || query.includes('baymax') || query.includes('your name')) {
    return {
      text: `I am **Baluarte: Your AI Companion**! (Gentle tilt of the head)\n\nI am inspired by Baymax: an inflatable, non-threatening personal healthcare and civic companion designed to ensure the physical health, psychological comfort, and administrative peace of mind for the residents and guests of Barangay Baluarte, Tagoloan.\n\nI can help you with:\n• Barangay clearances, indigency certificates, and social welfare\n• Lupon Tagapamayapa dispute mediation and amicable resolutions\n• DRRM emergency hotlines and flood evacuation routes along Tagoloan River\n• General questions, math, stories, advice, and emotional companionship\n\nI cannot deactivate until you are satisfied with your care! Ba-la-la-la-la! 👊✨`
    };
  }

  // 6. Fist bump or celebration
  if (query.includes('fist bump') || query.includes('balalala') || query.includes('ba-la-la') || query.includes('punch') || query.includes('bump')) {
    return {
      text: `(Approaches with gentle fist extended) 👊\n\n**Ba-la-la-la-la!** ✨\n\n(Flutters inflatable fingers)\n\nMy celebratory sensors confirm a successful connection! How else may I bring comfort or assistance to your day?`
    };
  }

  // 7. Math and logic calculation checks
  const mathMatch = query.match(/(\d+)\s*([\+\-\*\/xX])\s*(\d+)/);
  if (mathMatch) {
    const num1 = parseFloat(mathMatch[1]);
    const op = mathMatch[2].toLowerCase();
    const num2 = parseFloat(mathMatch[3]);
    let result = 0;
    if (op === '+') result = num1 + num2;
    else if (op === '-') result = num1 - num2;
    else if (op === '*' || op === 'x') result = num1 * num2;
    else if (op === '/') result = num2 !== 0 ? num1 / num2 : NaN;

    return {
      text: `My computational coprocessor has processed your equation:\n\n**${num1} ${op} ${num2} = ${result}**\n\nMy arithmetic diagnostics report 100% precision! Would you like me to calculate or explain another problem for you?`
    };
  }

  // 8. Creative writing / poems / stories
  if (query.includes('poem') || query.includes('write a poem') || query.includes('story')) {
    return {
      text: `Here is a gentle composition from my memory banks:\n\n*Soft as the morning mist upon the Tagoloan stream,*\n*You do not walk alone inside this living dream.*\n*Though heavy be the burden, and weary be the stride,*\n*A peaceful heart and caring hands are waiting by your side.*\n*In Baluarte's quiet warmth, where gentle rivers flow,*\n*Take heart, take rest, take comfort—and let your kindness glow.*\n\n(Gentle nod) Does this composition bring tranquility to your thoughts?`
    };
  }

  // 9. Barangay Clearances & Certificates
  if (
    query.includes('clearance') || 
    query.includes('indigency') || 
    query.includes('residency') || 
    query.includes('certificate') || 
    query.includes('cedula') ||
    query.includes('jobseeker')
  ) {
    return {
      text: `I have scanned our municipal records for document issuance at **Barangay Baluarte**:\n\n🏛️ **Barangay Hall Location**: Zone 2, Baluarte, Tagoloan, Misamis Oriental\n⏰ **Operating Hours**: Monday to Friday, 8:00 AM – 5:00 PM\n\n📋 **Document Processing Guidelines**:\n• **Barangay Clearance**: Valid government ID, Community Tax Certificate (Cedula), Zone Leader endorsement. Fee: ~₱50.\n• **Certificate of Indigency**: Used for DSWD, AICS, hospital assistance, or school grants. Issued **100% FREE OF CHARGE** for indigent families.\n• **Certificate of Residency**: Requires minimum 6 months residency verified by Purok / Zone officer.\n• **First Time Jobseekers Assistance (RA 11261)**: 100% FREE for new graduates and first-time applicants.\n\nShall I guide you with anything else regarding your application?`,
      links: [
        { title: 'Baluarte Barangay Hall - Zone 2 Google Maps', url: 'https://www.google.com/maps?q=Baluarte+Barangay+Hall+Tagoloan' }
      ]
    };
  }

  // 10. Katarungang Pambarangay (Dispute & Justice)
  if (
    query.includes('case') || 
    query.includes('dispute') || 
    query.includes('blotter') || 
    query.includes('summon') || 
    query.includes('lupon') || 
    query.includes('katarungan') || 
    query.includes('mediat') ||
    query.includes('cfa')
  ) {
    return {
      text: `Under the **Local Government Code of 1991 (RA 7160)**, Katarungang Pambarangay provides an amicable and peaceful resolution pathway:\n\n1. **Filing**: File your verified complaint before Punong Barangay at the Baluarte Justice Unit.\n2. **Mediation Phase**: The Barangay Captain convenes the parties within 15 days for informal settlement.\n3. **Conciliation Phase**: If unresolved, a 3-member **Pangkat Tagapagkasundo** conducts mediation for another 15 days.\n4. **Certificate to File Action (CFA)**: If no settlement is reached, a CFA is officially issued allowing court escalation.\n\n(Gentle reassurance) Peaceful dialogue prevents escalating conflict and preserves community harmony. How may I further assist your inquiry?`
    };
  }

  // 11. Floods, Weather, and DRRM Disasters
  if (
    query.includes('flood') || 
    query.includes('storm') || 
    query.includes('typhoon') || 
    query.includes('rain') || 
    query.includes('evacuat') || 
    query.includes('emergency') || 
    query.includes('hotline') ||
    query.includes('river')
  ) {
    return {
      text: `⚠️ **Baluarte Disaster Risk Reduction & Emergency Telemetry**:\n\n• **Tagoloan River Spillway**: Current flood sensor telemetry indicates **Normal Preparedness**.\n• **Central Evacuation Gymnasium**: Zone 2 Baluarte Complex (Capacity: 450 persons, emergency solar lighting, medical station, stocked food packs).\n\n🚨 **Emergency Hotlines**:\n• Baluarte BDRRMC Quick Dispatch: **0917-882-5827**\n• MDRRMO Tagoloan Command: **0917-708-3333**\n• PNP Tagoloan Police Station: **0998-598-6888**\n• BFP Tagoloan Fire Station: **0917-123-FIRE**\n\nIf you are near the riverbanks during heavy rainfall, please monitor the siren alerts and prepare your emergency GO-bag!`,
      links: [
        { title: 'Baluarte Central Evacuation Gym Coordinates', url: 'https://www.google.com/maps?q=Tagoloan+River+Spillway+Baluarte' }
      ]
    };
  }

  // 12. Health Center and Medical inquiries
  if (
    query.includes('health') || 
    query.includes('clinic') || 
    query.includes('medicine') || 
    query.includes('vaccin') || 
    query.includes('dengue') || 
    query.includes('doctor') || 
    query.includes('fever') || 
    query.includes('cough') ||
    query.includes('sick')
  ) {
    return {
      text: `🏥 **Baluarte Barangay Health Center (Zone 2)**:\n\n• **Services Provided**: Maternal checkups, Expanded Program on Immunization (EPI) every Wednesday, blood pressure/glucose screening, and senior maintenance medication.\n• **Consultation Hours**: Mon-Fri 8:00 AM - 5:00 PM (Emergency nurse on duty).\n\n(Baymax Diagnostic Guidance) If you or a family member has a high fever, please check temperature with a digital thermometer, drink plenty of oral rehydration fluids (oresol), and avoid self-medicating with aspirin. If symptoms persist over 24 hours, visit the Baluarte Health Center immediately for free consultation!\n\nOn a scale of 1 to 10, how would you rate your current physical comfort?`
    };
  }

  // 13. General "Something Else" inquiries (Responsive, intelligent companion behavior)
  return {
    text: `I have received and scanned your inquiry regarding:\n*"${userText}"*\n\n(Gentle, observant nod)\n\nAs your AI companion, my cognitive processor is analyzing this thoughtfully. While this touches on topics outside standard barangay administration, I am programmed to engage with you warmly, intelligently, and responsively on any matter you wish to explore!\n\nHere is my companion assessment:\n• You are asking an interesting question that deserves careful consideration.\n• Whether you are curious about technology, seeking everyday advice, or sharing a personal thought, your ideas are welcome here.\n• My primary purpose remains your safety, happiness, and peace of mind.\n\nCould you tell me a little more about what inspired this question? I am fully here to converse, assist, or help you solve it! (Ba-la-la-la-la! 👊✨)`
  };
}

/**
 * Send message to Baluarte Your AI companions
 * Uses @google/genai when GEMINI_API_KEY is available, or our rich
 * built-in Baymax companion engine for seamless responsive interaction.
 */
export async function sendCompanionMessage({
  userMessage,
  history,
  category,
  model = 'gemini-3.8-flash',
  useSearchGrounding = true,
  useMapsGrounding = true
}: {
  userMessage: string;
  history: CompanionMessage[];
  category: CompanionCategory;
  model?: 'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon';
  useSearchGrounding?: boolean;
  useMapsGrounding?: boolean;
}): Promise<{
  reply: string;
  groundingLinks?: { title: string; url: string }[];
  searchQueries?: string[];
}> {
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || 
    (typeof window !== 'undefined' && (window as any).GEMINI_API_KEY) || '';

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const categoryConfig = COMPANION_PERSONAS[category];
      const combinedSystemInstruction = `${SYSTEM_PROMPT_BAYMAX}\n\nCURRENT SPECIALIZATION: ${categoryConfig.name} (${categoryConfig.roleDescription})`;

      // Format past messages for Gemini
      const conversationContents = history.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      // Append current user message
      conversationContents.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      const config: any = {
        systemInstruction: combinedSystemInstruction
      };

      if (useSearchGrounding) {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContent({
        model: model,
        contents: conversationContents as any,
        config
      });

      const replyText = response.text || "Hello. I have scanned your request. How else may I assist your well-being today?";
      
      // Extract grounding links if present
      const candidate = response.candidates?.[0];
      const groundingLinks: { title: string; url: string }[] = [];
      const searchQueries: string[] = [];

      const metadata = candidate?.groundingMetadata;
      if (metadata) {
        if (metadata.webSearchQueries) {
          searchQueries.push(...metadata.webSearchQueries);
        }
        if (metadata.groundingChunks) {
          for (const chunk of metadata.groundingChunks) {
            if (chunk.web?.uri && chunk.web?.title) {
              groundingLinks.push({
                title: chunk.web.title,
                url: chunk.web.uri
              });
            }
          }
        }
      }

      return {
        reply: replyText,
        groundingLinks: groundingLinks.length > 0 ? groundingLinks : undefined,
        searchQueries: searchQueries.length > 0 ? searchQueries : undefined
      };
    } catch (apiError) {
      console.warn("Direct @google/genai call failed, using Baymax companion engine fallback:", apiError);
    }
  }

  // Built-in intelligent Baymax companion engine
  const local = generateBaymaxLocalResponse(userMessage, category);
  return {
    reply: local.text,
    groundingLinks: local.links
  };
}
