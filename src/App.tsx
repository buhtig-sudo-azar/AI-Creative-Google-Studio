import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  Sliders, 
  Check, 
  Copy, 
  Cpu, 
  Layers, 
  Globe, 
  Activity, 
  FileText, 
  Code, 
  Languages, 
  Compass, 
  BookOpen, 
  ArrowRight,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Preset {
  id: string;
  emoji: string;
  titleRu: string;
  titleEn: string;
  descriptionRu: string;
  descriptionEn: string;
  systemInstruction: string;
  prompt: string;
  temperature: number;
}

const PRESETS: Preset[] = [
  {
    id: "copier",
    emoji: "✍️",
    titleRu: "Креативный Копирайтер",
    titleEn: "Creative Copywriter",
    descriptionRu: "Идеален для создания вовлекающих текстов, блогов и писем.",
    descriptionEn: "Perfect for drafting catchy copies, blogs, and letters.",
    systemInstruction: "Вы — опытный маркетолог и креативный копирайтер. Пишите живо, увлекательно, используйте понятные аналогии и четкую структуру. Делайте текст интуитивно приятным для чтения.",
    prompt: "Напиши яркий пост для социальных сетей про запуск нашего нового Full-Stack приложения на платформе Cloud Run с использованием искусственного интеллекта Gemini 3.5. Опиши преимущества скорости и простоты.",
    temperature: 0.95
  },
  {
    id: "coder",
    emoji: "💻",
    titleRu: "Разработчик & Системный Аналитик",
    titleEn: "Developer & Analyst",
    descriptionRu: "Помогает писать чистый код, искать баги и проектировать системы.",
    descriptionEn: "Helps write clean code, discover bugs, and design architectures.",
    systemInstruction: "Вы — ведущий Software Architect и эксперт по TypeScript/React. Отвечайте лаконично, структурированно, приводите примеры кода в Markdown с учетом лучших практик проектирования.",
    prompt: "Приведи пример умного React хука для фонового сохранения черновика текста в LocalStorage с дебаунсом (debounce) в 1 секунду. Напиши краткое объяснение логики на русском языке.",
    temperature: 0.3
  },
  {
    id: "translator",
    emoji: "🌐",
    titleRu: "Интеллектуальный Переводчик",
    titleEn: "Smart Translator & Refiner",
    descriptionRu: "Адаптирует тексты, улучшает стиль и исправляет ошибки.",
    descriptionEn: "Adapts tone, refines style, and corrects grammar errors.",
    systemInstruction: "Вы — профессиональный литературный переводчик и лингвист. Переводите тексты, подбирая естественные идиомы, сохраняя оригинальную тональность и исправляя стилистические неровности.",
    prompt: "Переведи и сделай этот текст более профессиональным и вежливым на английском языке: 'Чувак, привет! Я сделал тестовое приложение на React и развернул его в облаке Cloud Run. Посмотри, работает очень круто и быстро реагирует на запросы к Gemini ИИ.'",
    temperature: 0.6
  },
  {
    id: "assistant",
    emoji: "🧠",
    titleRu: "Универсальный Помощник",
    titleEn: "General Assistant",
    descriptionRu: "Быстрые ответы, анализ идей и структурирование мыслей.",
    descriptionEn: "Quick responses, brainstorming, and structured analysis.",
    systemInstruction: "Вы — дружелюбный и высокоинтеллектуальный помощник. Отвечайте четко, по делу, помогайте пользователю структурировать мысли и находить решения.",
    prompt: "Составь пошаговый план обучения современным веб-технологиям (Next.js/React, Node.js + Express, Cloud Run) для начинающего разработчика на 3 месяца.",
    temperature: 0.7
  }
];

