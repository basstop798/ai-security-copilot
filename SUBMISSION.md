# 📮 SUBMISSION.md — تسليم المشروع (نموذج Google Form، مو GitHub لحاله)

> مصدر: صفحة onboarding الرسمية (قرأتها 27 سبتمبر، وقت الحدث). هذا **تحديث** عن BUILD_DAY القديم.

## 🆕 أشياء جديدة ما كانت واضحة قبل
1. **التسليم Google Form واحد**، فيه روابط + معلومات، **مو رفع على GitHub وخلاص**.
2. **لازم رابط "Presentation" منفصل عن الفيديو** (عرض تقديمي / Slides). لازم نسويه.
3. **لازم رابط Source Code** يشتغل لأي شخص يفتحه (لو الريبو خاص، أضف صلاحية للمراجع).
4. **فيه اختيار جوائز:** جائزة أساسية واحدة من قائمة، وممكن تأكد على جوائز شركاء إضافية (checkbox) لو تنطبق، مع 2-3 جمل تفسير لكل واحدة.
5. **إفشاء الذكاء الاصطناعي:** تكتب بالتفصيل: أي نماذج/أدوات/بيانات استخدمت، قيود الوصول، مساهمة الـ AI الحقيقية، والخطة الاحتياطية. Brev: تكتب "لم نستخدمه" بصراحة.
6. **اختبر كل رابط في نافذة Incognito أو حساب ثاني** قبل التسليم — الشرط موجود بالنص.
7. **العرض المباشر بس للفائزين الثلاثة** (19:15–19:45). يعني تسليمك (النموذج + الفيديو) هو الحكم الفعلي.

## ✅ الرابط
`https://docs.google.com/forms/d/e/1FAIpQLSebmyKeBPv2mrmy4T_wI2_z9SBjjSTZ-O-_ewiWs6PBEikRjw/viewform`
لازم تستخدم **نفس اسم الفريق وإيميل القائد** اللي سجّلته في Final Team Confirmation.

## 🔗 الروابط الجاهزة (انسخها مباشرة بالنموذج)
- **رابط النموذج الشغّال (Live app):** `https://app-sigma-nine-87.vercel.app`
  (تأكدنا منه بمتصفح حقيقي 27 سبتمبر: يفحص أي دومين حقيقي + الديمو + 3 لغات، كله شغّال فعلياً على الإنترنت)
- **رابط الكود المصدري:** `https://github.com/basstop798/ai-security-copilot` (عام، تأكدنا يفتح ✅)
- **رابط العرض التقديمي (Slides):** لسا ناقص — جهّزه بعد الفيديو
- **رابط فيديو 90 ثانية:** لسا ناقص — أهم شي بعد كذا

## 📋 الحقول المطلوبة (جهّزها قبل 17:00)
- [ ] اسم الفريق + إيميل القائد (نفسهم من التسجيل)
- [ ] الدولة + المكان (أو ONLINE)
- [ ] **عنوان المشروع** + **ملخص ≤150 كلمة** (شوف القالب تحت)
- [ ] المشكلة + الحل + المزايا الأساسية + التقنيات + الخطوة القادمة
- [ ] **رابط النموذج الشغّال** (التطبيق المنشور)
- [ ] **رابط الكود المصدري** (GitHub — تأكد الوصول)
- [ ] **رابط العرض التقديمي (Slides)** ← جديد، لسا ما جهّزناه
- [ ] **رابط فيديو 90 ثانية** (YouTube Unlisted)
- [ ] اختيار الجائزة الأساسية + جوائز شركاء (لو تنطبق) + سبب الانطباق
- [ ] إفشاء الذكاء الاصطناعي (فقرة، شوف القالب تحت)

## 📝 قالب الملخص (≤150 كلمة)
> "We help small business owners and non-technical users in Africa check if their website is
> safe. Our prototype lets them type their domain, confirm consent, and get a plain-language
> security report in Arabic, French or English within seconds, with a prioritized action plan
> (today / this week / this month). We use NVIDIA NIM (primary) and Gemini (fallback) to
> explain findings and translate them — the severity and technical facts come from a local
> knowledge base grounded in NIST/OWASP/MITRE sources, so the model cannot invent
> vulnerabilities. We tested it on public security-testing sites (e.g. demo.testfire.net) and
> observed correct detection of expired certificates, missing security headers and email
> spoofing risk. Current limitations: passive checks only, four categories, no continuous
> monitoring yet. Next step: scheduled re-checks, alerts, and more African languages."

## 🤖 قالب إفشاء الذكاء الاصطناعي
> "Models: NVIDIA NIM (primary, via build.nvidia.com API) and Google Gemini (fallback).
> Stack: Next.js/TypeScript, Zod for output validation, a local JSON knowledge base
> (33 entries, NIST/OWASP/MITRE-sourced) for grounding. AI contribution: the model writes the
> plain-language explanation, translation and remediation steps for findings our code already
> detected and classified — it does not decide severity or invent vulnerabilities. Access:
> free-tier API keys, no NVIDIA Brev (solo participant; no heavy compute need). Fallback: if
> NVIDIA NIM fails, we retry with Gemini; if both fail, a local rule-based summary is served,
> and a pre-captured demo result is available offline. We validate every AI response against a
> schema and retry once on failure."

## 🏆 الجوائز (قرار سريع)
- **الأساسية:** **Country podium only** (الافتراضي — كل مشروع مؤهل مقيّم تلقائياً له).
- **جوائز شركاء ممكن تنطبق** (اختياري، اذكرها لو عندك وقت تكتب سبب):
  - **EY Studio+ Human-Centred Innovation** — منتج واضح المشكلة وسهل الاستخدام لغير المختصين.
  - **Artefact Data & AI Award** — نحوّل بيانات فحص خام إلى تقرير عملي بخطة تنفيذ.
  - **CompTIA Skills & Technical Readiness** — لو حابب تذكر رحلتك التقنية (بوتكامب + هاكاثون).
- ⚠️ **لا تأشّر أكثر من 2-3.** كل جائزة تحتاج سبب مكتوب، وهذا وقت تصرفه بدل البناء.

## ⏰ آخر شي قبل الضغط على "Submit"
افتح **الرابط المنشور، رابط الكود، رابط الفيديو، رابط العرض** في **نافذة Incognito** (بدون تسجيل دخولك) وتأكد كلها تفتح.
