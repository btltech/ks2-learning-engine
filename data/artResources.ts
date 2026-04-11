/**
 * Art Resources for KS2 Learning Engine
 * Famous artworks, artists, and visual learning materials
 */

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: number | string;
  imageUrl: string;
  thumbnailUrl: string;
  medium: string;
  style: string;
  period: string;
  country: string;
  funFacts: string[];
  techniques: string[];
  colours: string[];
  ks2Topics: string[];
}

export interface DrawingLesson {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ageGroup: number[];
  duration: string;
  materials: string[];
  steps: DrawingStep[];
  tips: string[];
  relatedArtworks: string[];
}

export interface DrawingStep {
  stepNumber: number;
  instruction: string;
  imageHint?: string;
  tip?: string;
}

// Famous artworks suitable for KS2 (public domain or educational use)
export const famousArtworks: Artwork[] = [
  {
    id: 'starry-night',
    title: 'The Starry Night',
    artist: 'Vincent van Gogh',
    year: 1889,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/300px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    medium: 'Oil on canvas',
    style: 'Post-Impressionism',
    period: '19th Century',
    country: 'Netherlands/France',
    funFacts: [
      'Van Gogh painted this from memory during the day, not at night!',
      'He was staying in a hospital when he painted it',
      'The swirling sky was inspired by his imagination, not real stars',
    ],
    techniques: ['Impasto (thick paint)', 'Swirling brushstrokes', 'Bold colour contrast'],
    colours: ['Deep blue', 'Yellow', 'White', 'Green'],
    ks2Topics: ['Famous Artists', 'Colour Theory', 'Drawing Techniques'],
  },
  {
    id: 'mona-lisa',
    title: 'Mona Lisa',
    artist: 'Leonardo da Vinci',
    year: '1503-1519',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/220px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
    medium: 'Oil on poplar panel',
    style: 'Renaissance',
    period: '16th Century',
    country: 'Italy',
    funFacts: [
      'The painting is smaller than most people expect - only 77cm x 53cm',
      'It took Leonardo over 16 years to complete',
      'Her mysterious smile changes depending on where you look',
    ],
    techniques: ['Sfumato (soft blending)', 'Chiaroscuro (light and shadow)', 'Atmospheric perspective'],
    colours: ['Earth tones', 'Brown', 'Green', 'Gold'],
    ks2Topics: ['Famous Artists', 'Art History', 'Drawing Techniques'],
  },
  {
    id: 'sunflowers',
    title: 'Sunflowers',
    artist: 'Vincent van Gogh',
    year: 1888,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Vincent_Willem_van_Gogh_127.jpg/800px-Vincent_Willem_van_Gogh_127.jpg',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Vincent_Willem_van_Gogh_127.jpg/220px-Vincent_Willem_van_Gogh_127.jpg',
    medium: 'Oil on canvas',
    style: 'Post-Impressionism',
    period: '19th Century',
    country: 'Netherlands/France',
    funFacts: [
      'Van Gogh painted 7 versions of sunflowers!',
      'He used a special yellow paint that was new at the time',
      'The sunflowers represent happiness and friendship',
    ],
    techniques: ['Thick brushstrokes', 'Warm colour palette', 'Texture through paint'],
    colours: ['Yellow', 'Orange', 'Brown', 'Green'],
    ks2Topics: ['Famous Artists', 'Colour Theory', 'Patterns and Textures'],
  },
  {
    id: 'great-wave',
    title: 'The Great Wave off Kanagawa',
    artist: 'Katsushika Hokusai',
    year: '1831',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1280px-Tsunami_by_hokusai_19th_century.jpg',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/300px-Tsunami_by_hokusai_19th_century.jpg',
    medium: 'Woodblock print',
    style: 'Ukiyo-e (Japanese)',
    period: '19th Century',
    country: 'Japan',
    funFacts: [
      'Hokusai was nearly 70 years old when he made this print',
      'Mount Fuji appears tiny in the background',
      'It\'s one of the most famous artworks in the world',
    ],
    techniques: ['Woodblock printing', 'Prussian blue ink', 'Dynamic composition'],
    colours: ['Prussian blue', 'White', 'Cream', 'Dark blue'],
    ks2Topics: ['Art History', 'Patterns and Textures', 'Famous Artists'],
  },
  {
    id: 'water-lilies',
    title: 'Water Lilies',
    artist: 'Claude Monet',
    year: '1906',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/300px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg',
    medium: 'Oil on canvas',
    style: 'Impressionism',
    period: '20th Century',
    country: 'France',
    funFacts: [
      'Monet painted over 250 water lily paintings!',
      'He built a special garden with a pond just to paint them',
      'Some of his water lily paintings are over 2 metres wide',
    ],
    techniques: ['Quick brushstrokes', 'Capturing light', 'Colour mixing on canvas'],
    colours: ['Blue', 'Green', 'Pink', 'Purple', 'White'],
    ks2Topics: ['Famous Artists', 'Colour Theory', 'Drawing Techniques'],
  },
  {
    id: 'girl-pearl-earring',
    title: 'Girl with a Pearl Earring',
    artist: 'Johannes Vermeer',
    year: '1665',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/220px-1665_Girl_with_a_Pearl_Earring.jpg',
    medium: 'Oil on canvas',
    style: 'Dutch Golden Age',
    period: '17th Century',
    country: 'Netherlands',
    funFacts: [
      'We don\'t know who the girl in the painting is!',
      'It\'s sometimes called "the Dutch Mona Lisa"',
      'The pearl earring might actually be made of tin, not pearl',
    ],
    techniques: ['Light and shadow', 'Realistic textures', 'Dark background contrast'],
    colours: ['Blue', 'Yellow', 'Brown', 'Black'],
    ks2Topics: ['Famous Artists', 'Art History', 'Drawing Techniques'],
  },
  {
    id: 'persistence-memory',
    title: 'The Persistence of Memory',
    artist: 'Salvador Dalí',
    year: 1931,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg',
    medium: 'Oil on canvas',
    style: 'Surrealism',
    period: '20th Century',
    country: 'Spain',
    funFacts: [
      'The melting clocks were inspired by runny cheese!',
      'The painting is very small - only 24cm x 33cm',
      'Dalí painted it in just 2 hours',
    ],
    techniques: ['Dreamlike imagery', 'Precise detail', 'Unusual combinations'],
    colours: ['Brown', 'Blue', 'Orange', 'White'],
    ks2Topics: ['Famous Artists', 'Art History'],
  },
  {
    id: 'scream',
    title: 'The Scream',
    artist: 'Edvard Munch',
    year: 1893,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/220px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg',
    medium: 'Tempera and pastel on cardboard',
    style: 'Expressionism',
    period: '19th Century',
    country: 'Norway',
    funFacts: [
      'Munch made 4 versions of The Scream',
      'The red sky might have been inspired by a volcanic eruption',
      'The figure isn\'t screaming - they\'re blocking out a scream they hear!',
    ],
    techniques: ['Expressive brushstrokes', 'Distorted shapes', 'Bold colours for emotion'],
    colours: ['Orange', 'Red', 'Blue', 'Black'],
    ks2Topics: ['Famous Artists', 'Colour Theory', 'Art History'],
  },
];

