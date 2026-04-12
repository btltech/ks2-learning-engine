import type { Subject } from './types';
import { 
  BookOpenIcon, 
  BeakerIcon, 
  CalculatorIcon, 
  GlobeAltIcon, 
  PaintBrushIcon, 
  ClockIcon, 
  CodeBracketSquareIcon,
  ChatBubbleLeftRightIcon,
  MusicalNoteIcon,
  TrophyIcon,
  HeartIcon,
  WrenchScrewdriverIcon,
  StarIcon,
  UserGroupIcon
} from '@heroicons/react/24/solid';

export const SUBJECTS: Subject[] = [
  { name: 'English', icon: BookOpenIcon, color: 'text-red-600', bgColor: 'bg-red-100' },
  { name: 'Maths', icon: CalculatorIcon, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { name: 'Science', icon: BeakerIcon, color: 'text-green-600', bgColor: 'bg-green-100' },
  { name: 'History', icon: ClockIcon, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { name: 'Geography', icon: GlobeAltIcon, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { name: 'Art', icon: PaintBrushIcon, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { name: 'Computing', icon: CodeBracketSquareIcon, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  { name: 'Languages', icon: ChatBubbleLeftRightIcon, color: 'text-pink-600', bgColor: 'bg-pink-100' },
  { name: 'Music', icon: MusicalNoteIcon, color: 'text-teal-600', bgColor: 'bg-teal-100' },
  { name: 'PE', icon: TrophyIcon, color: 'text-rose-600', bgColor: 'bg-rose-100' },
  { name: 'PSHE', icon: HeartIcon, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  { name: 'D&T', icon: WrenchScrewdriverIcon, color: 'text-slate-600', bgColor: 'bg-slate-100' },
  { name: 'Religious Education', icon: StarIcon, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { name: 'Citizenship', icon: UserGroupIcon, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
];

export const LANGUAGES = [
  { name: 'English', flag: '🇬🇧', greeting: 'Hello' },
  { name: 'French', flag: '🇫🇷', greeting: 'Bonjour' },
  { name: 'Spanish', flag: '🇪🇸', greeting: 'Hola' },
  { name: 'German', flag: '🇩🇪', greeting: 'Hallo' },
  { name: 'Japanese', flag: '🇯🇵', greeting: 'Konnichiwa' },
  { name: 'Mandarin', flag: '🇨🇳', greeting: 'Ni Hao' },
  { name: 'Romanian', flag: '🇷🇴', greeting: 'Salut' },
  { name: 'Yoruba', flag: '🇳🇬', greeting: 'Bawo' },
  { name: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', greeting: 'Helo' },
  // All additional languages now fully implemented with TTS support:
  { name: 'Italian', flag: '🇮🇹', greeting: 'Ciao' },
  { name: 'Arabic', flag: '🇸🇦', greeting: 'Marhaba' },
  { name: 'Portuguese', flag: '🇵🇹', greeting: 'Olá' },
  { name: 'Russian', flag: '🇷🇺', greeting: 'Privet' },
  { name: 'Korean', flag: '🇰🇷', greeting: 'Annyeonghaseyo' },
  { name: 'Hindi', flag: '🇮🇳', greeting: 'Namaste' },
  { name: 'Turkish', flag: '🇹🇷', greeting: 'Merhaba' },
  { name: 'Greek', flag: '🇬🇷', greeting: 'Yassas' },
  { name: 'Latin', flag: '🏛️', greeting: 'Salve' },
];

// Design System Tokens (Fix #2)
export const GRADIENTS = {
  primary: 'from-blue-500 to-purple-600',
  secondary: 'from-blue-400 to-indigo-500',
  success: 'from-green-500 to-teal-600',
  warning: 'from-orange-500 to-amber-600',
  danger: 'from-red-500 to-pink-600',
  info: 'from-cyan-500 to-blue-600',
  purple: 'from-purple-600 to-pink-600',
  emerald: 'from-emerald-600 to-teal-600',
  indigo: 'from-indigo-500 to-purple-600',
  violet: 'from-violet-500 to-purple-600',
} as const;

// Shadow Hierarchy (Fix #1)
export const SHADOWS = {
  primary: 'shadow-xl', // Main actions, featured cards
  secondary: 'shadow-md', // Standard cards, secondary actions
  tertiary: 'shadow-sm', // Info cards, low priority
  large: 'shadow-2xl', // Extra prominent elements
  none: 'shadow-none',
} as const;

// Border Radius Hierarchy (Fix #8)
export const RADIUS = {
  container: 'rounded-2xl', // Major containers, sections
  card: 'rounded-xl', // Cards, panels
  button: 'rounded-lg', // Buttons, inputs
  small: 'rounded-md', // Small elements, tags
  full: 'rounded-full', // Pills, avatars
} as const;

// Subject Color Intent System (Fix #7)
export const SUBJECT_COLORS = {
  'English': { 
    gradient: 'from-red-500 to-rose-600',
    bg: 'bg-red-100',
    text: 'text-red-600',
    ring: 'ring-red-500',
    intent: 'literacy',
  },
  'Maths': {
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    ring: 'ring-blue-500',
    intent: 'logic',
  },
  'Science': {
    gradient: 'from-green-500 to-emerald-600',
    bg: 'bg-green-100',
    text: 'text-green-600',
    ring: 'ring-green-500',
    intent: 'exploration',
  },
  'History': {
    gradient: 'from-amber-500 to-yellow-600',
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
    ring: 'ring-yellow-500',
    intent: 'time',
  },
  'Geography': {
    gradient: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    ring: 'ring-purple-500',
    intent: 'world',
  },
  'Art': {
    gradient: 'from-orange-500 to-amber-600',
    bg: 'bg-orange-100',
    text: 'text-orange-600',
    ring: 'ring-orange-500',
    intent: 'creativity',
  },
  'Computing': {
    gradient: 'from-indigo-500 to-blue-600',
    bg: 'bg-indigo-100',
    text: 'text-indigo-600',
    ring: 'ring-indigo-500',
    intent: 'tech',
  },
  'Languages': {
    gradient: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-100',
    text: 'text-pink-600',
    ring: 'ring-pink-500',
    intent: 'communication',
  },
  'Music': {
    gradient: 'from-teal-500 to-cyan-600',
    bg: 'bg-teal-100',
    text: 'text-teal-600',
    ring: 'ring-teal-500',
    intent: 'rhythm',
  },
  'PE': {
    gradient: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-100',
    text: 'text-rose-600',
    ring: 'ring-rose-500',
    intent: 'movement',
  },
  'PSHE': {
    gradient: 'from-cyan-500 to-teal-600',
    bg: 'bg-cyan-100',
    text: 'text-cyan-600',
    ring: 'ring-cyan-500',
    intent: 'wellbeing',
  },
  'D&T': {
    gradient: 'from-slate-500 to-gray-600',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    ring: 'ring-slate-500',
    intent: 'making',
  },
} as const;