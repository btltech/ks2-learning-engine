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

  // ===== WELSH (Cymraeg) =====
  // Greetings
  { id: 'l-cy-gr-01', subject: 'Languages', topic: 'Welsh: Greetings', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Hello', options: ['Helo', 'Hwyl fawr', 'Diolch', 'Os gwelwch yn dda'], correctAnswer: 'Helo' },
  { id: 'l-cy-gr-02', subject: 'Languages', topic: 'Welsh: Greetings', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Goodbye', options: ['Hwyl fawr', 'Helo', 'Bore da', 'Nos da'], correctAnswer: 'Hwyl fawr' },
  { id: 'l-cy-gr-03', subject: 'Languages', topic: 'Welsh: Greetings', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Good morning', options: ['Bore da', 'Prynhawn da', 'Nos da', 'Helo'], correctAnswer: 'Bore da' },
  { id: 'l-cy-gr-04', subject: 'Languages', topic: 'Welsh: Greetings', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Thank you', options: ['Diolch', 'Croeso', 'Helo', 'Hwyl'], correctAnswer: 'Diolch' },
  { id: 'l-cy-gr-05', subject: 'Languages', topic: 'Welsh: Greetings', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'How are you?', options: ['Sut wyt ti?', 'Pwy wyt ti?', 'Ble wyt ti?', 'Beth ydy hwn?'], correctAnswer: 'Sut wyt ti?' },

  // Numbers
  { id: 'l-cy-nu-01', subject: 'Languages', topic: 'Welsh: Numbers', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'One', options: ['Un', 'Dau', 'Tri', 'Pedwar'], correctAnswer: 'Un' },
  { id: 'l-cy-nu-02', subject: 'Languages', topic: 'Welsh: Numbers', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Two', options: ['Dau', 'Un', 'Tri', 'Pump'], correctAnswer: 'Dau' },
  { id: 'l-cy-nu-03', subject: 'Languages', topic: 'Welsh: Numbers', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Three', options: ['Tri', 'Dau', 'Pedwar', 'Chwech'], correctAnswer: 'Tri' },
  { id: 'l-cy-nu-04', subject: 'Languages', topic: 'Welsh: Numbers', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Four', options: ['Pedwar', 'Pump', 'Tri', 'Dau'], correctAnswer: 'Pedwar' },
  { id: 'l-cy-nu-05', subject: 'Languages', topic: 'Welsh: Numbers', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Five', options: ['Pump', 'Pedwar', 'Chwech', 'Saith'], correctAnswer: 'Pump' },

  // Colors
  { id: 'l-cy-co-01', subject: 'Languages', topic: 'Welsh: Colors', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Red', options: ['Coch', 'Glas', 'Gwyrdd', 'Melyn'], correctAnswer: 'Coch' },
  { id: 'l-cy-co-02', subject: 'Languages', topic: 'Welsh: Colors', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Blue', options: ['Glas', 'Coch', 'Du', 'Gwyn'], correctAnswer: 'Glas' },
  { id: 'l-cy-co-03', subject: 'Languages', topic: 'Welsh: Colors', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Green', options: ['Gwyrdd', 'Melyn', 'Coch', 'Llwyd'], correctAnswer: 'Gwyrdd' },
  { id: 'l-cy-co-04', subject: 'Languages', topic: 'Welsh: Colors', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Yellow', options: ['Melyn', 'Gwyrdd', 'Glas', 'Pinc'], correctAnswer: 'Melyn' },
  { id: 'l-cy-co-05', subject: 'Languages', topic: 'Welsh: Colors', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Black', options: ['Du', 'Gwyn', 'Coch', 'Gwyrdd'], correctAnswer: 'Du' },

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
  { id: 'l-yo-gr-01', subject: 'Languages', topic: 'Yoruba: Greetings', ageGroup: [7, 8, 9, 10, 11], difficulty: Difficulty.Easy, question: 'How do you say “Thank you” in Yoruba?', options: ['Ẹ ṣé', 'Báwo ni?', 'Ó dàbọ̀', 'Ẹ káàárọ̀'], correctAnswer: 'Ẹ ṣé' },
  { id: 'l-yo-gr-02', subject: 'Languages', topic: 'Yoruba: Greetings', ageGroup: [7, 8, 9, 10, 11], difficulty: Difficulty.Easy, question: 'Which Yoruba phrase means “How are you?”', options: ['Báwo ni?', 'Ẹ ṣé', 'Ó dàbọ̀', 'Ẹ káalẹ́'], correctAnswer: 'Báwo ni?' },
  { id: 'l-yo-gr-03', subject: 'Languages', topic: 'Yoruba: Greetings', ageGroup: [7, 8, 9, 10, 11], difficulty: Difficulty.Easy, question: 'How do you say “Good morning” politely in Yoruba?', options: ['Ẹ káàárọ̀', 'Ẹ káalẹ́', 'Ẹ káàsán', 'Ó dàbọ̀'], correctAnswer: 'Ẹ káàárọ̀' },
  { id: 'l-yo-gr-04', subject: 'Languages', topic: 'Yoruba: Greetings', ageGroup: [7, 8, 9, 10, 11], difficulty: Difficulty.Medium, question: 'Which Yoruba greeting is used for “Good afternoon”?', options: ['Ẹ káàsán', 'Ẹ káàárọ̀', 'Ẹ káalẹ́', 'Ẹ ṣé'], correctAnswer: 'Ẹ káàsán' },
  { id: 'l-yo-gr-05', subject: 'Languages', topic: 'Yoruba: Greetings', ageGroup: [7, 8, 9, 10, 11], difficulty: Difficulty.Medium, question: 'Which Yoruba phrase means “Goodbye”?', options: ['Ó dàbọ̀', 'Báwo ni?', 'Ẹ ṣé', 'Ẹ káàárọ̀'], correctAnswer: 'Ó dàbọ̀' },

  // Family
  { id: 'l-yo-fa-01', subject: 'Languages', topic: 'Yoruba: Family', ageGroup: [7, 8, 9, 10, 11], difficulty: Difficulty.Easy, question: 'Which Yoruba word means “mother”?', options: ['Ìyá', 'Bàbá', 'Ọmọ', 'Ọ̀rẹ́'], correctAnswer: 'Ìyá' },
  { id: 'l-yo-fa-02', subject: 'Languages', topic: 'Yoruba: Family', ageGroup: [7, 8, 9, 10, 11], difficulty: Difficulty.Easy, question: 'Which Yoruba word means “father”?', options: ['Bàbá', 'Ìyá', 'Ẹ̀gbọ́n', 'Àbúrò'], correctAnswer: 'Bàbá' },
  { id: 'l-yo-fa-03', subject: 'Languages', topic: 'Yoruba: Family', ageGroup: [7, 8, 9, 10, 11], difficulty: Difficulty.Easy, question: 'Which Yoruba word means “child”?', options: ['Ọmọ', 'Ìyá', 'Bàbá', 'Àgbà'], correctAnswer: 'Ọmọ' },
  { id: 'l-yo-fa-04', subject: 'Languages', topic: 'Yoruba: Family', ageGroup: [7, 8, 9, 10, 11], difficulty: Difficulty.Medium, question: 'Which Yoruba word means “older sibling”?', options: ['Ẹ̀gbọ́n', 'Àbúrò', 'Ìyá', 'Bàbá'], correctAnswer: 'Ẹ̀gbọ́n' },
  { id: 'l-yo-fa-05', subject: 'Languages', topic: 'Yoruba: Family', ageGroup: [7, 8, 9, 10, 11], difficulty: Difficulty.Medium, question: 'Which Yoruba word means “younger sibling”?', options: ['Àbúrò', 'Ẹ̀gbọ́n', 'Ọmọ', 'Ọ̀rẹ́'], correctAnswer: 'Àbúrò' },

  // Colours and classroom objects
  { id: 'l-yo-co-01', subject: 'Languages', topic: 'Yoruba: Colours', ageGroup: [7, 8, 9, 10, 11], difficulty: Difficulty.Easy, question: 'Which Yoruba word means “red”?', options: ['Pupa', 'Dúdú', 'Funfun', 'Búlúù'], correctAnswer: 'Pupa' },
  { id: 'l-yo-co-02', subject: 'Languages', topic: 'Yoruba: Colours', ageGroup: [7, 8, 9, 10, 11], difficulty: Difficulty.Easy, question: 'Which Yoruba word means “black”?', options: ['Dúdú', 'Pupa', 'Yẹ́lò', 'Píìnkì'], correctAnswer: 'Dúdú' },
  { id: 'l-yo-co-03', subject: 'Languages', topic: 'Yoruba: Colours', ageGroup: [9, 10, 11], difficulty: Difficulty.Medium, question: 'Which Yoruba word means “blue”?', options: ['Búlúù', 'Funfun', 'Pupa', 'Àwọ̀ ewé'], correctAnswer: 'Búlúù' },
  { id: 'l-yo-co-04', subject: 'Languages', topic: 'Yoruba: Colours', ageGroup: [9, 10, 11], difficulty: Difficulty.Medium, question: 'Which Yoruba phrase means “green”?', options: ['Àwọ̀ ewé', 'Dúdú', 'Píìnkì', 'Yẹ́lò'], correctAnswer: 'Àwọ̀ ewé' },
  { id: 'l-yo-co-05', subject: 'Languages', topic: 'Yoruba: Colours', ageGroup: [9, 10, 11], difficulty: Difficulty.Medium, question: 'Which Yoruba word means “yellow”?', options: ['Yẹ́lò', 'Búlúù', 'Funfun', 'Pupa'], correctAnswer: 'Yẹ́lò' },

  // Numbers and age
  { id: 'l-yo-nu-01', subject: 'Languages', topic: 'Yoruba: Numbers', ageGroup: [7, 8, 9, 10, 11], difficulty: Difficulty.Easy, question: 'Which Yoruba word means “zero”?', options: ['Òdo', 'Ọ̀kan', 'Ogún', 'Mẹ́wàá'], correctAnswer: 'Òdo' },
  { id: 'l-yo-nu-02', subject: 'Languages', topic: 'Yoruba: Numbers', ageGroup: [7, 8, 9, 10, 11], difficulty: Difficulty.Easy, question: 'Which Yoruba word means “five”?', options: ['Àrún', 'Mẹ́fà', 'Méje', 'Ẹ̀rin'], correctAnswer: 'Àrún' },
  { id: 'l-yo-nu-03', subject: 'Languages', topic: 'Yoruba: Numbers', ageGroup: [7, 8, 9, 10, 11], difficulty: Difficulty.Easy, question: 'Which Yoruba word means “ten”?', options: ['Mẹ́wàá', 'Ogún', 'Ọ̀kànlá', 'Mẹ́sàn-án'], correctAnswer: 'Mẹ́wàá' },
  { id: 'l-yo-nu-04', subject: 'Languages', topic: 'Yoruba: Numbers', ageGroup: [9, 10, 11], difficulty: Difficulty.Medium, question: 'Which Yoruba word means “fifteen”?', options: ['Ẹ̀ẹ́dógún', 'Ẹ̀tàlá', 'Mẹ́rìnlá', 'Ogún'], correctAnswer: 'Ẹ̀ẹ́dógún' },
  { id: 'l-yo-nu-05', subject: 'Languages', topic: 'Yoruba: Numbers', ageGroup: [9, 10, 11], difficulty: Difficulty.Medium, question: 'Which Yoruba word means “twenty”?', options: ['Ogún', 'Mẹ́wàá', 'Ọ̀kànlá', 'Mẹ́fà'], correctAnswer: 'Ogún' },

  // Days and months
  { id: 'l-yo-da-01', subject: 'Languages', topic: 'Yoruba: Days', ageGroup: [7, 8, 9, 10, 11], difficulty: Difficulty.Easy, question: 'Which Yoruba phrase means “Sunday”?', options: ['Ọjọ́ Àìkú', 'Ọjọ́ Ajé', 'Ọjọ́ Ẹtì', 'Ọjọ́bọ'], correctAnswer: 'Ọjọ́ Àìkú' },
  { id: 'l-yo-da-02', subject: 'Languages', topic: 'Yoruba: Days', ageGroup: [7, 8, 9, 10, 11], difficulty: Difficulty.Easy, question: 'Which Yoruba phrase means “Monday”?', options: ['Ọjọ́ Ajé', 'Ọjọ́rú', 'Ọjọ́ Àbámẹ́ta', 'Ọjọ́ Ìṣẹ́gun'], correctAnswer: 'Ọjọ́ Ajé' },
  { id: 'l-yo-da-03', subject: 'Languages', topic: 'Yoruba: Days', ageGroup: [9, 10, 11], difficulty: Difficulty.Medium, question: 'Which Yoruba phrase means “Friday”?', options: ['Ọjọ́ Ẹtì', 'Ọjọ́bọ', 'Ọjọ́ Ajé', 'Ọjọ́ Àìkú'], correctAnswer: 'Ọjọ́ Ẹtì' },
  { id: 'l-yo-da-04', subject: 'Languages', topic: 'Yoruba: Days', ageGroup: [9, 10, 11], difficulty: Difficulty.Medium, question: 'Which Yoruba phrase means “Saturday”?', options: ['Ọjọ́ Àbámẹ́ta', 'Ọjọ́rú', 'Ọjọ́ Ẹtì', 'Ọjọ́ Ìṣẹ́gun'], correctAnswer: 'Ọjọ́ Àbámẹ́ta' },
  { id: 'l-yo-mo-01', subject: 'Languages', topic: 'Yoruba: Months', ageGroup: [7, 8, 9, 10, 11], difficulty: Difficulty.Easy, question: 'Which Yoruba month name means “January”?', options: ['Oṣù Ṣẹ́rẹ́', 'Oṣù Èrèlè', 'Oṣù Ògún', 'Oṣù Ọ̀pẹ̀'], correctAnswer: 'Oṣù Ṣẹ́rẹ́' },
  { id: 'l-yo-mo-02', subject: 'Languages', topic: 'Yoruba: Months', ageGroup: [9, 10, 11], difficulty: Difficulty.Medium, question: 'Which Yoruba month name means “March”?', options: ['Oṣù Ẹrẹ̀nà', 'Oṣù Ìgbé', 'Oṣù Agẹmọ', 'Oṣù Bélú'], correctAnswer: 'Oṣù Ẹrẹ̀nà' },
  { id: 'l-yo-mo-03', subject: 'Languages', topic: 'Yoruba: Months', ageGroup: [9, 10, 11], difficulty: Difficulty.Medium, question: 'Which Yoruba month name means “August”?', options: ['Oṣù Ògún', 'Oṣù Òkúdu', 'Oṣù Ọ̀wàrà', 'Oṣù Èrèlè'], correctAnswer: 'Oṣù Ògún' },
  { id: 'l-yo-mo-04', subject: 'Languages', topic: 'Yoruba: Months', ageGroup: [9, 10, 11], difficulty: Difficulty.Medium, question: 'Which Yoruba month name means “December”?', options: ['Oṣù Ọ̀pẹ̀', 'Oṣù Bélú', 'Oṣù Owewe', 'Oṣù Ẹ̀bìbí'], correctAnswer: 'Oṣù Ọ̀pẹ̀' },

  // Animals, weather and health
  { id: 'l-yo-an-01', subject: 'Languages', topic: 'Yoruba: Animals', ageGroup: [7, 8, 9, 10, 11], difficulty: Difficulty.Easy, question: 'Which Yoruba word means “dog”?', options: ['Ajá', 'Ológbò', 'Ẹṣin', 'Ẹyẹ'], correctAnswer: 'Ajá' },
  { id: 'l-yo-an-02', subject: 'Languages', topic: 'Yoruba: Animals', ageGroup: [7, 8, 9, 10, 11], difficulty: Difficulty.Easy, question: 'Which Yoruba word means “cat”?', options: ['Ológbò', 'Ajá', 'Àgùtàn', 'Adìẹ'], correctAnswer: 'Ológbò' },
  { id: 'l-yo-we-01', subject: 'Languages', topic: 'Yoruba: Weather', ageGroup: [7, 8, 9, 10, 11], difficulty: Difficulty.Easy, question: 'Which Yoruba word means “rain”?', options: ['Òjò', 'Ooru', 'Òtútù', 'Afẹ́fẹ́'], correctAnswer: 'Òjò' },
  { id: 'l-yo-we-02', subject: 'Languages', topic: 'Yoruba: Weather', ageGroup: [9, 10, 11], difficulty: Difficulty.Medium, question: 'Which Yoruba phrase means “it is raining”?', options: ['Òjò ń rọ̀', 'Ìgbà ooru', 'Afẹ́fẹ́', 'Hámátàn'], correctAnswer: 'Òjò ń rọ̀' },
  { id: 'l-yo-he-01', subject: 'Languages', topic: 'Yoruba: Body and health', ageGroup: [7, 8, 9, 10, 11], difficulty: Difficulty.Easy, question: 'Which Yoruba word means “head”?', options: ['Orí', 'Ojú', 'Etí', 'Ẹnu'], correctAnswer: 'Orí' },
  { id: 'l-yo-he-02', subject: 'Languages', topic: 'Yoruba: Body and health', ageGroup: [9, 10, 11], difficulty: Difficulty.Medium, question: 'Which Yoruba word means “doctor”?', options: ['Oníṣègùn', 'Olùkọ́', 'Akẹ́kọ̀ọ́', 'Awakọ̀'], correctAnswer: 'Oníṣègùn' },

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
