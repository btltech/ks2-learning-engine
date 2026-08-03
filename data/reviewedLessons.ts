import { getCurriculumUnit } from './curriculumSequences';

const PSHE_EXPLANATIONS: Record<string, { vocabulary: string[]; explanation: string; practice: string[]; challenge: string }> = {
  'Friendship and respect': {
    vocabulary: ['respect — treating people as valuable', 'boundary — a limit that helps someone feel safe', 'trust — feeling able to rely on someone'],
    explanation: 'A healthy friendship includes kindness, honesty and respect. Friends can disagree, but they should listen and avoid pressure or cruelty. You are allowed to set a boundary, and a good friend should respect it. Tell a trusted adult if a friendship makes you feel frightened, controlled or unsafe.',
    practice: ['Name two qualities of a healthy friendship.', 'What could you say if a friend crosses a boundary?'],
    challenge: 'Explain why apologising and changing your behaviour are both important after hurting someone.',
  },
  'Understanding emotions': {
    vocabulary: ['emotion — a feeling such as joy, worry or anger', 'strategy — a planned way to handle something', 'trusted adult — an adult who listens and helps safely'],
    explanation: 'All emotions are valid, but some actions can hurt people. Pause, name the feeling and choose a safe response such as slow breathing, taking space or talking to a trusted adult. Strong feelings usually become easier to manage when we notice them early.',
    practice: ['Name a body clue that might show someone is worried.', 'Choose one safe strategy for managing anger.'],
    challenge: 'Create a three-step plan for a moment when a feeling becomes overwhelming.',
  },
  'Staying safe online': {
    vocabulary: ['personal information — details that identify you', 'privacy — control over who can access information', 'report — tell a trusted person or service about a concern'],
    explanation: 'Keep passwords and identifying details private. People online may not be who they claim to be, so never arrange to meet an online contact without a trusted adult. Stop, block, save evidence and tell a trusted adult if something feels wrong. You will not be in trouble for asking for help.',
    practice: ['List two details that should stay private.', 'What four actions can you take after receiving a worrying message?'],
    challenge: 'Explain why a message from a familiar account might still need checking.',
  },
  'Families and relationships': {
    vocabulary: ['family — people who care for and support one another', 'relationship — a connection between people', 'respect — recognising another person’s dignity and choices'],
    explanation: 'Families can look different, and no single family structure is the only correct one. Healthy relationships involve care, safety, honesty and respect. Nobody should be made to feel ashamed because their family is different from someone else’s.',
    practice: ['Name two features of a caring relationship.', 'How can you show respect when someone’s family is different from yours?'],
    challenge: 'Explain why actions are a better sign of a healthy relationship than appearances.',
  },
  'Conflict and repair': {
    vocabulary: ['conflict — a serious disagreement', 'compromise — an agreement where each side adjusts', 'repair — actions that rebuild trust'],
    explanation: 'Disagreement is normal. A safe response is to pause, listen, explain your view without insults and look for a fair solution. If someone is being threatened, bullied or repeatedly controlled, it is not an ordinary disagreement and a trusted adult should help.',
    practice: ['Rewrite an angry accusation as a calm “I” statement.', 'When should an adult help with a conflict?'],
    challenge: 'Describe the difference between an apology and repairing harm.',
  },
  'Money choices': {
    vocabulary: ['need — something necessary', 'want — something desirable but not essential', 'budget — a plan for money'],
    explanation: 'Money is limited, so choices involve trade-offs. A simple budget separates needs, saving and optional spending. Advertising is designed to influence choices, so it is sensible to pause, compare and check before buying.',
    practice: ['Sort three example purchases into needs and wants.', 'Give one reason to save part of your money.'],
    challenge: 'Create a simple budget for £10 and explain your priorities.',
  },
  'Identity and belonging': {
    vocabulary: ['identity — the qualities and experiences that shape a person', 'belonging — feeling accepted and included', 'discrimination — unfair treatment based on who someone is'],
    explanation: 'People have many parts to their identity and deserve equal dignity. Difference is normal and can strengthen a community. If you notice unfair treatment, seek help, support the person safely and avoid joining in.',
    practice: ['Name two things that can be part of someone’s identity.', 'What is one safe way to respond to unfair treatment?'],
    challenge: 'Explain how a group can help everyone feel that they belong.',
  },
  'Health and wellbeing': {
    vocabulary: ['wellbeing — how healthy and able to cope someone feels', 'routine — actions repeated regularly', 'balance — giving appropriate time to different needs'],
    explanation: 'Sleep, movement, food, hygiene, relaxation and connection all support wellbeing. No single habit solves everything, and people may need different support. A trusted adult or health professional should help with a continuing worry about physical or mental health.',
    practice: ['Choose two habits that support sleep.', 'Who could help with a health worry that does not go away?'],
    challenge: 'Design a balanced after-school routine and explain each choice.',
  },
  'Media and influence': {
    vocabulary: ['influence — an effect on thoughts or choices', 'advertising — messages designed to persuade people to buy', 'edited — changed from the original'],
    explanation: 'Images, videos and recommendations can be edited or selected to persuade. Popularity does not make a claim true. Check the source, look for evidence and notice how a message is trying to make you feel before acting on it.',
    practice: ['Give two signs that a post may be trying to sell something.', 'What should you check before sharing a claim?'],
    challenge: 'Explain how repeated edited images might affect someone’s self-image.',
  },
  'Changing relationships': {
    vocabulary: ['change — becoming different over time', 'communication — sharing and receiving meaning', 'support network — people and services that can help'],
    explanation: 'Friendships can change as people grow, and that can bring mixed emotions. Honest, respectful communication can help, but nobody must remain in a relationship that feels harmful. Support is available from trusted adults and appropriate services.',
    practice: ['Write one respectful way to discuss a changing friendship.', 'Name two people who could be part of a support network.'],
    challenge: 'Explain how someone can be kind while still setting a firm boundary.',
  },
  'Community and democracy': {
    vocabulary: ['democracy — people taking part in decisions, often by voting', 'right — a protection or freedom people should have', 'responsibility — something a person is expected to do'],
    explanation: 'Communities use shared rules and democratic processes to make decisions. Rights protect people, while responsibilities help everyone exercise those rights safely. Voting is important, but listening, checking evidence and protecting minorities also matter.',
    practice: ['Give one right and a related responsibility.', 'Why should a group listen to people who did not win a vote?'],
    challenge: 'Design a fair process for deciding a class activity.',
  },
  'Preparing for transition': {
    vocabulary: ['transition — a move from one stage or setting to another', 'uncertainty — not knowing exactly what will happen', 'preparation — actions taken in advance'],
    explanation: 'Change can feel exciting and worrying at the same time. Preparation helps: gather accurate information, practise routines, plan who to ask and break large worries into smaller steps. Ask a trusted adult for support rather than carrying a serious worry alone.',
    practice: ['List two facts that would make a new school feel more predictable.', 'Write one question you could ask a trusted adult.'],
    challenge: 'Create a before, during and after plan for managing a major change.',
  },
};

