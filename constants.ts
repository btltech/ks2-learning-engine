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