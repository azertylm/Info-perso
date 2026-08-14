import React, { useState, useEffect } from "react";
import { 
  Keyboard, 
  Command, 
  Sparkles, 
  HelpCircle, 
  Info,
  CheckCircle2,
  Newspaper,
  Bot,
  Heart,
  Settings,
  Users,
  User,
  Sun,
  Moon,
  PlusCircle,
  Terminal,
  Grid
} from "lucide-react";
import { Language } from "../lib/i18n";

interface ShortcutsGuideProps {
  language: Language;
  displayMode: "sobre" | "pro" | "warm" | "cyber" | "fun";
  themeMode: "light" | "dark";
  onNotify: (msg: string) => void;
}

const LOCAL_TRANSLATIONS: Record<Language, {
  title: string;
  subtitle: string;
  categoryNav: string;
  categoryDesign: string;
  categoryActions: string;
  guideTitle: string;
  guideDesc: string;
  interactiveTitle: string;
  interactiveDesc: string;
  recentKeyPressed: string;
  pressAnyShort: string;
  shortcutEnabled: string;
  shortcutDisabled: string;
  shortcutsList: Array<{
    keys: string[];
    desc: string;
    actionLabel: string;
    id: string;
  }>;
}> = {
  fr: {
    title: "Centre des Raccourcis Clavier",
    subtitle: "Naviguez, personnalisez et interagissez à la vitesse de la pensée grâce à nos commandes physiques intégrées.",
    categoryNav: "Navigation Rapide",
    categoryDesign: "Style, Thème & Langues",
    categoryActions: "Actions de Curation",
    guideTitle: "Comment utiliser les raccourcis ?",
    guideDesc: "Maintenez la touche Alt (ou Option sur macOS) enfoncée, puis appuyez sur la lettre correspondante. Pour le Centre de Commandes, utilisez la combinaison universelle Ctrl + K ou Cmd + K.",
    interactiveTitle: "Moniteur d'Entrées Physique (Playground)",
    interactiveDesc: "Appuyez sur un raccourci ci-dessous pour le voir s'illuminer instantanément sur l'écran en temps réel !",
    recentKeyPressed: "Dernière combinaison détectée",
    pressAnyShort: "Pressez un raccourci clavier...",
    shortcutEnabled: "Raccourcis Clavier Actifs (Alt + Touche)",
    shortcutDisabled: "Désactiver les raccourcis",
    shortcutsList: [
      { id: "flux", keys: ["Alt", "H"], desc: "Aller au Flux d'actualités Cible", actionLabel: "Navigation Accueil" },
      { id: "chat", keys: ["Alt", "C"], desc: "Ouvrir l'Assistant Curation IA", actionLabel: "Chat IA" },
      { id: "donations", keys: ["Alt", "D"], desc: "Soutenir le Curation Base (Dons & RIB)", actionLabel: "Donations / RIB" },
      { id: "keys", keys: ["Alt", "K"], desc: "Configurer les clés API & la synchronisation", actionLabel: "Réglages API" },
      { id: "communaute", keys: ["Alt", "M"], desc: "Ouvrir l'Espace Communauté", actionLabel: "Communauté" },
      { id: "auth", keys: ["Alt", "A"], desc: "Se connecter / Gérer mon compte", actionLabel: "Mon Compte" },
      { id: "shortcuts", keys: ["Alt", "R"], desc: "Afficher ce guide des Raccourcis Clavier", actionLabel: "Raccourcis" },
      { id: "theme", keys: ["Alt", "T"], desc: "Alterner le thème (Sombre / Clair)", actionLabel: "Toggle Thème" },
      { id: "style", keys: ["Alt", "S"], desc: "Faire défiler les 5 styles (Sobre, Pro, Café, Cyber, Fun)", actionLabel: "Changer Style" },
      { id: "lang", keys: ["Alt", "L"], desc: "Faire défiler la langue (FR, EN, ES, ZH, etc.)", actionLabel: "Changer Langue" },
      { id: "new", keys: ["Alt", "N"], desc: "Ouvrir/Fermer le tiroir de publication cible d'article", actionLabel: "Publier Article" },
      { id: "profile", keys: ["Alt", "P"], desc: "Afficher le Score de Curiosité & les Badges", actionLabel: "Tiroir Profil" },
      { id: "spotlight", keys: ["Ctrl/Cmd", "K"], desc: "Ouvrir le Spotlight Command Center (Recherche globale)", actionLabel: "Spotlight Center" },
    ]
  },
  en: {
    title: "Keyboard Shortcuts Center",
    subtitle: "Navigate, customize and interact at the speed of thought with our integrated physical commands.",
    categoryNav: "Quick Navigation",
    categoryDesign: "Style, Theme & Languages",
    categoryActions: "Curation Actions",
    guideTitle: "How to use shortcuts?",
    guideDesc: "Hold down the Alt key (or Option on macOS), then press the corresponding letter. For the Command Center, use the universal combination Ctrl + K or Cmd + K.",
    interactiveTitle: "Physical Inputs Monitor (Playground)",
    interactiveDesc: "Press any shortcut below to see it instantly light up on the screen in real time!",
    recentKeyPressed: "Last combination detected",
    pressAnyShort: "Press a keyboard shortcut...",
    shortcutEnabled: "Keyboard Shortcuts Active (Alt + Key)",
    shortcutDisabled: "Disable shortcuts",
    shortcutsList: [
      { id: "flux", keys: ["Alt", "H"], desc: "Go to targeted News Feed", actionLabel: "Go Home / Feed" },
      { id: "chat", keys: ["Alt", "C"], desc: "Open AI Curation Assistant", actionLabel: "AI Chat" },
      { id: "donations", keys: ["Alt", "D"], desc: "Support the Curation Base (Dons & RIB)", actionLabel: "Dons / RIB" },
      { id: "keys", keys: ["Alt", "K"], desc: "Configure API keys & synchronization", actionLabel: "API Settings" },
      { id: "communaute", keys: ["Alt", "M"], desc: "Open the Community Space", actionLabel: "Community" },
      { id: "auth", keys: ["Alt", "A"], desc: "Log in / Manage my account", actionLabel: "My Account" },
      { id: "shortcuts", keys: ["Alt", "R"], desc: "Display this keyboard shortcuts guide", actionLabel: "Shortcuts" },
      { id: "theme", keys: ["Alt", "T"], desc: "Toggle theme (Dark / Light)", actionLabel: "Toggle Theme" },
      { id: "style", keys: ["Alt", "S"], desc: "Cycle through the 5 display styles", actionLabel: "Change Style" },
      { id: "lang", keys: ["Alt", "L"], desc: "Cycle active language (FR, EN, ES, ZH, etc.)", actionLabel: "Change Language" },
      { id: "new", keys: ["Alt", "N"], desc: "Open/Close custom article publication drawer", actionLabel: "Publish Article" },
      { id: "profile", keys: ["Alt", "P"], desc: "Display Curiosity Score & Badges drawer", actionLabel: "Profile Drawer" },
      { id: "spotlight", keys: ["Ctrl/Cmd", "K"], desc: "Open the Spotlight Command Center (Global search)", actionLabel: "Spotlight Center" },
    ]
  },
  zh: {
    title: "键盘快捷键中心",
    subtitle: "借助我们集成的物理指令，以思维般的速度导航、自定义和交互。",
    categoryNav: "快速导航",
    categoryDesign: "样式、主题与语言",
    categoryActions: "策展操作",
    guideTitle: "如何使用快捷键？",
    guideDesc: "按住 Alt 键（macOS 上为 Option 键），然后按下对应的字母。对于命令中心，请使用通用组合键 Ctrl + K 或 Cmd + K。",
    interactiveTitle: "物理输入监控（游乐场）",
    interactiveDesc: "按下下方的任何快捷键，即可在屏幕上实时看到它亮起！",
    recentKeyPressed: "检测到最后的组合键",
    pressAnyShort: "按下键盘快捷键...",
    shortcutEnabled: "键盘快捷键已激活 (Alt + 键)",
    shortcutDisabled: "禁用快捷键",
    shortcutsList: [
      { id: "flux", keys: ["Alt", "H"], desc: "前往目标新闻流", actionLabel: "返回主页" },
      { id: "chat", keys: ["Alt", "C"], desc: "打开 AI 策展助手", actionLabel: "AI 聊天" },
      { id: "donations", keys: ["Alt", "D"], desc: "支持策展基地（捐赠与银行信息）", actionLabel: "捐赠" },
      { id: "keys", keys: ["Alt", "K"], desc: "配置 API 密钥和同步", actionLabel: "API 设置" },
      { id: "communaute", keys: ["Alt", "M"], desc: "打开社区空间", actionLabel: "社区" },
      { id: "auth", keys: ["Alt", "A"], desc: "登录 / 管理我的帐户", actionLabel: "我的帐户" },
      { id: "shortcuts", keys: ["Alt", "R"], desc: "显示本键盘快捷键指南", actionLabel: "快捷键" },
      { id: "theme", keys: ["Alt", "T"], desc: "切换主题（深色/浅色）", actionLabel: "切换主题" },
      { id: "style", keys: ["Alt", "S"], desc: "在5种显示风格之间循环切换", actionLabel: "更改样式" },
      { id: "lang", keys: ["Alt", "L"], desc: "循环切换语言（中文、英文、法文等）", actionLabel: "更改语言" },
      { id: "new", keys: ["Alt", "N"], desc: "打开/关闭自定义文章发布抽屉", actionLabel: "发布文章" },
      { id: "profile", keys: ["Alt", "P"], desc: "显示好奇心分数和徽章抽屉", actionLabel: "个人资料抽屉" },
      { id: "spotlight", keys: ["Ctrl/Cmd", "K"], desc: "打开聚光灯命令中心（全局搜索）", actionLabel: "聚光灯中心" },
    ]
  },
  it: {
    title: "Centro Scorciatoie Tastiera",
    subtitle: "Naviga, personalizza e interagisci alla velocità del pensiero grazie ai nostri comandi fisici integrati.",
    categoryNav: "Navigazione Rapida",
    categoryDesign: "Stile, Tema & Lingue",
    categoryActions: "Azioni di Curation",
    guideTitle: "Come usare le scorciatoie?",
    guideDesc: "Tieni premuto il tasto Alt (o Option su macOS), quindi premi la lettera corrispondente. Per il Centro di Comando, usa la combinazione universale Ctrl + K o Cmd + K.",
    interactiveTitle: "Monitor Input Fisici (Playground)",
    interactiveDesc: "Premi una qualsiasi scorciatoia qui sotto per vederla illuminarsi sullo schermo in tempo reale !",
    recentKeyPressed: "Ultima combinazione rilevata",
    pressAnyShort: "Premi una scorciatoia...",
    shortcutEnabled: "Scorciatoie attive (Alt + Tasto)",
    shortcutDisabled: "Disattiva scorciatoie",
    shortcutsList: [
      { id: "flux", keys: ["Alt", "H"], desc: "Vai al Feed delle notizie personalizzato", actionLabel: "Home / Feed" },
      { id: "chat", keys: ["Alt", "C"], desc: "Apri l'Assistente AI di Curation", actionLabel: "Chat IA" },
      { id: "donations", keys: ["Alt", "D"], desc: "Sostieni il Curation Base (Donazioni & RIB)", actionLabel: "Donazioni" },
      { id: "keys", keys: ["Alt", "K"], desc: "Configura le chiavi API & sincronizzazione", actionLabel: "Opzioni API" },
      { id: "communaute", keys: ["Alt", "M"], desc: "Apri lo Spazio Community", actionLabel: "Community" },
      { id: "auth", keys: ["Alt", "A"], desc: "Accedi / Gestisci il mio account", actionLabel: "Mio Account" },
      { id: "shortcuts", keys: ["Alt", "R"], desc: "Mostra questa guida alle scorciatoie", actionLabel: "Scorciatoie" },
      { id: "theme", keys: ["Alt", "T"], desc: "Alterna il tema (Scuro / Chiaro)", actionLabel: "Tema Chiaro/Scuro" },
      { id: "style", keys: ["Alt", "S"], desc: "Scorri tra i 5 stili grafici", actionLabel: "Cambia Stile" },
      { id: "lang", keys: ["Alt", "L"], desc: "Scorri le lingue dell'applicazione", actionLabel: "Cambia Lingua" },
      { id: "new", keys: ["Alt", "N"], desc: "Apri/Chiudi il pannello di pubblicazione", actionLabel: "Pubblica Articolo" },
      { id: "profile", keys: ["Alt", "P"], desc: "Mostra il Punteggio di Curiosità & i Badge", actionLabel: "Pannello Profilo" },
      { id: "spotlight", keys: ["Ctrl/Cmd", "K"], desc: "Apri lo Spotlight Command Center", actionLabel: "Spotlight Center" },
    ]
  },
  pt: {
    title: "Central de Atalhos do Teclado",
    subtitle: "Navegue, personalize e interaja à velocidade do pensamento com os nossos comandos físicos integrados.",
    categoryNav: "Navegação Rápida",
    categoryDesign: "Estilo, Tema & Idiomas",
    categoryActions: "Ações de Curation",
    guideTitle: "Como usar os atalhos?",
    guideDesc: "Mantenha pressionada a tecla Alt (ou Option no macOS) e pressione a letra correspondente. Para a Central de Comandos, use a combinação universal Ctrl + K ou Cmd + K.",
    interactiveTitle: "Monitor de Entradas Físicas (Playground)",
    interactiveDesc: "Pressione qualquer atalho abaixo para vê-lo acender na tela em tempo real!",
    recentKeyPressed: "Última combinação detetada",
    pressAnyShort: "Pressione um atalho de teclado...",
    shortcutEnabled: "Atalhos de Teclado Ativos (Alt + Tecla)",
    shortcutDisabled: "Desativar atalhos",
    shortcutsList: [
      { id: "flux", keys: ["Alt", "H"], desc: "Ir para o Feed de Notícias", actionLabel: "Home / Feed" },
      { id: "chat", keys: ["Alt", "C"], desc: "Abrir o Assistente de Curadoria IA", actionLabel: "Chat IA" },
      { id: "donations", keys: ["Alt", "D"], desc: "Apoiar a Curation Base (Dons & RIB)", actionLabel: "Dons / RIB" },
      { id: "keys", keys: ["Alt", "K"], desc: "Configurar chaves API & sincronização", actionLabel: "Ajustes API" },
      { id: "communaute", keys: ["Alt", "M"], desc: "Abrir o Espaço da Comunidade", actionLabel: "Comunidade" },
      { id: "auth", keys: ["Alt", "A"], desc: "Entrar / Gerenciar minha conta", actionLabel: "Minha Conta" },
      { id: "shortcuts", keys: ["Alt", "R"], desc: "Exibir este guia de atalhos", actionLabel: "Atalhos" },
      { id: "theme", keys: ["Alt", "T"], desc: "Alternar o tema (Escuro / Claro)", actionLabel: "Alternar Tema" },
      { id: "style", keys: ["Alt", "S"], desc: "Alternar entre os 5 estilos gráficos", actionLabel: "Mudar Estilo" },
      { id: "lang", keys: ["Alt", "L"], desc: "Alternar idioma da aplicação", actionLabel: "Mudar Idioma" },
      { id: "new", keys: ["Alt", "N"], desc: "Abrir/Fechar painel de publicação de artigo", actionLabel: "Publicar Artigo" },
      { id: "profile", keys: ["Alt", "P"], desc: "Exibir o Score de Curiosidade & Badges", actionLabel: "Painel Perfil" },
      { id: "spotlight", keys: ["Ctrl/Cmd", "K"], desc: "Abrir o Spotlight Command Center", actionLabel: "Spotlight Center" },
    ]
  },
  ar: {
    title: "مركز اختصارات لوحة المفاتيح",
    subtitle: "تصفح، خصص، وتفاعل بسرعة الفكر بفضل الأوامر الفيزيائية المدمجة لدينا.",
    categoryNav: "التنقل السريع",
    categoryDesign: "النمط والمظهر واللغات",
    categoryActions: "إجراءات التقييم والتنسيق",
    guideTitle: "كيف تستخدم الاختصارات؟",
    guideDesc: "اضغط مع الاستمرار على مفتاح Alt (أو Option على نظام macOS)، ثم اضغط على الحرف المقابل. لمركز الأوامر، استخدم الاختصار العالمي Ctrl + K أو Cmd + K.",
    interactiveTitle: "مراقب المدخلات الفيزيائية (منطقة الاختبار)",
    interactiveDesc: "اضغط على أي اختصار أدناه لرؤيته يضيء على الشاشة فورًا في الوقت الفعلي!",
    recentKeyPressed: "آخر اختصار تم اكتشافه",
    pressAnyShort: "اضغط على أي اختصار...",
    shortcutEnabled: "الاختصارات نشطة (Alt + مفتاح)",
    shortcutDisabled: "تعطيل الاختصارات",
    shortcutsList: [
      { id: "flux", keys: ["Alt", "H"], desc: "الذهاب إلى موجز الأخبار المخصص", actionLabel: "الرئيسية" },
      { id: "chat", keys: ["Alt", "C"], desc: "فتح مساعد التقييم الذكي IA", actionLabel: "دردشة الذكاء الاصطناعي" },
      { id: "donations", keys: ["Alt", "D"], desc: "دعم تطبيق Curation Base (تبرعات ومعلومات RIB)", actionLabel: "التبرعات" },
      { id: "keys", keys: ["Alt", "K"], desc: "تهيئة مفاتيح API والمزامنة", actionLabel: "إعدادات الرموز" },
      { id: "communaute", keys: ["Alt", "M"], desc: "فتح مساحة المجتمع", actionLabel: "المجتمع" },
      { id: "auth", keys: ["Alt", "A"], desc: "تسجيل الدخول / إدارة حسابي", actionLabel: "حسابي" },
      { id: "shortcuts", keys: ["Alt", "R"], desc: "عرض دليل اختصارات لوحة المفاتيح هذا", actionLabel: "الاختصارات" },
      { id: "theme", keys: ["Alt", "T"], desc: "تبديل المظهر (داكن / فاتح)", actionLabel: "تغيير المظهر" },
      { id: "style", keys: ["Alt", "S"], desc: "التنقل بين الأنماط الخمسة المتوفرة", actionLabel: "تغيير النمط" },
      { id: "lang", keys: ["Alt", "L"], desc: "تغيير لغة التطبيق الحالية", actionLabel: "تغيير اللغة" },
      { id: "new", keys: ["Alt", "N"], desc: "فتح/إغلاق لوحة نشر مقال مخصص", actionLabel: "نشر مقال" },
      { id: "profile", keys: ["Alt", "P"], desc: "عرض لوحة نقاط الفضول والشارات", actionLabel: "ملفي الشخصي" },
      { id: "spotlight", keys: ["Ctrl/Cmd", "K"], desc: "فتح مركز البحث Spotlight Command Center", actionLabel: "البحث الشامل" },
    ]
  },
  es: {
    title: "Centro de Atajos de Teclado",
    subtitle: "Navega, personaliza e interactúa a la velocidad del pensamiento gracias a nuestros comandos físicos integrados.",
    categoryNav: "Navegación Rápida",
    categoryDesign: "Estilo, Tema & Idiomas",
    categoryActions: "Acciones de Curation",
    guideTitle: "¿Cómo usar los atajos de teclado?",
    guideDesc: "Mantén presionada la tecla Alt (u Option en macOS) y luego presiona la letra correspondiente. Para el Centro de Comandos, usa la combinación universal Ctrl + K o Cmd + K.",
    interactiveTitle: "Monitoreo de Entradas Físicas (Playground)",
    interactiveDesc: "¡Presiona cualquier atajo a continuación para verlo iluminarse en la pantalla en tiempo real!",
    recentKeyPressed: "Última combinación detectada",
    pressAnyShort: "Presiona un atalaj de teclado...",
    shortcutEnabled: "Atajos de teclado activos (Alt + Tecla)",
    shortcutDisabled: "Desactivar atajos",
    shortcutsList: [
      { id: "flux", keys: ["Alt", "H"], desc: "Ir al canal de noticias seleccionado", actionLabel: "Inicio / Feed" },
      { id: "chat", keys: ["Alt", "C"], desc: "Abrir el asistente de curación IA", actionLabel: "Chat IA" },
      { id: "donations", keys: ["Alt", "D"], desc: "Apoyar la Curation Base (Dons & RIB)", actionLabel: "Dons / RIB" },
      { id: "keys", keys: ["Alt", "K"], desc: "Configurar claves API & sincronización", actionLabel: "Ajustes API" },
      { id: "communaute", keys: ["Alt", "M"], desc: "Abrir el Espacio Comunidad", actionLabel: "Comunidad" },
      { id: "auth", keys: ["Alt", "A"], desc: "Iniciar sesión / Gestionar cuenta", actionLabel: "Mi Cuenta" },
      { id: "shortcuts", keys: ["Alt", "R"], desc: "Mostrar este manual de atajos", actionLabel: "Atajos" },
      { id: "theme", keys: ["Alt", "T"], desc: "Alternar tema (Oscuro / Claro)", actionLabel: "Alternar Tema" },
      { id: "style", keys: ["Alt", "S"], desc: "Navegar entre los 5 estilos gráficos", actionLabel: "Cambiar Estilo" },
      { id: "lang", keys: ["Alt", "L"], desc: "Alternar el idioma de la aplicación", actionLabel: "Cambiar Idioma" },
      { id: "new", keys: ["Alt", "N"], desc: "Abrir/Cerrar el panel de publicación de artículo", actionLabel: "Publicar Artículo" },
      { id: "profile", keys: ["Alt", "P"], desc: "Mostrar el puntaje de curiosidad y badges", actionLabel: "Panel Perfil" },
      { id: "spotlight", keys: ["Ctrl/Cmd", "K"], desc: "Abrir el Spotlight Command Center", actionLabel: "Spotlight Center" },
    ]
  }
};

