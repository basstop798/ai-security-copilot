/**
 * Localized, human-readable text for every finding kind, in all three report
 * languages.
 *
 * Why this exists: the passive checks in `checks.ts` write their titles in
 * English, because a title is also a machine-facing label. The report is for
 * a shop owner in Algiers or Oran who may read only Arabic or French, so
 * displaying "Missing strict-transport-security header" to them is a defect
 * — and before this module, every finding title in the report was English
 * whatever language was selected.
 *
 * The offline path matters just as much. When no AI provider answers (no key,
 * a daily free-tier quota, or a stalled call), `ai.ts` falls back to this
 * table instead of asking a model. That fallback used to splice the English
 * title into a templated Arabic sentence; now it is real, specific, written
 * advice in the chosen language. The app therefore produces a complete,
 * correctly-localized report with no network and no API key at all.
 *
 * This is presentation text only. It never decides severity, and it never
 * adds a technical claim beyond what the check observed: the citation for
 * each finding still comes from `cve-kb.json` via `grounding.ts`.
 */

import type { ReportLanguage } from './types';
import { findingKind } from './grounding';

type Text = { title: string; impact: string; fix: string };
type LocalizedText = Record<ReportLanguage, Text>;

/** `{name}` is replaced with the live cookie name for cookie findings. */
const FINDING_TEXT: Record<string, LocalizedText> = {
  // -------------------------------------------------------------- TLS ------
  'tls-no-https': {
    en: {
      title: 'Site is not reachable over a secure connection (HTTPS)',
      impact:
        'Visitors cannot reach your site over an encrypted connection, so anything they type — passwords, phone numbers, orders — can be read by anyone on the same network. Browsers also show your site as "Not secure".',
      fix: 'Ask your web developer or hosting provider to install a TLS certificate and serve the site over HTTPS. A free certificate from Let\'s Encrypt is enough.',
    },
    fr: {
      title: 'Le site n\'est pas accessible en connexion sécurisée (HTTPS)',
      impact:
        'Les visiteurs ne peuvent pas accéder à votre site via une connexion chiffrée : tout ce qu\'ils saisissent — mots de passe, numéros de téléphone, commandes — peut être lu par n\'importe qui sur le même réseau. Les navigateurs affichent aussi « Non sécurisé ».',
      fix: 'Demandez à votre développeur ou à votre hébergeur d\'installer un certificat TLS et de servir le site en HTTPS. Un certificat gratuit Let\'s Encrypt suffit.',
    },
    ar: {
      title: 'الموقع غير متاح عبر اتصال آمن (HTTPS)',
      impact:
        'لا يستطيع الزوار الوصول إلى موقعك عبر اتصال مشفَّر، لذلك كل ما يكتبونه — كلمات المرور وأرقام الهاتف والطلبات — يمكن أن يقرأه أي شخص على نفس الشبكة. كما تُظهر المتصفحات موقعك بعلامة «غير آمن».',
      fix: 'اطلب من مطوّر موقعك أو من شركة الاستضافة تركيب شهادة TLS وتشغيل الموقع عبر HTTPS. شهادة مجانية من Let\'s Encrypt تكفي.',
    },
  },
  'tls-cert-expired': {
    en: {
      title: 'The security certificate (HTTPS) has expired',
      impact:
        'Most visitors now see a full-page browser warning telling them your site is unsafe, and many will leave immediately. Customers cannot tell this apart from a real attack.',
      fix: 'Renew the certificate today, then turn on automatic renewal so it cannot expire again.',
    },
    fr: {
      title: 'Le certificat de sécurité (HTTPS) a expiré',
      impact:
        'La plupart des visiteurs voient maintenant un avertissement en pleine page indiquant que votre site est dangereux, et beaucoup partiront aussitôt. Vos clients ne peuvent pas distinguer cela d\'une véritable attaque.',
      fix: 'Renouvelez le certificat aujourd\'hui, puis activez le renouvellement automatique pour que cela ne se reproduise pas.',
    },
    ar: {
      title: 'شهادة الأمان (HTTPS) منتهية الصلاحية',
      impact:
        'يرى معظم الزوار الآن تحذيراً يملأ الشاشة يقول إن موقعك غير آمن، وكثير منهم سيغادر فوراً. ولا يستطيع عميلك التمييز بين هذا وبين هجوم حقيقي.',
      fix: 'جدّد الشهادة اليوم، ثم شغّل التجديد التلقائي حتى لا تنتهي مرة أخرى.',
    },
  },
  'tls-cert-expiring-soon': {
    en: {
      title: 'The security certificate (HTTPS) expires soon',
      impact:
        'Nothing is broken yet. If the certificate lapses, every visitor will get a browser security warning and your site will look untrustworthy or broken.',
      fix: 'Renew the certificate before the date passes, and switch on automatic renewal so you do not have to remember next time.',
    },
    fr: {
      title: 'Le certificat de sécurité (HTTPS) expire bientôt',
      impact:
        'Rien n\'est cassé pour l\'instant. Si le certificat expire, chaque visiteur recevra un avertissement de sécurité et votre site paraîtra peu fiable ou hors service.',
      fix: 'Renouvelez le certificat avant la date d\'expiration et activez le renouvellement automatique.',
    },
    ar: {
      title: 'شهادة الأمان (HTTPS) ستنتهي قريباً',
      impact:
        'لا يوجد خلل حتى الآن. لكن إذا انتهت الشهادة، سيظهر لكل زائر تحذير أمني في المتصفح وسيبدو موقعك غير موثوق أو معطّلاً.',
      fix: 'جدّد الشهادة قبل انتهاء تاريخها، وشغّل التجديد التلقائي حتى لا تحتاج إلى تذكّر الأمر في المرة القادمة.',
    },
  },
  'tls-http-not-redirected': {
    en: {
      title: 'The site does not send visitors to the secure version automatically',
      impact:
        'Someone who types your address without "https" stays on the unencrypted version, so their connection is readable on the network even though your site supports HTTPS.',
      fix: 'Ask your developer to redirect all HTTP traffic to HTTPS, then add the Strict-Transport-Security header.',
    },
    fr: {
      title: 'Le site ne redirige pas automatiquement vers la version sécurisée',
      impact:
        'Une personne qui tape votre adresse sans « https » reste sur la version non chiffrée : sa connexion est lisible sur le réseau, même si votre site gère HTTPS.',
      fix: 'Demandez à votre développeur de rediriger tout le trafic HTTP vers HTTPS, puis d\'ajouter l\'en-tête Strict-Transport-Security.',
    },
    ar: {
      title: 'الموقع لا ينقل الزوار تلقائياً إلى النسخة الآمنة',
      impact:
        'من يكتب عنوان موقعك بدون «https» يبقى على النسخة غير المشفَّرة، فيصبح اتصاله قابلاً للقراءة على الشبكة رغم أن موقعك يدعم HTTPS.',
      fix: 'اطلب من مطوّرك تحويل كل زيارات HTTP إلى HTTPS، ثم إضافة رأس Strict-Transport-Security.',
    },
  },
  'headers-served-over-http': {
    en: {
      title: 'The site is served over an unencrypted connection (HTTP)',
      impact:
        'The page itself travels in the clear, so anyone on the same Wi-Fi or network path can read it or alter what your visitors see.',
      fix: 'Serve the whole site over HTTPS and redirect HTTP to HTTPS.',
    },
    fr: {
      title: 'Le site est servi en connexion non chiffrée (HTTP)',
      impact:
        'La page circule en clair : toute personne sur le même Wi-Fi ou sur le trajet réseau peut la lire ou modifier ce que voient vos visiteurs.',
      fix: 'Servez tout le site en HTTPS et redirigez le HTTP vers le HTTPS.',
    },
    ar: {
      title: 'الموقع يُفتح عبر اتصال غير مشفَّر (HTTP)',
      impact:
        'الصفحة نفسها تنتقل بدون تشفير، لذلك يمكن لأي شخص على نفس شبكة الواي-فاي أو على مسار الاتصال أن يقرأها أو يغيّر ما يراه زوارك.',
      fix: 'شغّل الموقع بالكامل عبر HTTPS وحوّل كل زيارات HTTP إلى HTTPS.',
    },
  },
  'headers-unreachable': {
    en: {
      title: 'We could not check the security headers',
      impact:
        'This is about our check, not about your site: the homepage did not answer in time, so we could not read its security settings. It does not mean anything is wrong.',
      fix: 'Check that the site is online and try again. If it is behind a firewall or blocks unknown visitors, that can also cause this.',
    },
    fr: {
      title: 'Nous n\'avons pas pu vérifier les en-têtes de sécurité',
      impact:
        'Ceci concerne notre vérification, pas votre site : la page d\'accueil n\'a pas répondu à temps, nous n\'avons donc pas pu lire ses réglages de sécurité. Cela ne signifie pas qu\'il y a un problème.',
      fix: 'Vérifiez que le site est en ligne et réessayez. Un pare-feu ou un blocage des visiteurs inconnus peut aussi en être la cause.',
    },
    ar: {
      title: 'لم نتمكّن من فحص إعدادات الأمان (رؤوس الأمان)',
      impact:
        'هذا يتعلّق بفحصنا لا بموقعك: الصفحة الرئيسية لم تستجب في الوقت المحدّد، فلم نتمكّن من قراءة إعدادات الأمان. وهذا لا يعني وجود مشكلة.',
      fix: 'تأكّد أن الموقع يعمل وأعد المحاولة. وجود جدار حماية أو حجب للزوار غير المعروفين قد يسبّب ذلك أيضاً.',
    },
  },

  // ---------------------------------------------------------- Headers ------
  'header-missing-hsts': {
    en: {
      title: 'Missing protection that forces the secure connection (HSTS)',
      impact:
        'Returning visitors can still be pushed onto an unencrypted connection by an attacker on the network before the redirect happens.',
      fix: 'Ask your developer to add the Strict-Transport-Security response header, once HTTPS is working everywhere.',
    },
    fr: {
      title: 'Protection forçant la connexion sécurisée absente (HSTS)',
      impact:
        'Un attaquant sur le réseau peut encore faire basculer vos visiteurs fidèles sur une connexion non chiffrée avant que la redirection n\'ait lieu.',
      fix: 'Demandez à votre développeur d\'ajouter l\'en-tête Strict-Transport-Security, une fois le HTTPS en place partout.',
    },
    ar: {
      title: 'لا توجد حماية تُلزم المتصفح بالاتصال الآمن (HSTS)',
      impact:
        'لا يزال من الممكن لمهاجم على الشبكة أن يدفع الزوار المتكرّرين إلى اتصال غير مشفَّر قبل أن يحدث التحويل إلى HTTPS.',
      fix: 'اطلب من مطوّرك إضافة رأس Strict-Transport-Security بعد التأكّد أن HTTPS يعمل في كل صفحات الموقع.',
    },
  },
  'header-missing-csp': {
    en: {
      title: 'Missing rule limiting what code may run on your pages (CSP)',
      impact:
        'If any part of your site or an outside script is compromised, injected code can run freely on your pages — stealing form data or redirecting your customers.',
      fix: 'Ask your developer to add a Content-Security-Policy header listing only the sources your site really loads from.',
    },
    fr: {
      title: 'Règle limitant le code exécutable absente (CSP)',
      impact:
        'Si une partie de votre site ou un script externe est compromis, du code injecté peut s\'exécuter librement sur vos pages : vol de données de formulaire ou redirection de vos clients.',
      fix: 'Demandez à votre développeur d\'ajouter un en-tête Content-Security-Policy n\'autorisant que les sources réellement utilisées.',
    },
    ar: {
      title: 'لا توجد قاعدة تحدّ من الأكواد التي تعمل في صفحاتك (CSP)',
      impact:
        'إذا اختُرق جزء من موقعك أو سكربت خارجي، يمكن لكود مزروع أن يعمل بحرية في صفحاتك فيسرق بيانات النماذج أو يحوّل عملاءك إلى موقع آخر.',
      fix: 'اطلب من مطوّرك إضافة رأس Content-Security-Policy يسمح فقط بالمصادر التي يحتاجها موقعك فعلاً.',
    },
  },
  'header-missing-x-frame-options': {
    en: {
      title: 'Your pages can be embedded inside another website',
      impact:
        'Someone can load your site invisibly inside their own page and trick your customers into clicking things they did not intend — a scam known as clickjacking.',
      fix: 'Ask your developer to add the X-Frame-Options header (or frame-ancestors in your Content-Security-Policy).',
    },
    fr: {
      title: 'Vos pages peuvent être intégrées dans un autre site',
      impact:
        'Quelqu\'un peut charger votre site de façon invisible dans sa propre page et pousser vos clients à cliquer sur des éléments à leur insu — une arnaque appelée clickjacking.',
      fix: 'Demandez à votre développeur d\'ajouter l\'en-tête X-Frame-Options (ou frame-ancestors dans la CSP).',
    },
    ar: {
      title: 'يمكن تضمين صفحاتك داخل موقع آخر',
      impact:
        'يستطيع شخص ما تحميل موقعك بشكل غير مرئي داخل صفحته، ثم يخدع عملاءك فيضغطون على أشياء لم يقصدوها — وهي حيلة تُعرف بـ clickjacking.',
      fix: 'اطلب من مطوّرك إضافة رأس X-Frame-Options (أو frame-ancestors داخل Content-Security-Policy).',
    },
  },
  'header-missing-x-content-type-options': {
    en: {
      title: 'Browsers are allowed to guess the type of your files',
      impact:
        'A file uploaded as an image can be treated as a script instead, which turns a harmless upload into a way to run code on your visitors.',
      fix: 'Ask your developer to add the header X-Content-Type-Options: nosniff.',
    },
    fr: {
      title: 'Les navigateurs peuvent deviner le type de vos fichiers',
      impact:
        'Un fichier envoyé comme image peut être traité comme un script : un envoi anodin devient un moyen d\'exécuter du code chez vos visiteurs.',
      fix: 'Demandez à votre développeur d\'ajouter l\'en-tête X-Content-Type-Options: nosniff.',
    },
    ar: {
      title: 'المتصفحات مسموح لها بتخمين نوع ملفاتك',
      impact:
        'ملف مرفوع كصورة قد يُعامل كسكربت، فيتحوّل رفعٌ بريء إلى وسيلة لتشغيل كود على أجهزة زوارك.',
      fix: 'اطلب من مطوّرك إضافة الرأس X-Content-Type-Options: nosniff.',
    },
  },
  'header-missing-referrer-policy': {
    en: {
      title: 'Your page addresses are shared with other websites',
      impact:
        'When a visitor clicks a link out of your site, the full address they came from is sent along, which can leak private pages or customer identifiers.',
      fix: 'Ask your developer to add a Referrer-Policy header, for example strict-origin-when-cross-origin.',
    },
    fr: {
      title: 'Les adresses de vos pages sont transmises à d\'autres sites',
      impact:
        'Quand un visiteur clique sur un lien sortant, l\'adresse complète d\'où il venait est transmise, ce qui peut révéler des pages privées ou des identifiants de clients.',
      fix: 'Demandez à votre développeur d\'ajouter un en-tête Referrer-Policy, par exemple strict-origin-when-cross-origin.',
    },
    ar: {
      title: 'عناوين صفحاتك تُرسَل إلى مواقع أخرى',
      impact:
        'عندما يضغط زائر على رابط يخرج من موقعك، يُرسَل العنوان الكامل الذي جاء منه، وهذا قد يكشف صفحات خاصة أو معرّفات عملاء.',
      fix: 'اطلب من مطوّرك إضافة رأس Referrer-Policy، مثل strict-origin-when-cross-origin.',
    },
  },

  // ------------------------------------------------------------ Email ------
  'email-no-spf': {
    en: {
      title: 'Nothing stops strangers sending email in your name (no SPF)',
      impact:
        'Anyone can send email that looks like it comes from your domain. Scammers use this to invoice your customers or ask your staff for payments and passwords.',
      fix: 'Ask whoever manages your domain to publish an SPF record listing only the services allowed to send your mail.',
    },
    fr: {
      title: 'Rien n\'empêche l\'envoi d\'e-mails en votre nom (SPF absent)',
      impact:
        'N\'importe qui peut envoyer des e-mails qui semblent venir de votre domaine. Les escrocs s\'en servent pour facturer vos clients ou demander des paiements et mots de passe à vos employés.',
      fix: 'Demandez au gestionnaire de votre domaine de publier un enregistrement SPF n\'autorisant que vos services d\'envoi légitimes.',
    },
    ar: {
      title: 'لا شيء يمنع الغرباء من إرسال بريد باسمك (لا يوجد SPF)',
      impact:
        'يستطيع أي شخص إرسال بريد يبدو أنه قادم من نطاقك. يستغل المحتالون ذلك لإرسال فواتير لعملائك أو لطلب أموال وكلمات مرور من موظفيك.',
      fix: 'اطلب من مسؤول نطاقك نشر سجل SPF يحدّد فقط الخدمات المسموح لها بإرسال بريدك.',
    },
  },
  'email-spf-permissive': {
    en: {
      title: 'Your email settings allow any sender in the world (+all)',
      impact:
        'This is worse than having no protection: your domain openly tells mail servers that every machine on the internet may send email as you.',
      fix: 'Ask your domain manager to change the end of the SPF record from +all to -all, keeping only your real sending services.',
    },
    fr: {
      title: 'Vos réglages e-mail autorisent n\'importe quel expéditeur (+all)',
      impact:
        'C\'est pire qu\'une absence de protection : votre domaine indique ouvertement aux serveurs de messagerie que toute machine sur Internet peut envoyer des e-mails en votre nom.',
      fix: 'Demandez à votre gestionnaire de domaine de remplacer +all par -all à la fin de l\'enregistrement SPF, en ne gardant que vos services d\'envoi réels.',
    },
    ar: {
      title: 'إعدادات بريدك تسمح لأي مُرسل في العالم (+all)',
      impact:
        'هذا أسوأ من عدم وجود حماية: نطاقك يُعلن لخوادم البريد أن أي جهاز على الإنترنت يمكنه إرسال بريد باسمك.',
      fix: 'اطلب من مسؤول نطاقك تغيير نهاية سجل SPF من +all إلى -all، مع الإبقاء على خدمات الإرسال الحقيقية فقط.',
    },
  },
  'email-no-dmarc': {
    en: {
      title: 'No rule tells mail servers what to do with fake email (no DMARC)',
      impact:
        'Even if someone forges your address, receiving mail servers have no instruction to reject it, and you never find out that it happened.',
      fix: 'Ask your domain manager to add a DMARC record, starting with p=none plus a reporting address, then tighten it to p=reject.',
    },
    fr: {
      title: 'Aucune règle n\'indique quoi faire des faux e-mails (DMARC absent)',
      impact:
        'Même si quelqu\'un falsifie votre adresse, les serveurs destinataires n\'ont aucune consigne pour la rejeter, et vous n\'en êtes jamais informé.',
      fix: 'Demandez à votre gestionnaire de domaine d\'ajouter un enregistrement DMARC, d\'abord p=none avec une adresse de rapport, puis p=reject.',
    },
    ar: {
      title: 'لا توجد قاعدة تُخبر خوادم البريد كيف تتعامل مع البريد المزيّف (لا يوجد DMARC)',
      impact:
        'حتى إذا انتحل أحدهم عنوانك، لا توجد تعليمات لخوادم البريد المستقبِلة برفضه، ولن تعرف أبداً أن ذلك حدث.',
      fix: 'اطلب من مسؤول نطاقك إضافة سجل DMARC، يبدأ بـ p=none مع عنوان للتقارير، ثم شدّده إلى p=reject.',
    },
  },
  'email-dmarc-p-none': {
    en: {
      title: 'Your email rule only watches, it does not block (p=none)',
      impact:
        'Forged email claiming to be from you is still delivered to your customers. The rule records it but does nothing to stop it.',
      fix: 'Review your DMARC reports, confirm your real senders pass, then move the policy to p=quarantine and finally p=reject.',
    },
    fr: {
      title: 'Votre règle e-mail observe seulement, elle ne bloque pas (p=none)',
      impact:
        'Les e-mails falsifiés en votre nom arrivent toujours chez vos clients. La règle les enregistre mais ne les empêche pas.',
      fix: 'Examinez vos rapports DMARC, vérifiez que vos expéditeurs légitimes passent, puis passez la politique à p=quarantine et enfin p=reject.',
    },
    ar: {
      title: 'قاعدة بريدك تراقب فقط ولا تمنع (p=none)',
      impact:
        'البريد المزيّف الذي يُنسَب إليك ما زال يُسلَّم إلى عملائك. القاعدة تسجّله لكنها لا تفعل شيئاً لإيقافه.',
      fix: 'راجع تقارير DMARC، وتأكّد أن مُرسليك الحقيقيين يمرّون، ثم انقل السياسة إلى p=quarantine وأخيراً p=reject.',
    },
  },

  // ---------------------------------------------------------- Cookies ------
  'cookie-no-httponly': {
    en: {
      title: 'The cookie "{name}" can be read by scripts on the page',
      impact:
        'If any script on your site is ever compromised, it can read this cookie and sign in as your logged-in users.',
      fix: 'Ask your developer to set the HttpOnly flag on this cookie, along with Secure and SameSite.',
    },
    fr: {
      title: 'Le cookie « {name} » est lisible par les scripts de la page',
      impact:
        'Si un script de votre site est un jour compromis, il peut lire ce cookie et se connecter à la place de vos utilisateurs.',
      fix: 'Demandez à votre développeur d\'activer l\'attribut HttpOnly sur ce cookie, ainsi que Secure et SameSite.',
    },
    ar: {
      title: 'الكوكي "{name}" يمكن للسكربتات في الصفحة قراءته',
      impact:
        'إذا اختُرق أي سكربت في موقعك يوماً، يمكنه قراءة هذا الكوكي وتسجيل الدخول بهوية المستخدمين المسجّلين.',
      fix: 'اطلب من مطوّرك تشغيل خاصية HttpOnly على هذا الكوكي، مع Secure و SameSite.',
    },
  },
  'cookie-no-secure': {
    en: {
      title: 'The cookie "{name}" can travel over an unencrypted connection',
      impact:
        'This cookie may be sent over plain HTTP, where anyone on the network can capture it and use it to take over the session.',
      fix: 'Ask your developer to set the Secure flag on this cookie so it is only ever sent over HTTPS.',
    },
    fr: {
      title: 'Le cookie « {name} » peut circuler sans chiffrement',
      impact:
        'Ce cookie peut être envoyé en HTTP simple, où toute personne sur le réseau peut le capturer et détourner la session.',
      fix: 'Demandez à votre développeur d\'activer l\'attribut Secure sur ce cookie pour qu\'il ne soit envoyé qu\'en HTTPS.',
    },
    ar: {
      title: 'الكوكي "{name}" قد ينتقل عبر اتصال غير مشفَّر',
      impact:
        'قد يُرسَل هذا الكوكي عبر HTTP عادي، حيث يستطيع أي شخص على الشبكة اعتراضه واستخدامه للسيطرة على الجلسة.',
      fix: 'اطلب من مطوّرك تشغيل خاصية Secure على هذا الكوكي حتى لا يُرسَل إلا عبر HTTPS.',
    },
  },
  'cookie-no-samesite': {
    en: {
      title: 'The cookie "{name}" has no cross-site restriction (SameSite)',
      impact:
        'Another website can make your logged-in visitor perform an action on your site without meaning to, such as changing a setting or placing an order.',
      fix: 'Ask your developer to set SameSite=Lax (or Strict for sensitive areas) on this cookie.',
    },
    fr: {
      title: 'Le cookie « {name} » n\'a aucune restriction inter-sites (SameSite)',
      impact:
        'Un autre site peut amener votre visiteur connecté à effectuer une action sur votre site sans le vouloir, comme modifier un réglage ou passer une commande.',
      fix: 'Demandez à votre développeur de définir SameSite=Lax (ou Strict pour les zones sensibles) sur ce cookie.',
    },
    ar: {
      title: 'الكوكي "{name}" بدون قيد على الاستخدام من مواقع أخرى (SameSite)',
      impact:
        'يمكن لموقع آخر أن يجعل زائرك المسجّل ينفّذ عملية في موقعك دون أن يقصد، مثل تغيير إعداد أو إنشاء طلب.',
      fix: 'اطلب من مطوّرك ضبط SameSite=Lax (أو Strict للأقسام الحسّاسة) على هذا الكوكي.',
    },
  },
};