const PSHE_MODELS: Record<string, string> = {
  'Friendship and respect': 'Sam says, “Please do not share that photo.” A respectful friend stops, deletes any copy and checks what Sam is comfortable with.',
  'Understanding emotions': 'Mia notices a tight chest before a presentation. She names the feeling as worry, takes five slow breaths and asks a trusted adult for support.',
  'Staying safe online': 'A new account asks Jay where he lives. Jay does not reply, saves the message, blocks the account and tells a trusted adult.',
  'Families and relationships': 'Two classmates describe different family homes. They listen without judging and focus on the care and support each family provides.',
  'Conflict and repair': 'Instead of saying “You always ruin everything,” Alex says, “I felt left out when the game started without me. Can we agree what to do next time?”',
  'Money choices': 'With £10, Priya sets aside £4 for a future goal, budgets £4 for a need and keeps £2 for an optional choice.',
  'Identity and belonging': 'When a classmate is excluded, Rowan checks they are safe, invites them to join and reports repeated unfair treatment to a trusted adult.',
  'Health and wellbeing': 'Lee has been tired for several days, so he restores a bedtime routine and tells a trusted adult rather than relying on an influencer’s health claim.',
  'Media and influence': 'An advert says “everyone has this”. Noor identifies the pressure, checks whether it is sponsored and compares reliable information before deciding.',
  'Changing relationships': 'A friend wants more space. Casey listens, respects the boundary and talks to a trusted adult about the difficult feelings it brings.',
  'Community and democracy': 'A class hears each proposal, agrees fair criteria, votes once each and still considers how the final choice affects the smaller group.',
  'Preparing for transition': 'Ari lists what is known, writes two questions for school staff and practises the new morning route with a trusted adult.',
};

export const getReviewedLesson = (subject: string, topic: string, age: number): string | null => {
  if (subject !== 'PSHE') return null;
  const unit = getCurriculumUnit(subject, topic, age);
  const content = PSHE_EXPLANATIONS[topic];
  if (!unit || !content) return null;

  return `# Learning Objective
${unit.objective}

# Key Vocabulary
${content.vocabulary.map((item) => `* ${item}`).join('\n')}

# Teach
${content.explanation}

# Modelled Example
${PSHE_MODELS[topic]}

# Guided Practice
${content.practice.map((item) => `* ${item}`).join('\n')}

# Independent Check
${content.challenge}`;
};