// Drawing lessons for KS2 students
export const drawingLessons: DrawingLesson[] = [
  {
    id: 'basic-shapes',
    title: 'Drawing with Basic Shapes',
    difficulty: 'Easy',
    ageGroup: [7, 8],
    duration: '15-20 minutes',
    materials: ['Pencil', 'Paper', 'Eraser', 'Coloured pencils (optional)'],
    steps: [
      { stepNumber: 1, instruction: 'Draw a large circle in the middle of your paper. This will be the head of an animal.', tip: 'Use light pencil strokes so you can erase easily' },
      { stepNumber: 2, instruction: 'Add two smaller circles on top for ears. Think about what animal you\'re making!', imageHint: 'bunny ears, cat ears, or bear ears' },
      { stepNumber: 3, instruction: 'Draw two small circles inside the big circle for eyes. Add tiny dots inside for pupils.' },
      { stepNumber: 4, instruction: 'Add a triangle or oval for the nose in the middle, below the eyes.' },
      { stepNumber: 5, instruction: 'Draw a curved line under the nose for a mouth. Make it smile!' },
      { stepNumber: 6, instruction: 'Add whiskers, fur details, or other features to make your animal unique.' },
      { stepNumber: 7, instruction: 'Colour in your animal using pencils or crayons. Think about what colours real animals are!', tip: 'You can make up fantasy colours too!' },
    ],
    tips: [
      'Start with light pencil lines',
      'Don\'t worry about mistakes - they make your art unique!',
      'Look at real photos of animals for inspiration',
    ],
    relatedArtworks: [],
  },
  {
    id: 'landscape-basics',
    title: 'Simple Landscape Drawing',
    difficulty: 'Easy',
    ageGroup: [7, 8, 9],
    duration: '20-25 minutes',
    materials: ['Pencil', 'Paper', 'Coloured pencils or crayons', 'Ruler (optional)'],
    steps: [
      { stepNumber: 1, instruction: 'Draw a horizontal line across your paper about 1/3 from the bottom. This is your horizon line.', tip: 'The horizon is where the sky meets the land' },
      { stepNumber: 2, instruction: 'Add mountains or hills by drawing bumpy lines above your horizon line.' },
      { stepNumber: 3, instruction: 'Draw a sun in the sky - a circle with lines coming out like rays.' },
      { stepNumber: 4, instruction: 'Add some clouds using fluffy, curved shapes.' },
      { stepNumber: 5, instruction: 'In the foreground (bottom part), draw some trees or flowers. Make them bigger because they\'re closer to you!' },
      { stepNumber: 6, instruction: 'Add details like birds, a path, or a river.' },
      { stepNumber: 7, instruction: 'Colour your landscape. Use blues for the sky, greens for grass, and any colours you like for flowers!' },
    ],
    tips: [
      'Things far away look smaller, things close look bigger',
      'Use lighter colours for things far away',
      'Add shadows to make things look 3D',
    ],
    relatedArtworks: ['water-lilies'],
  },
  {
    id: 'starry-night-inspired',
    title: 'Paint Like Van Gogh: Swirly Sky',
    difficulty: 'Medium',
    ageGroup: [8, 9, 10],
    duration: '25-30 minutes',
    materials: ['Paper', 'Blue, yellow, and white paint or crayons', 'Paintbrush or cotton buds'],
    steps: [
      { stepNumber: 1, instruction: 'Look at Van Gogh\'s "The Starry Night". Notice how the sky has swirling patterns.' },
      { stepNumber: 2, instruction: 'Draw a simple village or houses at the bottom of your paper.' },
      { stepNumber: 3, instruction: 'Starting from the top, make swirling circles in the sky using blue paint or crayon.' },
      { stepNumber: 4, instruction: 'Add a bright yellow moon and stars. Make them glow by adding white around them.' },
      { stepNumber: 5, instruction: 'Use thick, visible brushstrokes or crayon marks - don\'t try to blend smoothly!' },
      { stepNumber: 6, instruction: 'Add darker blues and lighter yellows to create contrast.' },
      { stepNumber: 7, instruction: 'Stand back and look at your swirly night sky. Van Gogh would be proud!' },
    ],
    tips: [
      'Van Gogh used thick paint called "impasto"',
      'Don\'t worry about being perfect - Van Gogh\'s style is expressive!',
      'The swirls show movement and energy',
    ],
    relatedArtworks: ['starry-night'],
  },
  {
    id: 'colour-wheel',
    title: 'Create Your Own Colour Wheel',
    difficulty: 'Easy',
    ageGroup: [7, 8, 9],
    duration: '20 minutes',
    materials: ['Paper', 'Red, yellow, and blue paint', 'Paintbrush', 'Paper plate or palette', 'Pencil'],
    steps: [
      { stepNumber: 1, instruction: 'Draw a large circle on your paper. Divide it into 6 equal sections like a pizza.' },
      { stepNumber: 2, instruction: 'Paint one section RED. This is a primary colour.' },
      { stepNumber: 3, instruction: 'Skip one section and paint the next one YELLOW. Another primary colour!' },
      { stepNumber: 4, instruction: 'Skip one section and paint the next one BLUE. That\'s all three primary colours!' },
      { stepNumber: 5, instruction: 'Now mix RED and YELLOW to make ORANGE. Paint the section between them.' },
      { stepNumber: 6, instruction: 'Mix YELLOW and BLUE to make GREEN. Paint the section between them.' },
      { stepNumber: 7, instruction: 'Mix BLUE and RED to make PURPLE (or VIOLET). Paint the last section.' },
    ],
    tips: [
      'Primary colours can\'t be made by mixing',
      'Secondary colours are made by mixing two primaries',
      'Colours opposite each other on the wheel are called "complementary"',
    ],
    relatedArtworks: ['sunflowers', 'starry-night'],
  },
  {
    id: 'self-portrait',
    title: 'Draw Your Self-Portrait',
    difficulty: 'Medium',
    ageGroup: [8, 9, 10],
    duration: '30 minutes',
    materials: ['Paper', 'Pencil', 'Mirror', 'Coloured pencils', 'Eraser'],
    steps: [
      { stepNumber: 1, instruction: 'Look in a mirror. Notice the shape of your face - is it oval, round, or heart-shaped?' },
      { stepNumber: 2, instruction: 'Draw an oval or the shape of your face lightly in pencil.' },
      { stepNumber: 3, instruction: 'Draw a line across the middle. Your eyes go on this line! Add two almond shapes.' },
      { stepNumber: 4, instruction: 'Draw your nose between your eyes and chin. Look at where yours sits.' },
      { stepNumber: 5, instruction: 'Add your mouth about halfway between your nose and chin.' },
      { stepNumber: 6, instruction: 'Draw your hair. Look at which way it falls and what shape it makes.' },
      { stepNumber: 7, instruction: 'Add your ears - they\'re usually between your eyebrows and nose level.' },
      { stepNumber: 8, instruction: 'Add details like eyebrows, eyelashes, and any special features that make you YOU!' },
      { stepNumber: 9, instruction: 'Colour your self-portrait. Try to match your real colours!' },
    ],
    tips: [
      'Eyes are in the middle of your head, not near the top',
      'Keep looking in the mirror as you draw',
      'Everyone\'s face is unique - celebrate what makes yours special!',
    ],
    relatedArtworks: ['mona-lisa', 'girl-pearl-earring'],
  },
  {
    id: 'japanese-wave',
    title: 'Draw a Wave Like Hokusai',
    difficulty: 'Medium',
    ageGroup: [9, 10, 11],
    duration: '25-30 minutes',
    materials: ['Paper', 'Blue pencils or paint', 'White crayon or paint', 'Black pen or marker'],
    steps: [
      { stepNumber: 1, instruction: 'Look at Hokusai\'s "Great Wave". Notice how the wave curves like a claw.' },
      { stepNumber: 2, instruction: 'Draw a large curved line that starts low on the left and curves up and over to the right.' },
      { stepNumber: 3, instruction: 'Add the "claw" shapes at the top of the wave - these are the spray and foam.' },
      { stepNumber: 4, instruction: 'Draw smaller waves in the background, getting smaller as they go further away.' },
      { stepNumber: 5, instruction: 'Add Mount Fuji as a small triangle in the background (optional).' },
      { stepNumber: 6, instruction: 'Colour the waves with different shades of blue - darker at the base, lighter at the top.' },
      { stepNumber: 7, instruction: 'Add white foam and spray using white crayon or paint.' },
    ],
    tips: [
      'The wave is much bigger than the mountain - this shows perspective',
      'Use curved lines to show movement',
      'Hokusai used a special blue called "Prussian Blue"',
    ],
    relatedArtworks: ['great-wave'],
  },
];

// Helper functions
export const getArtworkById = (id: string): Artwork | undefined => {
  return famousArtworks.find(a => a.id === id);
};

export const getArtworksByTopic = (topic: string): Artwork[] => {
  return famousArtworks.filter(a => a.ks2Topics.includes(topic));
};

export const getDrawingLessonById = (id: string): DrawingLesson | undefined => {
  return drawingLessons.find(l => l.id === id);
};

export const getDrawingLessonsByDifficulty = (difficulty: 'Easy' | 'Medium' | 'Hard'): DrawingLesson[] => {
  return drawingLessons.filter(l => l.difficulty === difficulty);
};

export const getDrawingLessonsForAge = (age: number): DrawingLesson[] => {
  return drawingLessons.filter(l => l.ageGroup.includes(age));
};