/**
 * The live cookie name out of a cookie finding id
 * (`cookie-JSESSIONID-no-secure` -> `JSESSIONID`). Cookie names may contain
 * hyphens, so only the known prefix and flag suffix are stripped.
 */
export function cookieNameFromId(findingId: string): string | null {
  if (!findingId.startsWith('cookie-')) return null;
  for (const flag of ['no-httponly', 'no-secure', 'no-samesite']) {
    const suffix = `-${flag}`;
    if (findingId.endsWith(suffix)) {
      const name = findingId.slice('cookie-'.length, findingId.length - suffix.length);
      return name || null;
    }
  }
  return null;
}

function fill(template: string, findingId: string): string {
  if (!template.includes('{name}')) return template;
  return template.replace('{name}', cookieNameFromId(findingId) ?? 'cookie');
}

/**
 * Localized text for a finding, or null if this kind has no entry — callers
 * then keep whatever the check itself produced rather than inventing text.
 */
export function findingText(findingId: string, language: ReportLanguage): Text | null {
  const entry = FINDING_TEXT[findingKind(findingId)];
  if (!entry) return null;
  const text = entry[language];
  return {
    title: fill(text.title, findingId),
    impact: fill(text.impact, findingId),
    fix: fill(text.fix, findingId),
  };
}

/** Localized title, falling back to the check's own English title. */
export function localizedTitle(
  findingId: string,
  language: ReportLanguage,
  fallbackTitle: string,
): string {
  return findingText(findingId, language)?.title ?? fallbackTitle;
}

/** Exported for tests: every finding kind this table covers. */
export const LOCALIZED_FINDING_KINDS = Object.keys(FINDING_TEXT);