export default function App() {
  const [selectedPreset, setSelectedPreset] = useState<Preset>(PRESETS[0]);
  const [prompt, setPrompt] = useState<string>(PRESETS[0].prompt);
  const [systemInstruction, setSystemInstruction] = useState<string>(PRESETS[0].systemInstruction);
  const [temperature, setTemperature] = useState<number>(PRESETS[0].temperature);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  
  // Telemetry track
  const [apiStatus, setApiStatus] = useState<{
    status: string;
    model: string;
    hasApiKey: boolean;
  } | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);

  // Load configuration and status on mount
  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const res = await fetch("/api/status");
      if (res.ok) {
        const data = await res.json();
        setApiStatus(data);
      } else {
        setApiStatus({ status: "error", model: "gemini-3.5-flash", hasApiKey: false });
      }
    } catch {
      setApiStatus({ status: "error", model: "gemini-3.5-flash", hasApiKey: false });
    }
  };

  const handleApplyPreset = (preset: Preset) => {
    setSelectedPreset(preset);
    setPrompt(preset.prompt);
    setSystemInstruction(preset.systemInstruction);
    setTemperature(preset.temperature);
    setErrorMsg("");
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setErrorMsg("");
    setResponse("");
    const startTime = performance.now();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systemInstruction,
          temperature
        })
      });

      const data = await res.json();
      const endTime = performance.now();
      setDurationMs(Math.round(endTime - startTime));

      if (res.ok) {
        setResponse(data.text || "Пустой ответ от модели.");
      } else {
        setErrorMsg(data.error || "发生了未知错误 / An error occurred.");
      }
    } catch (err: any) {
      setErrorMsg("Не удалось связаться с сервером. Убедитесь, что сервер запущен. Connection error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-neutral-200">
      {/* Header Container */}
      <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white shadow-sm ring-1 ring-neutral-800">
              <Sparkles className="h-5 w-5 animate-pulse text-yellow-300" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-display tracking-tight text-neutral-900 flex items-center gap-2">
                Интеллектуальный текстовый помощник
              </h1>
              <p className="text-xs text-neutral-500">Быстрая обработка и генерация текстового контента</p>
            </div>
          </div>

          {/* Connection Status Telemetry */}
          <div className="flex items-center space-x-4">
            {apiStatus ? (
              <div className="flex items-center space-x-2 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs text-neutral-600">
                <span className={`relative flex h-2 w-2 mr-1`}>
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${apiStatus.hasApiKey ? 'bg-emerald-400' : 'bg-rose-400'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${apiStatus.hasApiKey ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                </span>
                <span className="font-mono text-[10px] uppercase font-bold text-neutral-700">
                  {apiStatus.hasApiKey ? 'API ACTIVE' : 'API KEY MISSING'}
                </span>
                <span className="hidden sm:inline text-neutral-300">|</span>
                <span className="hidden sm:inline font-mono">{apiStatus.model}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-neutral-400" />
                <span className="text-neutral-500 font-mono text-[10px]">VERIFYING...</span>
              </div>
            )}
            
            {/* Quick action to test connection */}
            <button 
              onClick={checkApiStatus} 
              className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors"
              title="Перепроверить статус ИИ соединения"
              id="refresh_api_status_btn"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Arena */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dynamic Greeting & Banner Card */}
        <div className="mb-8 p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs relative overflow-hidden" id="welcome_card">
          <div className="absolute right-0 top-0 -mt-12 -mr-12 w-48 h-48 bg-neutral-100 rounded-full blur-2xl opacity-50"></div>
          <div className="absolute left-1/3 bottom-0 -mb-8 w-32 h-32 bg-amber-100 rounded-full blur-2xl opacity-20"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-4xl">
              <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-neutral-900">
                🚀 Интеллектуальный веб-сервис готов к работе!
              </h2>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Высокоскоростное приложение, разработанное с использованием Node.js + Express на бэкенде и React на фронтенде. Все запросы к модели <strong>gemini-3.5-flash</strong> надёжно обрабатываются на стороне сервера, обеспечивая максимальную конфиденциальность.
              </p>
              
              <div className="flex flex-wrap gap-2.5 pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-neutral-600 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-md">
                  <Cpu className="h-3.5 w-3.5 text-neutral-500" /> Server-side safe API proxying
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-neutral-600 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-md">
                  <Layers className="h-3.5 w-3.5 text-neutral-500" /> React 19 & Tailwind CSS v4
                </span>
              </div>
            </div>

            {/* Quick Statistics/Link section */}
            <div className="shrink-0 bg-neutral-900 text-white p-4 rounded-xl border border-neutral-800 shadow-sm flex flex-col space-y-2 w-full md:w-auto">
              <div className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Текущий веб-адрес (APP_URL)</div>
              <div className="font-mono text-xs text-emerald-400 bg-neutral-950 px-2.5 py-1.5 rounded-lg border border-neutral-800 break-all select-all">
                {window.location.origin}
              </div>
              <div className="text-[10px] text-neutral-400 text-center pt-1 flex items-center justify-center gap-1">
                <Globe className="h-3 w-3 text-neutral-500" /> Ссылка активна в Облаке
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Preset selector & parameters config (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
              
              <div className="flex items-center space-x-2 pb-2 border-b border-neutral-100">
                <Sliders className="h-4 w-4 text-neutral-900" />
                <h3 className="font-semibold text-sm uppercase tracking-wider text-neutral-700">Конфигуратор & Шаблоны</h3>
              </div>

              {/* Presets List */}
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Предустановленные сценарии
                </label>
                <div className="grid grid-cols-1 gap-2.5" id="presets_list">
                  {PRESETS.map((preset) => {
                    const isSelected = selectedPreset.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset)}
                        className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-start gap-3 relative overflow-hidden group ${
                          isSelected 
                            ? "bg-neutral-950 text-white border-neutral-950 shadow-md transform -translate-y-0.5" 
                            : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50"
                        }`}
                        id={`btn_preset_${preset.id}`}
                      >
                        <span className="text-xl shrink-0 mt-0.5">{preset.emoji}</span>
                        <div className="space-y-0.5">
                          <h4 className="font-medium text-xs font-display">
                            {preset.titleRu}
                          </h4>
                          <p className={`text-[10.5px] leading-snug line-clamp-2 ${isSelected ? "text-neutral-300" : "text-neutral-500"}`}>
                            {preset.descriptionRu}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="absolute right-3 top-3">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* System Instruction Panel */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Системные инструкции ИИ
                  </label>
                  <span className="text-[10px] text-neutral-400 font-mono">System Instruction</span>
                </div>
                <textarea
                  value={systemInstruction}
                  onChange={(e) => {
                    setSystemInstruction(e.target.value);
                    if (selectedPreset.systemInstruction !== e.target.value) {
                      // Deselect active preset highlight since instruction deviated
                      setSelectedPreset({ ...PRESETS[0], id: "custom" });
                    }
                  }}
                  rows={4}
                  className="w-full text-xs font-mono p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none transition-all block resize-y"
                  placeholder="Определите поведение и характер искусственного интеллекта..."
                  id="system_instruction_textarea"
                />
              </div>

              {/* Temperature Selector */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Уровень КреативностиИИ
                  </label>
                  <span className="text-xs font-bold font-mono bg-neutral-100 border border-neutral-200 text-neutral-800 px-2 py-0.5 rounded-md">
                    {temperature.toFixed(2)}
                  </span>
                </div>
                
                <input
                  type="range"
                  min="0.0"
                  max="2.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => {
                    setTemperature(parseFloat(e.target.value));
                    if (selectedPreset.id !== "custom") {
                      setSelectedPreset({ ...PRESETS[0], id: "custom" });
                    }
                  }}
                  className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-950 focus:outline-hidden"
                  id="temperature_range"
                />
                
                <div className="flex justify-between text-[10px] font-mono text-neutral-400 uppercase">
                  <span>Фактический (0.0)</span>
                  <span>Баланс (1.0)</span>
                  <span>Творческий (2.0)</span>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT: Main Creative Workspace & Output (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Input Submission Card */}
            <form onSubmit={handleGenerate} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4" id="generation_form">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-neutral-600" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Запрос для ИИ модели</span>
                </div>
                <div className="text-[10px] font-mono text-neutral-400">
                  {prompt.length} символов
                </div>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                required
                className="w-full text-sm p-4 bg-white border border-neutral-200 rounded-xl focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 focus:outline-none transition-all resize-y"
                placeholder="Что вы хотите спросить или сгенерировать? Напишите свой вопрос или выберите готовый сценарий слева..."
                id="prompt_textarea"
              />

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !prompt.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neutral-950 text-white text-sm font-medium hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 transition-all cursor-pointer shadow-xs"
                  id="submit_generate_btn"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Обрабатываем запрос сервером...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Запустить генерацию ИИ
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setPrompt("");
                    setErrorMsg("");
                    setResponse("");
                  }}
                  className="px-4 py-3 rounded-xl border border-neutral-200 text-neutral-600 text-sm hover:bg-neutral-50 transition-colors cursor-pointer"
                  id="clear_btn"
                >
                  Очистить
                </button>
              </div>
            </form>

            {/* Error Message banner */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono"
                  id="error_banner"
                >
                  <p className="font-semibold text-rose-900 pb-1 flex items-center gap-1.5">
                    ⚠️ Ошибка выполнения запроса / Model execution failed
                  </p>
                  <p>{errorMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Response Panel / Output Box */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden" id="response_panel">
              
              {/* Output Header Status Bar */}
              <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">Результат вычислений</span>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  {durationMs && (
                    <span className="font-mono text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md">
                      Время ответа: {(durationMs / 1000).toFixed(2)}с ({durationMs} ms)
                    </span>
                  )}
                  {response && (
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-600 bg-white hover:bg-neutral-50 cursor-pointer active:scale-95 transition-all"
                      id="copy_response_btn"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          Скопировано!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-neutral-500" />
                          Копировать
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Actual Generated Content Body */}
              <div className="p-6 min-h-[250px] relative">
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading_state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-white/60 backdrop-blur-xs z-20 space-y-4"
                    >
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full border-2 border-neutral-200 border-t-neutral-900 animate-spin"></div>
                        <Sparkles className="h-5 w-5 text-yellow-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-sm font-semibold text-neutral-900 animate-pulse">Запрос отправлен верифицированному ИИ...</p>
                        <p className="text-xs text-neutral-400 font-mono">Безопасное соединение через Cloud Run API → Gemini Pro SDK</p>
                      </div>
                    </motion.div>
                  ) : null}

                  {response ? (
                    <motion.div
                      key="response_content"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="prose prose-neutral max-w-none text-sm text-neutral-800 leading-relaxed font-sans whitespace-pre-wrap selection:bg-neutral-200"
                      id="response_text_box"
                    >
                      {/* Simple formatted response */}
                      {response}
                    </motion.div>
                  ) : (
                    !isLoading && (
                      <motion.div
                        key="empty_state"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-12 text-center space-y-3"
                      >
                        <div className="h-12 w-12 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-400">
                          <Compass className="h-6 w-6" />
                        </div>
                        <div className="space-y-1 max-w-sm">
                          <p className="text-sm font-medium text-neutral-600">Зона вывода пуста</p>
                          <p className="text-xs text-neutral-400 leading-normal">
                            Попробуйте нажать кнопку <strong>"Запустить генерацию ИИ"</strong> выше или выберите готовый текстовый сценарий в шаблонах слева.
                          </p>
                        </div>
                      </motion.div>
                    )
                  )}
                </AnimatePresence>
              </div>

            </div>

          </div>

        </div>

        {/* Quick Testing Actions / Suggestions Grid below */}
        <div className="mt-8 pt-8 border-t border-neutral-200">
          <h3 className="font-display font-bold text-lg text-neutral-900 mb-4 flex items-center gap-2">
            🎨 Интерактивные Экспресс-Тесты
          </h3>
          <p className="text-sm text-neutral-500 mb-6">
            Быстрые кликабельные тесты для проверки скорости облачного проксирования. При нажатии автоматически перезапишет поле запроса и запустит генерацию.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="quick_tests_grid">
            
            <button
              onClick={() => {
                const instructions = "Вы — профессиональный поэт. Напишите изящное стихотворение.";
                setSystemInstruction(instructions);
                setPrompt("Напиши короткое стихотворение из 4 строк про облака, бесконечность, умный код и свет искусственного разума.");
                setTemperature(1.1);
                setSelectedPreset({ ...PRESETS[0], id: "custom" });
                // We'll delay slightly or submit directly
                setTimeout(() => {
                  document.getElementById("submit_generate_btn")?.click();
                }, 100);
              }}
              className="text-left p-4 bg-white hover:bg-neutral-100/50 border border-neutral-200 rounded-xl transition-all cursor-pointer group"
              id="test_action_poem"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">01 • Стихотворение</span>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="font-semibold text-xs text-neutral-900 pb-1">ИИ стихи в облаке</h4>
              <p className="text-[11px] text-neutral-500 leading-snug line-clamp-2">
                Генерация рифмованного поэтического четверостишия с высоким уровнем креативности (Temp 1.1)
              </p>
            </button>

            <button
              onClick={() => {
                const instructions = "Вы — эксперт-аналитик по разработке ПО.";
                setSystemInstruction(instructions);
                setPrompt("Приведи 3 примера полезного применения ИИ-модели Gemini 3.5 Flash в реальных бизнес-приложениях с кратким обоснованием выгоды.");
                setTemperature(0.5);
                setSelectedPreset({ ...PRESETS[0], id: "custom" });
                setTimeout(() => {
                  document.getElementById("submit_generate_btn")?.click();
                }, 100);
              }}
              className="text-left p-4 bg-white hover:bg-neutral-100/50 border border-neutral-200 rounded-xl transition-all cursor-pointer group"
              id="test_action_cases"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">02 • Бизнес Анализ</span>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="font-semibold text-xs text-neutral-900 pb-1">Примеры внедрения Gemini</h4>
              <p className="text-[11px] text-neutral-500 leading-snug line-clamp-2">
                3 реальных сценария применения модели в коммерческих Cloud Run приложениях.
              </p>
            </button>

            <button
              onClick={() => {
                const instructions = "Вы — креативный ИИ-генератор идей.";
                setSystemInstruction(instructions);
                setPrompt("Предложи очень оригинальную идею для веселого React веб-приложения на выходные (веб-сайт, забавный калькулятор, интерактивная шутка). Дай крутое название.");
                setTemperature(1.3);
                setSelectedPreset({ ...PRESETS[0], id: "custom" });
                setTimeout(() => {
                  document.getElementById("submit_generate_btn")?.click();
                }, 100);
              }}
              className="text-left p-4 bg-white hover:bg-neutral-100/50 border border-neutral-200 rounded-xl transition-all cursor-pointer group"
              id="test_action_fun"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-violet-500 uppercase tracking-wider">03 • Фан Идея</span>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="font-semibold text-xs text-neutral-900 pb-1">Генератор пет-проектов</h4>
              <p className="text-[11px] text-neutral-500 leading-snug line-clamp-2">
                Необычная интерактивная идея с повышенной температурой генерирования.
              </p>
            </button>

          </div>
        </div>

      </main>

      {/* Cloud & Application info Footer */}
      <footer className="bg-neutral-900 text-neutral-400 mt-20 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-6 space-y-4">
              <div className="flex items-center space-x-3 text-white">
                <div className="h-7 w-7 rounded-lg bg-neutral-800 flex items-center justify-center border border-neutral-700">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="font-bold font-display text-sm">Облачное окружение Cloud Run</span>
              </div>
              <p className="text-xs leading-relaxed text-neutral-400 max-w-md">
                Это приложение развернуто в изолированном контейнере Cloud Run. Благодаря использованию архитектуры Express + Vite, секретный ключ API <strong>GEMINI_API_KEY</strong> никогда не покидает облачную зону бэкенда, обеспечивая максимальную кибербезопасность.
              </p>
            </div>

            <div className="md:col-span-6 space-y-3">
              <h4 className="text-xs font-semibold text-white uppercase tracking-widest flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-neutral-400" /> Как использовать развернутое приложение?
              </h4>
              <ul className="text-xs space-y-2 text-neutral-400">
                <li className="flex items-start gap-1.5">
                  <span className="text-neutral-500 font-bold">•</span>
                  <span>Вы можете поделиться этим веб-интерфейсом по внешней Shared ссылке с вашими коллегами или друзьями.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-neutral-500 font-bold">•</span>
                  <span>Настройки ключей API осуществляются конфиденциально в параметрах окружения.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-neutral-500 font-bold">•</span>
                  <span>Все генерируемые шаблоны и сессии локально сохраняются в браузере. Вы можете возвращаться к ним в любое время.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 font-mono">
            <div>
              © {new Date().getFullYear()} • Создатель: AZAR. Все права защищены.
            </div>
            <div className="flex space-x-4 mt-4 sm:mt-0">
              <span>Стек: Node.js, React, Express, Vite, Tailwind CSS, Google GenAI SDK</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
