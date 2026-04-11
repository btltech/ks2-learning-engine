/**
 * Multi-language Translation Service
 * Supports English, Spanish, French, and Arabic
 */

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'ar';

export interface TranslationDictionary {
  [key: string]: {
    [lang in SupportedLanguage]: string;
  };
}

// Core UI translations
const translations: TranslationDictionary = {
  // Navigation
  'nav.home': { en: 'Home', es: 'Inicio', fr: 'Accueil', ar: 'الرئيسية' },
  'nav.subjects': { en: 'Subjects', es: 'Materias', fr: 'Matières', ar: 'المواد' },
  'nav.progress': { en: 'Progress', es: 'Progreso', fr: 'Progrès', ar: 'التقدم' },
  'nav.games': { en: 'Games', es: 'Juegos', fr: 'Jeux', ar: 'الألعاب' },
  'nav.friends': { en: 'Friends', es: 'Amigos', fr: 'Amis', ar: 'الأصدقاء' },
  'nav.certificates': { en: 'Certificates', es: 'Certificados', fr: 'Certificats', ar: 'الشهادات' },
  
  // Actions
  'action.start': { en: 'Start', es: 'Comenzar', fr: 'Commencer', ar: 'ابدأ' },
  'action.continue': { en: 'Continue', es: 'Continuar', fr: 'Continuer', ar: 'متابعة' },
  'action.submit': { en: 'Submit', es: 'Enviar', fr: 'Soumettre', ar: 'إرسال' },
  'action.cancel': { en: 'Cancel', es: 'Cancelar', fr: 'Annuler', ar: 'إلغاء' },
  'action.save': { en: 'Save', es: 'Guardar', fr: 'Enregistrer', ar: 'حفظ' },
  'action.delete': { en: 'Delete', es: 'Eliminar', fr: 'Supprimer', ar: 'حذف' },
  'action.edit': { en: 'Edit', es: 'Editar', fr: 'Modifier', ar: 'تحرير' },
  'action.close': { en: 'Close', es: 'Cerrar', fr: 'Fermer', ar: 'إغلاق' },
  
  // Common
  'common.loading': { en: 'Loading...', es: 'Cargando...', fr: 'Chargement...', ar: 'جاري التحميل...' },
  'common.error': { en: 'Error', es: 'Error', fr: 'Erreur', ar: 'خطأ' },
  'common.success': { en: 'Success', es: 'Éxito', fr: 'Succès', ar: 'نجاح' },
  'common.points': { en: 'Points', es: 'Puntos', fr: 'Points', ar: 'نقاط' },
  'common.level': { en: 'Level', es: 'Nivel', fr: 'Niveau', ar: 'المستوى' },
  'common.score': { en: 'Score', es: 'Puntuación', fr: 'Score', ar: 'النتيجة' },
  
  // Welcome
  'welcome.title': { en: 'Welcome back', es: 'Bienvenido de nuevo', fr: 'Bon retour', ar: 'مرحبا بعودتك' },
  'welcome.streak': { en: 'day streak', es: 'días seguidos', fr: 'jours consécutifs', ar: 'يوم متتالي' },
  
  // Quiz
  'quiz.question': { en: 'Question', es: 'Pregunta', fr: 'Question', ar: 'سؤال' },
  'quiz.of': { en: 'of', es: 'de', fr: 'de', ar: 'من' },
  'quiz.correct': { en: 'Correct', es: 'Correcto', fr: 'Correct', ar: 'صحيح' },
  'quiz.incorrect': { en: 'Incorrect', es: 'Incorrecto', fr: 'Incorrect', ar: 'خطأ' },
  'quiz.timeUp': { en: 'Time is up!', es: '¡Se acabó el tiempo!', fr: 'Le temps est écoulé!', ar: 'انتهى الوقت!' },
  'quiz.completed': { en: 'Quiz Completed', es: 'Cuestionario completado', fr: 'Quiz terminé', ar: 'اكتمل الاختبار' },
  
  // Subjects
  'subject.maths': { en: 'Maths', es: 'Matemáticas', fr: 'Mathématiques', ar: 'الرياضيات' },
  'subject.english': { en: 'English', es: 'Inglés', fr: 'Anglais', ar: 'الإنجليزية' },
  'subject.science': { en: 'Science', es: 'Ciencias', fr: 'Sciences', ar: 'العلوم' },
  'subject.history': { en: 'History', es: 'Historia', fr: 'Histoire', ar: 'التاريخ' },
  'subject.geography': { en: 'Geography', es: 'Geografía', fr: 'Géographie', ar: 'الجغرافيا' },
  
  // Difficulty
  'difficulty.easy': { en: 'Easy', es: 'Fácil', fr: 'Facile', ar: 'سهل' },
  'difficulty.medium': { en: 'Medium', es: 'Medio', fr: 'Moyen', ar: 'متوسط' },
  'difficulty.hard': { en: 'Hard', es: 'Difícil', fr: 'Difficile', ar: 'صعب' },
  
  // Progress
  'progress.skillTree': { en: 'Skill Tree', es: 'Árbol de habilidades', fr: 'Arbre de compétences', ar: 'شجرة المهارات' },
  'progress.certificates': { en: 'Certificates', es: 'Certificados', fr: 'Certificats', ar: 'الشهادات' },
  'progress.chart': { en: 'Progress Chart', es: 'Gráfico de progreso', fr: 'Graphique de progrès', ar: 'مخطط التقدم' },
  'progress.summary': { en: 'Weekly Summary', es: 'Resumen semanal', fr: 'Résumé hebdomadaire', ar: 'الملخص الأسبوعي' },
  
  // Social
  'social.addFriend': { en: 'Add Friend', es: 'Agregar amigo', fr: 'Ajouter un ami', ar: 'إضافة صديق' },
  'social.challenge': { en: 'Challenge', es: 'Desafío', fr: 'Défi', ar: 'تحدي' },
  'social.online': { en: 'Online', es: 'En línea', fr: 'En ligne', ar: 'متصل' },
  'social.offline': { en: 'Offline', es: 'Desconectado', fr: 'Hors ligne', ar: 'غير متصل' },
  
  // Certificates
  'cert.bronze': { en: 'Bronze Certificate', es: 'Certificado de bronce', fr: 'Certificat de bronze', ar: 'شهادة برونزية' },
  'cert.silver': { en: 'Silver Certificate', es: 'Certificado de plata', fr: 'Certificat d\'argent', ar: 'شهادة فضية' },
  'cert.gold': { en: 'Gold Certificate', es: 'Certificado de oro', fr: 'Certificat d\'or', ar: 'شهادة ذهبية' },
  'cert.platinum': { en: 'Platinum Certificate', es: 'Certificado de platino', fr: 'Certificat de platine', ar: 'شهادة بلاتينية' },
};

