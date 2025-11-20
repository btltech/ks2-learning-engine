import { BankQuestion, Difficulty } from '../../types';

export const languagesQuestions: BankQuestion[] = [
  // ===== FRENCH (Mixed Topics) =====
  // Greetings (Easy)
  { id: 'l-fr-gr-01', subject: 'Languages', topic: 'French: Greetings', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Hello', options: ['Bonjour', 'Au revoir', 'Merci', 'Oui'], correctAnswer: 'Bonjour' },
  { id: 'l-fr-gr-02', subject: 'Languages', topic: 'French: Greetings', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Goodbye', options: ['Au revoir', 'Bonjour', 'Salut', 'Non'], correctAnswer: 'Au revoir' },
  { id: 'l-fr-gr-03', subject: 'Languages', topic: 'French: Greetings', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Hi (informal)', options: ['Salut', 'Bonjour', 'Merci', 'Pardon'], correctAnswer: 'Salut' },
  { id: 'l-fr-gr-04', subject: 'Languages', topic: 'French: Greetings', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Good evening', options: ['Bonsoir', 'Bonjour', 'Bonne nuit', 'Salut'], correctAnswer: 'Bonsoir' },
  { id: 'l-fr-gr-05', subject: 'Languages', topic: 'French: Greetings', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'See you later', options: ['À plus tard', 'Bonjour', 'Merci', 'Oui'], correctAnswer: 'À plus tard' },
  
  // Numbers (Easy/Medium)
  { id: 'l-fr-nu-01', subject: 'Languages', topic: 'French: Numbers', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'One', options: ['Un', 'Deux', 'Trois', 'Quatre'], correctAnswer: 'Un' },
  { id: 'l-fr-nu-02', subject: 'Languages', topic: 'French: Numbers', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Two', options: ['Deux', 'Un', 'Trois', 'Cinq'], correctAnswer: 'Deux' },
  { id: 'l-fr-nu-03', subject: 'Languages', topic: 'French: Numbers', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Three', options: ['Trois', 'Deux', 'Quatre', 'Six'], correctAnswer: 'Trois' },
  { id: 'l-fr-nu-04', subject: 'Languages', topic: 'French: Numbers', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Ten', options: ['Dix', 'Neuf', 'Huit', 'Sept'], correctAnswer: 'Dix' },
  { id: 'l-fr-nu-05', subject: 'Languages', topic: 'French: Numbers', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Five', options: ['Cinq', 'Quatre', 'Six', 'Sept'], correctAnswer: 'Cinq' },

  // Colors (Medium)
  { id: 'l-fr-co-01', subject: 'Languages', topic: 'French: Colors', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Red', options: ['Rouge', 'Bleu', 'Vert', 'Jaune'], correctAnswer: 'Rouge' },
  { id: 'l-fr-co-02', subject: 'Languages', topic: 'French: Colors', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Blue', options: ['Bleu', 'Rouge', 'Noir', 'Blanc'], correctAnswer: 'Bleu' },
  { id: 'l-fr-co-03', subject: 'Languages', topic: 'French: Colors', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Green', options: ['Vert', 'Jaune', 'Rouge', 'Gris'], correctAnswer: 'Vert' },
  { id: 'l-fr-co-04', subject: 'Languages', topic: 'French: Colors', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Yellow', options: ['Jaune', 'Vert', 'Bleu', 'Rose'], correctAnswer: 'Jaune' },
  { id: 'l-fr-co-05', subject: 'Languages', topic: 'French: Colors', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Black', options: ['Noir', 'Blanc', 'Rouge', 'Vert'], correctAnswer: 'Noir' },

  // Family (Medium/Hard)
  { id: 'l-fr-fa-01', subject: 'Languages', topic: 'French: Family', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Mother', options: ['Mère', 'Père', 'Sœur', 'Frère'], correctAnswer: 'Mère' },
  { id: 'l-fr-fa-02', subject: 'Languages', topic: 'French: Family', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Father', options: ['Père', 'Mère', 'Frère', 'Sœur'], correctAnswer: 'Père' },
  { id: 'l-fr-fa-03', subject: 'Languages', topic: 'French: Family', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Sister', options: ['Sœur', 'Frère', 'Tante', 'Oncle'], correctAnswer: 'Sœur' },
  { id: 'l-fr-fa-04', subject: 'Languages', topic: 'French: Family', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Brother', options: ['Frère', 'Sœur', 'Père', 'Mère'], correctAnswer: 'Frère' },
  { id: 'l-fr-fa-05', subject: 'Languages', topic: 'French: Family', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Grandmother', options: ['Grand-mère', 'Grand-père', 'Tante', 'Cousine'], correctAnswer: 'Grand-mère' },

  // ===== SPANISH =====
  // Greetings
  { id: 'l-es-gr-01', subject: 'Languages', topic: 'Spanish: Greetings', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Hello', options: ['Hola', 'Adiós', 'Gracias', 'Por favor'], correctAnswer: 'Hola' },
  { id: 'l-es-gr-02', subject: 'Languages', topic: 'Spanish: Greetings', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Goodbye', options: ['Adiós', 'Hola', 'Si', 'No'], correctAnswer: 'Adiós' },
  { id: 'l-es-gr-03', subject: 'Languages', topic: 'Spanish: Greetings', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Good morning', options: ['Buenos días', 'Buenas noches', 'Hola', 'Gracias'], correctAnswer: 'Buenos días' },
  { id: 'l-es-gr-04', subject: 'Languages', topic: 'Spanish: Greetings', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'How are you?', options: ['¿Cómo estás?', '¿Qué tal?', 'Hola', 'Adiós'], correctAnswer: '¿Cómo estás?' },
  { id: 'l-es-gr-05', subject: 'Languages', topic: 'Spanish: Greetings', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'My name is...', options: ['Me llamo...', 'Soy...', 'Hola...', 'Adiós...'], correctAnswer: 'Me llamo...' },

  // Numbers
  { id: 'l-es-nu-01', subject: 'Languages', topic: 'Spanish: Numbers', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'One', options: ['Uno', 'Dos', 'Tres', 'Cuatro'], correctAnswer: 'Uno' },
  { id: 'l-es-nu-02', subject: 'Languages', topic: 'Spanish: Numbers', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Two', options: ['Dos', 'Uno', 'Tres', 'Cinco'], correctAnswer: 'Dos' },
  { id: 'l-es-nu-03', subject: 'Languages', topic: 'Spanish: Numbers', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Three', options: ['Tres', 'Dos', 'Cuatro', 'Seis'], correctAnswer: 'Tres' },
  { id: 'l-es-nu-04', subject: 'Languages', topic: 'Spanish: Numbers', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Four', options: ['Cuatro', 'Cinco', 'Tres', 'Dos'], correctAnswer: 'Cuatro' },
  { id: 'l-es-nu-05', subject: 'Languages', topic: 'Spanish: Numbers', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Five', options: ['Cinco', 'Cuatro', 'Seis', 'Siete'], correctAnswer: 'Cinco' },

  // ===== GERMAN =====
  // Colors
  { id: 'l-de-co-01', subject: 'Languages', topic: 'German: Colors', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Red', options: ['Rot', 'Blau', 'Grün', 'Gelb'], correctAnswer: 'Rot' },
  { id: 'l-de-co-02', subject: 'Languages', topic: 'German: Colors', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Blue', options: ['Blau', 'Rot', 'Schwarz', 'Weiß'], correctAnswer: 'Blau' },
  { id: 'l-de-co-03', subject: 'Languages', topic: 'German: Colors', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Green', options: ['Grün', 'Gelb', 'Rot', 'Grau'], correctAnswer: 'Grün' },
  { id: 'l-de-co-04', subject: 'Languages', topic: 'German: Colors', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Yellow', options: ['Gelb', 'Grün', 'Blau', 'Rosa'], correctAnswer: 'Gelb' },
  { id: 'l-de-co-05', subject: 'Languages', topic: 'German: Colors', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Black', options: ['Schwarz', 'Weiß', 'Rot', 'Grün'], correctAnswer: 'Schwarz' },

  // Animals
  { id: 'l-de-an-01', subject: 'Languages', topic: 'German: Animals', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Dog', options: ['Hund', 'Katze', 'Vogel', 'Maus'], correctAnswer: 'Hund' },
  { id: 'l-de-an-02', subject: 'Languages', topic: 'German: Animals', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Cat', options: ['Katze', 'Hund', 'Pferd', 'Kuh'], correctAnswer: 'Katze' },
  { id: 'l-de-an-03', subject: 'Languages', topic: 'German: Animals', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Mouse', options: ['Maus', 'Haus', 'Laus', 'Raus'], correctAnswer: 'Maus' },
  { id: 'l-de-an-04', subject: 'Languages', topic: 'German: Animals', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Bird', options: ['Vogel', 'Fisch', 'Hund', 'Katze'], correctAnswer: 'Vogel' },
  { id: 'l-de-an-05', subject: 'Languages', topic: 'German: Animals', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Fish', options: ['Fisch', 'Tisch', 'Misch', 'Wisch'], correctAnswer: 'Fisch' },

  // ===== JAPANESE =====
  // Greetings
  { id: 'l-jp-gr-01', subject: 'Languages', topic: 'Japanese: Greetings', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Hello (Daytime)', options: ['Konnichiwa', 'Ohayou', 'Konbanwa', 'Sayonara'], correctAnswer: 'Konnichiwa' },
  { id: 'l-jp-gr-02', subject: 'Languages', topic: 'Japanese: Greetings', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Good Morning', options: ['Ohayou', 'Konnichiwa', 'Konbanwa', 'Arigatou'], correctAnswer: 'Ohayou' },
  { id: 'l-jp-gr-03', subject: 'Languages', topic: 'Japanese: Greetings', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Good Evening', options: ['Konbanwa', 'Konnichiwa', 'Ohayou', 'Sayonara'], correctAnswer: 'Konbanwa' },
  { id: 'l-jp-gr-04', subject: 'Languages', topic: 'Japanese: Greetings', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Thank you', options: ['Arigatou', 'Sumimasen', 'Gomen', 'Hai'], correctAnswer: 'Arigatou' },
  { id: 'l-jp-gr-05', subject: 'Languages', topic: 'Japanese: Greetings', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Goodbye', options: ['Sayonara', 'Konnichiwa', 'Arigatou', 'Hai'], correctAnswer: 'Sayonara' },

  // Numbers
  { id: 'l-jp-nu-01', subject: 'Languages', topic: 'Japanese: Numbers', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'One', options: ['Ichi', 'Ni', 'San', 'Shi'], correctAnswer: 'Ichi' },
  { id: 'l-jp-nu-02', subject: 'Languages', topic: 'Japanese: Numbers', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Two', options: ['Ni', 'Ichi', 'San', 'Go'], correctAnswer: 'Ni' },
  { id: 'l-jp-nu-03', subject: 'Languages', topic: 'Japanese: Numbers', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Three', options: ['San', 'Ni', 'Shi', 'Roku'], correctAnswer: 'San' },
  { id: 'l-jp-nu-04', subject: 'Languages', topic: 'Japanese: Numbers', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Four', options: ['Yon', 'Go', 'Roku', 'Nana'], correctAnswer: 'Yon' },
  { id: 'l-jp-nu-05', subject: 'Languages', topic: 'Japanese: Numbers', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Five', options: ['Go', 'Yon', 'Roku', 'Hachi'], correctAnswer: 'Go' },

  // ===== YORUBA =====
  // Greetings
  { id: 'l-yo-gr-01', subject: 'Languages', topic: 'Yoruba: Greetings', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Thank you', options: ['E se', 'Bawo', 'O dabo', 'Kaaro'], correctAnswer: 'E se' },
  { id: 'l-yo-gr-02', subject: 'Languages', topic: 'Yoruba: Greetings', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Hello/How are you?', options: ['Bawo', 'E se', 'O dabo', 'Kaale'], correctAnswer: 'Bawo' },
  { id: 'l-yo-gr-03', subject: 'Languages', topic: 'Yoruba: Greetings', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Good Morning', options: ['Kaaro', 'Kaale', 'Kaasan', 'O dabo'], correctAnswer: 'Kaaro' },
  { id: 'l-yo-gr-04', subject: 'Languages', topic: 'Yoruba: Greetings', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Good Afternoon', options: ['Kaasan', 'Kaaro', 'Kaale', 'E se'], correctAnswer: 'Kaasan' },
  { id: 'l-yo-gr-05', subject: 'Languages', topic: 'Yoruba: Greetings', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Goodbye', options: ['O dabo', 'Bawo', 'E se', 'Kaaro'], correctAnswer: 'O dabo' },

  // Family
  { id: 'l-yo-fa-01', subject: 'Languages', topic: 'Yoruba: Family', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Mother', options: ['Iya', 'Baba', 'Omo', 'Ore'], correctAnswer: 'Iya' },
  { id: 'l-yo-fa-02', subject: 'Languages', topic: 'Yoruba: Family', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Father', options: ['Baba', 'Iya', 'Egbon', 'Aburo'], correctAnswer: 'Baba' },
  { id: 'l-yo-fa-03', subject: 'Languages', topic: 'Yoruba: Family', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Child', options: ['Omo', 'Iya', 'Baba', 'Agba'], correctAnswer: 'Omo' },
  { id: 'l-yo-fa-04', subject: 'Languages', topic: 'Yoruba: Family', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Elder Sibling', options: ['Egbon', 'Aburo', 'Iya', 'Baba'], correctAnswer: 'Egbon' },
  { id: 'l-yo-fa-05', subject: 'Languages', topic: 'Yoruba: Family', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Younger Sibling', options: ['Aburo', 'Egbon', 'Omo', 'Ore'], correctAnswer: 'Aburo' },

  // ===== ROMANIAN =====
  // Greetings
  { id: 'l-ro-gr-01', subject: 'Languages', topic: 'Romanian: Greetings', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Hello', options: ['Salut', 'Pa', 'Mulțumesc', 'Da'], correctAnswer: 'Salut' },
  { id: 'l-ro-gr-02', subject: 'Languages', topic: 'Romanian: Greetings', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Goodbye', options: ['La revedere', 'Salut', 'Mulțumesc', 'Nu'], correctAnswer: 'La revedere' },
  { id: 'l-ro-gr-03', subject: 'Languages', topic: 'Romanian: Greetings', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Thank you', options: ['Mulțumesc', 'Salut', 'Pa', 'Te rog'], correctAnswer: 'Mulțumesc' },
  { id: 'l-ro-gr-04', subject: 'Languages', topic: 'Romanian: Greetings', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Yes', options: ['Da', 'Nu', 'Poate', 'Salut'], correctAnswer: 'Da' },
  { id: 'l-ro-gr-05', subject: 'Languages', topic: 'Romanian: Greetings', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'No', options: ['Nu', 'Da', 'Salut', 'Pa'], correctAnswer: 'Nu' },

  // Numbers
  { id: 'l-ro-nu-01', subject: 'Languages', topic: 'Romanian: Numbers', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'One', options: ['Unu', 'Doi', 'Trei', 'Patru'], correctAnswer: 'Unu' },
  { id: 'l-ro-nu-02', subject: 'Languages', topic: 'Romanian: Numbers', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Two', options: ['Doi', 'Unu', 'Trei', 'Cinci'], correctAnswer: 'Doi' },
  { id: 'l-ro-nu-03', subject: 'Languages', topic: 'Romanian: Numbers', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Three', options: ['Trei', 'Doi', 'Patru', 'Șase'], correctAnswer: 'Trei' },
  { id: 'l-ro-nu-04', subject: 'Languages', topic: 'Romanian: Numbers', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Four', options: ['Patru', 'Cinci', 'Trei', 'Doi'], correctAnswer: 'Patru' },
  { id: 'l-ro-nu-05', subject: 'Languages', topic: 'Romanian: Numbers', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Five', options: ['Cinci', 'Patru', 'Șase', 'Șapte'], correctAnswer: 'Cinci' },
];
