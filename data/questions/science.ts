import { BankQuestion, Difficulty } from '../../types';

export const scienceQuestions: BankQuestion[] = [
  // ===== ANIMALS (20 Questions) =====
  // Easy (7-8)
  { id: 's-an-01', subject: 'Science', topic: 'Animals', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which animal is a mammal?', options: ['Dog', 'Fish', 'Lizard', 'Fly'], correctAnswer: 'Dog' },
  { id: 's-an-02', subject: 'Science', topic: 'Animals', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What do fish use to breathe?', options: ['Gills', 'Lungs', 'Nose', 'Mouth'], correctAnswer: 'Gills' },
  { id: 's-an-03', subject: 'Science', topic: 'Animals', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which animal lays eggs?', options: ['Chicken', 'Cat', 'Cow', 'Dog'], correctAnswer: 'Chicken' },
  { id: 's-an-04', subject: 'Science', topic: 'Animals', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What does a herbivore eat?', options: ['Plants', 'Meat', 'Both', 'Insects'], correctAnswer: 'Plants' },
  { id: 's-an-05', subject: 'Science', topic: 'Animals', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which animal can fly?', options: ['Eagle', 'Dog', 'Cat', 'Mouse'], correctAnswer: 'Eagle' },
  { id: 's-an-06', subject: 'Science', topic: 'Animals', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Where do polar bears live?', options: ['Arctic', 'Desert', 'Jungle', 'Forest'], correctAnswer: 'Arctic' },
  { id: 's-an-07', subject: 'Science', topic: 'Animals', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'How many legs does a spider have?', options: ['8', '6', '4', '10'], correctAnswer: '8' },

  // Medium (9-10)
  { id: 's-an-08', subject: 'Science', topic: 'Animals', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is an invertebrate?', options: ['Animal without a backbone', 'Animal with a backbone', 'Animal that flies', 'Animal that swims'], correctAnswer: 'Animal without a backbone' },
  { id: 's-an-09', subject: 'Science', topic: 'Animals', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which is an amphibian?', options: ['Frog', 'Snake', 'Whale', 'Eagle'], correctAnswer: 'Frog' },
  { id: 's-an-10', subject: 'Science', topic: 'Animals', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is a habitat?', options: ['Where an animal lives', 'What an animal eats', 'How an animal moves', 'An animal\'s name'], correctAnswer: 'Where an animal lives' },
  { id: 's-an-11', subject: 'Science', topic: 'Animals', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which animal is a reptile?', options: ['Crocodile', 'Frog', 'Shark', 'Bear'], correctAnswer: 'Crocodile' },
  { id: 's-an-12', subject: 'Science', topic: 'Animals', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What do omnivores eat?', options: ['Plants and meat', 'Only plants', 'Only meat', 'Only insects'], correctAnswer: 'Plants and meat' },
  { id: 's-an-13', subject: 'Science', topic: 'Animals', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which bird cannot fly?', options: ['Penguin', 'Sparrow', 'Robin', 'Eagle'], correctAnswer: 'Penguin' },
  { id: 's-an-14', subject: 'Science', topic: 'Animals', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What covers a bird\'s body?', options: ['Feathers', 'Fur', 'Scales', 'Skin'], correctAnswer: 'Feathers' },

  // Hard (10-11)
  { id: 's-an-15', subject: 'Science', topic: 'Animals', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is adaptation?', options: ['Changing to survive', 'Eating food', 'Sleeping', 'Running fast'], correctAnswer: 'Changing to survive' },
  { id: 's-an-16', subject: 'Science', topic: 'Animals', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Which is a mammal that lays eggs?', options: ['Platypus', 'Bat', 'Whale', 'Kangaroo'], correctAnswer: 'Platypus' },
  { id: 's-an-17', subject: 'Science', topic: 'Animals', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is a food chain?', options: ['Energy transfer order', 'A list of food', 'Animals eating together', 'Plants growing'], correctAnswer: 'Energy transfer order' },
  { id: 's-an-18', subject: 'Science', topic: 'Animals', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What does "nocturnal" mean?', options: ['Active at night', 'Active in day', 'Sleeps all time', 'Eats plants'], correctAnswer: 'Active at night' },
  { id: 's-an-19', subject: 'Science', topic: 'Animals', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Which group are humans in?', options: ['Mammals', 'Reptiles', 'Amphibians', 'Birds'], correctAnswer: 'Mammals' },
  { id: 's-an-20', subject: 'Science', topic: 'Animals', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is metamorphosis?', options: ['Changing body form', 'Eating', 'Sleeping', 'Moving'], correctAnswer: 'Changing body form' },

  // ===== FORCES (20 Questions) =====
  // Easy (7-8)
  { id: 's-fo-01', subject: 'Science', topic: 'Forces', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What is a force?', options: ['A push or pull', 'Movement', 'Energy', 'Power'], correctAnswer: 'A push or pull' },
  { id: 's-fo-02', subject: 'Science', topic: 'Forces', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which is an example of a force?', options: ['Pushing a door', 'Sitting', 'Thinking', 'Resting'], correctAnswer: 'Pushing a door' },
  { id: 's-fo-03', subject: 'Science', topic: 'Forces', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What makes objects fall?', options: ['Gravity', 'Air', 'Weight', 'Friction'], correctAnswer: 'Gravity' },
  { id: 's-fo-04', subject: 'Science', topic: 'Forces', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What slows down a sliding object?', options: ['Friction', 'Gravity', 'Air', 'Speed'], correctAnswer: 'Friction' },
  { id: 's-fo-05', subject: 'Science', topic: 'Forces', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Can you see a force?', options: ['No, but you see its effects', 'Yes, always', 'Sometimes', 'Never'], correctAnswer: 'No, but you see its effects' },
  { id: 's-fo-06', subject: 'Science', topic: 'Forces', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What is the force between magnetic materials?', options: ['Magnetic force', 'Gravity', 'Friction', 'Air resistance'], correctAnswer: 'Magnetic force' },
  { id: 's-fo-07', subject: 'Science', topic: 'Forces', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What stops a ball rolling on grass?', options: ['Friction', 'Gravity', 'Air', 'Magnetism'], correctAnswer: 'Friction' },

  // Medium (9-10)
  { id: 's-fo-08', subject: 'Science', topic: 'Forces', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is air resistance?', options: ['Friction from air against moving objects', 'Wind speed', 'Air pressure', 'Temperature'], correctAnswer: 'Friction from air against moving objects' },
  { id: 's-fo-09', subject: 'Science', topic: 'Forces', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is weight?', options: ['Force of gravity pulling down', 'How much space something takes', 'How heavy material is', 'Density'], correctAnswer: 'Force of gravity pulling down' },
  { id: 's-fo-10', subject: 'Science', topic: 'Forces', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Can friction be helpful?', options: ['Yes, for grip and stopping', 'No, always bad', 'Sometimes', 'Only in water'], correctAnswer: 'Yes, for grip and stopping' },
  { id: 's-fo-11', subject: 'Science', topic: 'Forces', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is a balanced force?', options: ['Forces equal and opposite', 'All forces', 'No movement', 'Gravity only'], correctAnswer: 'Forces equal and opposite' },
  { id: 's-fo-12', subject: 'Science', topic: 'Forces', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What happens with unbalanced forces?', options: ['Object accelerates or changes direction', 'No movement', 'Stays still', 'Falls down'], correctAnswer: 'Object accelerates or changes direction' },
  { id: 's-fo-13', subject: 'Science', topic: 'Forces', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is Newton\'s First Law?', options: ['Objects stay still unless pushed', 'All forces push down', 'Gravity is strongest', 'Friction increases speed'], correctAnswer: 'Objects stay still unless pushed' },
  { id: 's-fo-14', subject: 'Science', topic: 'Forces', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'How can you reduce friction?', options: ['Use lubricants', 'Add more force', 'Increase weight', 'Use magnets'], correctAnswer: 'Use lubricants' },

  // Hard (10-11)
  { id: 's-fo-15', subject: 'Science', topic: 'Forces', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is terminal velocity?', options: ['Maximum speed when forces balance', 'Initial speed', 'Speed at takeoff', 'Falling speed'], correctAnswer: 'Maximum speed when forces balance' },
  { id: 's-fo-16', subject: 'Science', topic: 'Forces', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'How does a parachute work?', options: ['Increases air resistance to slow fall', 'Creates gravity', 'Adds weight', 'Reverses motion'], correctAnswer: 'Increases air resistance to slow fall' },
  { id: 's-fo-17', subject: 'Science', topic: 'Forces', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is a moment in physics?', options: ['Turning effect of a force', 'Time passing', 'Speed change', 'Gravity effect'], correctAnswer: 'Turning effect of a force' },
  { id: 's-fo-18', subject: 'Science', topic: 'Forces', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What are pressure and force related by?', options: ['Area: pressure = force/area', 'Weight only', 'Speed only', 'Distance'], correctAnswer: 'Area: pressure = force/area' },
  { id: 's-fo-19', subject: 'Science', topic: 'Forces', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is elastic deformation?', options: ['Returns to shape after force removed', 'Permanent change', 'Breaking', 'Melting'], correctAnswer: 'Returns to shape after force removed' },
  { id: 's-fo-20', subject: 'Science', topic: 'Forces', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is inertia?', options: ['Resistance to change in motion', 'Friction force', 'Weight', 'Density'], correctAnswer: 'Resistance to change in motion' },

  // ===== ENERGY (20 Questions) =====
  // Easy (7-8)
  { id: 's-en-01', subject: 'Science', topic: 'Energy', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What is energy?', options: ['Ability to do work or cause change', 'Heat only', 'Movement only', 'Light only'], correctAnswer: 'Ability to do work or cause change' },
  { id: 's-en-02', subject: 'Science', topic: 'Energy', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Give an example of potential energy', options: ['A ball at top of hill', 'A moving car', 'Burning fire', 'Light bulb'], correctAnswer: 'A ball at top of hill' },
  { id: 's-en-03', subject: 'Science', topic: 'Energy', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What is kinetic energy?', options: ['Energy of motion', 'Stored energy', 'Heat energy', 'Light energy'], correctAnswer: 'Energy of motion' },
  { id: 's-en-04', subject: 'Science', topic: 'Energy', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What does a solar panel convert?', options: ['Light energy to electrical energy', 'Heat to cold', 'Sound to light', 'Motion to heat'], correctAnswer: 'Light energy to electrical energy' },
  { id: 's-en-05', subject: 'Science', topic: 'Energy', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What type of energy does fire give?', options: ['Heat and light energy', 'Kinetic only', 'Potential only', 'Electrical'], correctAnswer: 'Heat and light energy' },
  { id: 's-en-06', subject: 'Science', topic: 'Energy', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Can energy be created?', options: ['No, it can only transfer', 'Yes, always', 'Sometimes', 'In sunlight'], correctAnswer: 'No, it can only transfer' },
  { id: 's-en-07', subject: 'Science', topic: 'Energy', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What is sound energy?', options: ['Energy from vibrations', 'Heat energy', 'Light energy', 'Motion only'], correctAnswer: 'Energy from vibrations' },

  // Medium (9-10)
  { id: 's-en-08', subject: 'Science', topic: 'Energy', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is the Law of Conservation of Energy?', options: ['Energy cannot be created or destroyed', 'All energy is heat', 'Energy only increases', 'Energy disappears'], correctAnswer: 'Energy cannot be created or destroyed' },
  { id: 's-en-09', subject: 'Science', topic: 'Energy', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is elastic potential energy?', options: ['Energy stored in stretched spring', 'Moving spring', 'Broken spring', 'Spring friction'], correctAnswer: 'Energy stored in stretched spring' },
  { id: 's-en-10', subject: 'Science', topic: 'Energy', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'How is wind energy useful?', options: ['Drives wind turbines for electricity', 'Creates heat', 'Makes plants grow', 'Creates rain'], correctAnswer: 'Drives wind turbines for electricity' },
  { id: 's-en-11', subject: 'Science', topic: 'Energy', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What causes friction to produce heat?', options: ['Particles rubbing and moving', 'Gravity', 'Air pressure', 'Electricity'], correctAnswer: 'Particles rubbing and moving' },
  { id: 's-en-12', subject: 'Science', topic: 'Energy', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is thermal energy?', options: ['Total energy of moving particles in matter', 'Temperature only', 'Heat transfer only', 'Friction only'], correctAnswer: 'Total energy of moving particles in matter' },
  { id: 's-en-13', subject: 'Science', topic: 'Energy', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'How do plants use solar energy?', options: ['Photosynthesis creates glucose', 'Burns for heat', 'Reflects light', 'Stores water'], correctAnswer: 'Photosynthesis creates glucose' },
  { id: 's-en-14', subject: 'Science', topic: 'Energy', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is gravitational potential energy?', options: ['Energy due to position in gravity field', 'Energy of motion', 'Heat energy', 'Light energy'], correctAnswer: 'Energy due to position in gravity field' },

  // Hard (10-11)
  { id: 's-en-15', subject: 'Science', topic: 'Energy', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is the main energy source for Earth?', options: ['The Sun', 'Gravity', 'Electricity', 'Nuclear'], correctAnswer: 'The Sun' },
  { id: 's-en-16', subject: 'Science', topic: 'Energy', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'How is fossil fuel energy released?', options: ['Combustion (burning)', 'Friction', 'Compression', 'Decay'], correctAnswer: 'Combustion (burning)' },
  { id: 's-en-17', subject: 'Science', topic: 'Energy', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is a renewable energy source?', options: ['Energy that can be replenished', 'Energy that runs out', 'Fossil fuels', 'Nuclear only'], correctAnswer: 'Energy that can be replenished' },
  { id: 's-en-18', subject: 'Science', topic: 'Energy', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What converts chemical energy in batteries?', options: ['Chemical reaction produces electrical current', 'Heat transfer', 'Friction', 'Magnetism'], correctAnswer: 'Chemical reaction produces electrical current' },
  { id: 's-en-19', subject: 'Science', topic: 'Energy', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Why is efficiency important in energy?', options: ['To waste less energy achieving goals', 'To use more energy', 'To save money only', 'To create more heat'], correctAnswer: 'To waste less energy achieving goals' },
  { id: 's-en-20', subject: 'Science', topic: 'Energy', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is the formula for kinetic energy?', options: ['KE = ½mv²', 'KE = mgh', 'KE = F×d', 'KE = Force/mass'], correctAnswer: 'KE = ½mv²' },

  // ===== MATERIALS (15 Questions) =====
  // Easy (7-8)
  { id: 's-mat-01', subject: 'Science', topic: 'Materials', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What are the three states of matter?', options: ['Solid, liquid, gas', 'Hot, cold, warm', 'Big, small, medium', 'Light, dark, clear'], correctAnswer: 'Solid, liquid, gas' },
  { id: 's-mat-02', subject: 'Science', topic: 'Materials', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which state keeps its shape?', options: ['Solid', 'Liquid', 'Gas', 'Plasma'], correctAnswer: 'Solid' },
  { id: 's-mat-03', subject: 'Science', topic: 'Materials', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What is a hard material?', options: ['Metal or stone', 'Water', 'Air', 'Paper'], correctAnswer: 'Metal or stone' },
  { id: 's-mat-04', subject: 'Science', topic: 'Materials', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What makes water flow?', options: ['It is a liquid', 'It is cold', 'It moves fast', 'It is heavy'], correctAnswer: 'It is a liquid' },
  { id: 's-mat-05', subject: 'Science', topic: 'Materials', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Can air be seen?', options: ['No, but we feel and use it', 'Yes, always', 'No, never', 'Sometimes'], correctAnswer: 'No, but we feel and use it' },

  // Medium (9-10)
  { id: 's-mat-06', subject: 'Science', topic: 'Materials', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is density?', options: ['Mass per unit volume', 'Weight only', 'Size only', 'Heaviness'], correctAnswer: 'Mass per unit volume' },
  { id: 's-mat-07', subject: 'Science', topic: 'Materials', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Why does ice float on water?', options: ['Ice is less dense than water', 'Ice is lighter', 'Water pushes it up', 'Air beneath it'], correctAnswer: 'Ice is less dense than water' },
  { id: 's-mat-08', subject: 'Science', topic: 'Materials', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is a reversible change?', options: ['Can be changed back', 'Permanent', 'Cannot undo', 'Creates new material'], correctAnswer: 'Can be changed back' },
  { id: 's-mat-09', subject: 'Science', topic: 'Materials', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is an irreversible change?', options: ['Cannot be changed back', 'Can be reversed', 'Temporary', 'Only physical'], correctAnswer: 'Cannot be changed back' },
  { id: 's-mat-10', subject: 'Science', topic: 'Materials', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What happens when water freezes?', options: ['Liquid becomes solid', 'Solid becomes liquid', 'Gas forms', 'Expands slightly'], correctAnswer: 'Liquid becomes solid' },

  // Hard (10-11)
  { id: 's-mat-11', subject: 'Science', topic: 'Materials', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What causes melting?', options: ['Heat energy breaks molecular bonds', 'Cold temperature', 'Pressure only', 'Friction'], correctAnswer: 'Heat energy breaks molecular bonds' },
  { id: 's-mat-12', subject: 'Science', topic: 'Materials', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is evaporation?', options: ['Liquid changing to gas at surface', 'Boiling', 'Condensation', 'Freezing'], correctAnswer: 'Liquid changing to gas at surface' },
  { id: 's-mat-13', subject: 'Science', topic: 'Materials', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is solubility?', options: ['How much solute dissolves in solvent', 'Ability to break', 'Hardness', 'Density measure'], correctAnswer: 'How much solute dissolves in solvent' },
  { id: 's-mat-14', subject: 'Science', topic: 'Materials', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Why do some materials rust?', options: ['Metal reacts with oxygen and water', 'Cold weather', 'Age only', 'Lack of care'], correctAnswer: 'Metal reacts with oxygen and water' },
  { id: 's-mat-15', subject: 'Science', topic: 'Materials', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is corrosion?', options: ['Chemical reaction damaging material', 'Physical damage', 'Wear and tear', 'Temperature change'], correctAnswer: 'Chemical reaction damaging material' },

  // ===== EARTH & SPACE (15 Questions) =====
  // Easy (7-8)
  { id: 's-es-01', subject: 'Science', topic: 'Earth & Space', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What orbits the Earth?', options: ['The Moon', 'The Sun', 'Mars', 'Venus'], correctAnswer: 'The Moon' },
  { id: 's-es-02', subject: 'Science', topic: 'Earth & Space', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What causes day and night?', options: ['Earth rotating', 'Moon movement', 'Sun moving', 'Seasons'], correctAnswer: 'Earth rotating' },
  { id: 's-es-03', subject: 'Science', topic: 'Earth & Space', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'How long is a day on Earth?', options: ['24 hours', '12 hours', '48 hours', '365 days'], correctAnswer: '24 hours' },
  { id: 's-es-04', subject: 'Science', topic: 'Earth & Space', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What is the largest planet?', options: ['Jupiter', 'Saturn', 'Earth', 'Mars'], correctAnswer: 'Jupiter' },
  { id: 's-es-05', subject: 'Science', topic: 'Earth & Space', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'How many continents are there?', options: ['7', '5', '6', '4'], correctAnswer: '7' },

  // Medium (9-10)
  { id: 's-es-06', subject: 'Science', topic: 'Earth & Space', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What causes seasons?', options: ['Tilt of Earth\'s axis', 'Distance from Sun', 'Moon position', 'Atmosphere'], correctAnswer: 'Tilt of Earth\'s axis' },
  { id: 's-es-07', subject: 'Science', topic: 'Earth & Space', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'How long is one year?', options: ['365 days (approximately)', '360 days', '366 days', '300 days'], correctAnswer: '365 days (approximately)' },
  { id: 's-es-08', subject: 'Science', topic: 'Earth & Space', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is the order of inner planets?', options: ['Mercury, Venus, Earth, Mars', 'Earth, Mercury, Venus, Mars', 'Venus, Mercury, Mars, Earth', 'Mars, Earth, Venus, Mercury'], correctAnswer: 'Mercury, Venus, Earth, Mars' },
  { id: 's-es-09', subject: 'Science', topic: 'Earth & Space', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What do we call a meteor that reaches Earth?', options: ['Meteorite', 'Meteor', 'Comet', 'Asteroid'], correctAnswer: 'Meteorite' },
  { id: 's-es-10', subject: 'Science', topic: 'Earth & Space', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is the Sun\'s main component?', options: ['Hydrogen and Helium', 'Oxygen and Nitrogen', 'Iron and Nickel', 'Carbon and Silicon'], correctAnswer: 'Hydrogen and Helium' },

  // Hard (10-11)
  { id: 's-es-11', subject: 'Science', topic: 'Earth & Space', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What causes tides?', options: ['Moon\'s gravitational pull', 'Wind', 'Earth\'s rotation', 'Sun\'s heat'], correctAnswer: 'Moon\'s gravitational pull' },
  { id: 's-es-12', subject: 'Science', topic: 'Earth & Space', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is a solar eclipse?', options: ['Moon between Earth and Sun blocking light', 'Earth between Sun and Moon', 'Moon blocks stars', 'Shadow only'], correctAnswer: 'Moon between Earth and Sun blocking light' },
  { id: 's-es-13', subject: 'Science', topic: 'Earth & Space', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'How far is the distance light travels in a year?', options: ['A light year', 'One million miles', 'Speed of light', 'To the Moon'], correctAnswer: 'A light year' },
  { id: 's-es-14', subject: 'Science', topic: 'Earth & Space', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is atmospheric pressure caused by?', options: ['Weight of air above', 'Wind speed', 'Heat from Sun', 'Earth\'s rotation'], correctAnswer: 'Weight of air above' },
  { id: 's-es-15', subject: 'Science', topic: 'Earth & Space', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is weathering?', options: ['Breaking down of rocks by weather', 'Weather patterns', 'Climate change', 'Wind speed'], correctAnswer: 'Breaking down of rocks by weather' },
];