class TranslationService {
  private currentLanguage: SupportedLanguage = 'en';
  
  constructor() {
    this.loadLanguage();
  }
  
  private loadLanguage(): void {
    const saved = localStorage.getItem('ks2_language');
    if (saved && this.isValidLanguage(saved)) {
      this.currentLanguage = saved as SupportedLanguage;
    }
  }
  
  private isValidLanguage(lang: string): boolean {
    return ['en', 'es', 'fr', 'ar'].includes(lang);
  }
  
  public setLanguage(lang: SupportedLanguage): void {
    this.currentLanguage = lang;
    localStorage.setItem('ks2_language', lang);
    
    // Update HTML attributes
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Trigger re-render
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { language: lang } }));
  }
  
  public getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }
  
  public translate(key: string, fallback?: string): string {
    const translation = translations[key];
    
    if (!translation) {
      console.warn(`Translation key not found: ${key}`);
      return fallback || key;
    }
    
    return translation[this.currentLanguage] || translation.en || fallback || key;
  }
  
  public t(key: string, fallback?: string): string {
    return this.translate(key, fallback);
  }
  
  public isRTL(): boolean {
    return this.currentLanguage === 'ar';
  }
  
  public getAvailableLanguages(): Array<{ code: SupportedLanguage; name: string; flag: string }> {
    return [
      { code: 'en', name: 'English', flag: '🇬🇧' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    ];
  }
  
  // Subscribe to language changes
  public subscribe(callback: (lang: SupportedLanguage) => void): () => void {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent;
      callback(customEvent.detail.language);
    };
    
    window.addEventListener('languagechange', handler);
    
    return () => {
      window.removeEventListener('languagechange', handler);
    };
  }
}

export const translationService = new TranslationService();
export default translationService;