export default function ShortcutsGuide({
  language,
  displayMode,
  themeMode,
  onNotify
}: ShortcutsGuideProps) {
  const [activeShortcutId, setActiveShortcutId] = useState<string | null>(null);
  const [lastKeyStr, setLastKeyStr] = useState<string | null>(null);

  const t = LOCAL_TRANSLATIONS[language] || LOCAL_TRANSLATIONS.fr;

  const isDark = themeMode === "dark";
  const isSobre = displayMode === "sobre";
  const isWarm = displayMode === "warm";
  const isCyber = displayMode === "cyber";
  const isFun = displayMode === "fun";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Monitor input
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        setLastKeyStr("Ctrl/Cmd + K");
        setActiveShortcutId("spotlight");
        setTimeout(() => setActiveShortcutId(null), 1500);
        return;
      }

      if (e.altKey) {
        const key = e.key.toLowerCase();
        setLastKeyStr(`Alt + ${key.toUpperCase()}`);

        let matchedId: string | null = null;
        if (key === "f" || key === "h") matchedId = "flux";
        else if (key === "c") matchedId = "chat";
        else if (key === "d") matchedId = "donations";
        else if (key === "k") matchedId = "keys";
        else if (key === "m") matchedId = "communaute";
        else if (key === "a") matchedId = "auth";
        else if (key === "r") matchedId = "shortcuts";
        else if (key === "t") matchedId = "theme";
        else if (key === "s") matchedId = "style";
        else if (key === "l") matchedId = "lang";
        else if (key === "n") matchedId = "new";
        else if (key === "p") matchedId = "profile";
        else if (key === "g") matchedId = "spotlight";

        if (matchedId) {
          setActiveShortcutId(matchedId);
          setTimeout(() => setActiveShortcutId(null), 1500);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter shortcuts by categories
  const navShortcuts = t.shortcutsList.filter(s => ["flux", "chat", "donations", "keys", "communaute", "auth", "shortcuts"].includes(s.id));
  const styleShortcuts = t.shortcutsList.filter(s => ["theme", "style", "lang"].includes(s.id));
  const actionShortcuts = t.shortcutsList.filter(s => ["new", "profile", "spotlight"].includes(s.id));

  const renderShortcutCard = (s: typeof t.shortcutsList[0]) => {
    const isActive = activeShortcutId === s.id;
    return (
      <div
        key={s.id}
        className={`p-4 border rounded-xl transition-all duration-300 flex flex-col justify-between gap-3 ${
          isActive 
            ? isCyber 
              ? "bg-[#00ffcc]/20 border-[#00ffcc] text-white scale-[1.03] shadow-[0_0_20px_rgba(0,255,204,0.4)]"
              : isFun
                ? "bg-yellow-300 border-3 border-black text-black scale-[1.03] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                : "bg-indigo-600 border-indigo-500 text-white scale-[1.03] shadow-lg shadow-indigo-500/20"
            : isCyber
              ? "bg-black border-zinc-800 text-cyan-400 font-mono"
              : isFun
                ? "bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : isWarm
                  ? "bg-[#FAF6F0] border-amber-900/20 text-amber-950 font-serif"
                  : isDark
                    ? "bg-zinc-900/40 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                    : "bg-white border-zinc-200 text-zinc-800 hover:border-zinc-300 shadow-xs"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isActive ? "text-white" : "opacity-60"}`}>
            {s.actionLabel}
          </span>
          {isActive && (
            <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full animate-ping">
              🎯 Active
            </span>
          )}
        </div>

        <p className={`text-xs ${isActive ? "text-white" : "opacity-85"} leading-relaxed min-h-[36px]`}>
          {s.desc}
        </p>

        <div className="flex items-center gap-1.5 pt-1.5 border-t border-dashed border-zinc-800/20">
          {s.keys.map((k, idx) => (
            <React.Fragment key={idx}>
              <kbd className={`px-2 py-1 text-[11px] font-bold font-mono rounded border transition-all ${
                isActive
                  ? "bg-white text-indigo-900 border-white"
                  : isCyber
                    ? "bg-zinc-950 border-cyan-500/40 text-[#00ffcc]"
                    : isFun
                      ? "bg-yellow-200 border-2 border-black text-black"
                      : isWarm
                        ? "bg-amber-150 border-amber-900/30 text-amber-950"
                        : isDark
                          ? "bg-zinc-950 border-zinc-800 text-zinc-300"
                          : "bg-zinc-100 border-zinc-250 text-zinc-700 shadow-2xs"
              }`}>
                {k}
              </kbd>
              {idx < s.keys.length - 1 && <span className="opacity-40 text-xs font-bold">+</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* HEADER HERO */}
      <div className={`p-6 sm:p-8 rounded-2xl border transition-all relative overflow-hidden ${
        isCyber ? "bg-black border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] font-mono rounded-none" :
        isFun ? "bg-yellow-100 border-3 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" :
        isWarm ? "bg-[#FAF6F0] border-amber-900/10 text-amber-950 font-serif" :
        isDark ? "bg-zinc-900/75 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900 shadow-sm"
      }`}>
        {/* Ambient decorative glow */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className={`p-2.5 rounded-xl ${isCyber ? "bg-cyan-500/20 text-cyan-400" : isFun ? "bg-pink-400 border-2 border-black text-black" : "bg-indigo-600/10 text-indigo-400"}`}>
                <Keyboard className="w-6 h-6" />
              </div>
              <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${isFun ? "uppercase italic" : ""}`}>
                {t.title}
              </h1>
            </div>
            <p className="text-xs sm:text-sm opacity-80 max-w-2xl leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border ${
            isCyber ? "border-cyan-500/30 bg-black" : isFun ? "bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black" : "bg-zinc-950/20 border-zinc-800/40"
          }`}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="text-xs font-bold">{t.shortcutEnabled}</span>
          </div>
        </div>
      </div>

      {/* QUICK INSTRUCTION GUIDE */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start gap-4 transition-all ${
        isCyber ? "bg-black border-cyan-500/40 font-mono" :
        isFun ? "bg-pink-100 border-2 border-black text-black" :
        isWarm ? "bg-[#FAF6F0] border-amber-900/10 text-amber-950" :
        isDark ? "bg-zinc-900/30 border-zinc-800" : "bg-zinc-50 border-zinc-200"
      }`}>
        <Info className={`w-5 h-5 shrink-0 mt-0.5 ${isCyber ? "text-cyan-400" : isFun ? "text-black" : "text-indigo-400"}`} />
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider">{t.guideTitle}</h4>
          <p className="text-xs opacity-80 leading-relaxed">
            {t.guideDesc}
          </p>
        </div>
      </div>

      {/* INTERACTIVE PLAYGROUND MONITOR */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isCyber ? "bg-black border-[#00ffcc]/30 shadow-[0_0_15px_rgba(0,255,204,0.1)] font-mono" :
        isFun ? "bg-yellow-200 border-2 border-black text-black" :
        isWarm ? "bg-[#FDFBF7] border-amber-900/10" :
        isDark ? "bg-zinc-950/40 border-zinc-800/60" : "bg-white border-zinc-200 text-zinc-900 shadow-2xs"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
              {t.interactiveTitle}
            </h3>
            <p className="text-xs opacity-75">{t.interactiveDesc}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] uppercase tracking-wider opacity-60">{t.recentKeyPressed} :</span>
            <span className={`px-3.5 py-1.5 rounded-lg border text-xs font-black font-mono transition-all duration-300 ${
              lastKeyStr 
                ? isCyber 
                  ? "bg-black border-[#00ffcc] text-[#00ffcc] animate-pulse" 
                  : "bg-indigo-600 text-white border-indigo-500 scale-105 animate-bounce-short"
                : isDark ? "bg-zinc-900/60 border-zinc-850 text-zinc-500" : "bg-zinc-100 border-zinc-200 text-zinc-400"
            }`}>
              {lastKeyStr || t.pressAnyShort}
            </span>
          </div>
        </div>
      </div>

      {/* SHORCUT CATEGORIES */}
      <div className="space-y-8 pt-4">
        {/* CATEGORY 1: NAVIGATION */}
        <div className="space-y-3">
          <h3 className={`text-xs font-black uppercase tracking-[0.2em] px-2 flex items-center gap-2 ${
            isCyber ? "text-[#00ffcc]" : isFun ? "text-black" : "text-indigo-400"
          }`}>
            <Command className="w-3.5 h-3.5" />
            {t.categoryNav}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {navShortcuts.map(renderShortcutCard)}
          </div>
        </div>

        {/* CATEGORY 2: DESIGN & THEME */}
        <div className="space-y-3">
          <h3 className={`text-xs font-black uppercase tracking-[0.2em] px-2 flex items-center gap-2 ${
            isCyber ? "text-[#00ffcc]" : isFun ? "text-black" : "text-indigo-400"
          }`}>
            <Sun className="w-3.5 h-3.5" />
            {t.categoryDesign}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {styleShortcuts.map(renderShortcutCard)}
          </div>
        </div>

        {/* CATEGORY 3: ACTIONS */}
        <div className="space-y-3">
          <h3 className={`text-xs font-black uppercase tracking-[0.2em] px-2 flex items-center gap-2 ${
            isCyber ? "text-[#00ffcc]" : isFun ? "text-black" : "text-indigo-400"
          }`}>
            <Terminal className="w-3.5 h-3.5" />
            {t.categoryActions}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {actionShortcuts.map(renderShortcutCard)}
          </div>
        </div>
      </div>
    </div>
  );
}
