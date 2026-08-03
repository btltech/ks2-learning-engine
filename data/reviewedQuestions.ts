import { CognitiveLevel, Difficulty, QuestionType, type BankQuestion } from '../types';

type ReviewedQuestion = readonly [question: string, correct: string, wrong1: string, wrong2: string, explanation: string];

const QUESTIONS: Record<string, ReviewedQuestion[]> = {
  'Friendship and respect': [
    ['A friend says they do not want a hug. What should you do?', 'Respect their choice', 'Hug them anyway', 'Tell everyone', 'People can set boundaries about their own body.'],
    ['Which action shows a healthy friendship?', 'Listening and taking turns', 'Keeping someone’s secrets from trusted adults', 'Demanding to choose every game', 'Healthy friends show respect and do not control one another.'],
    ['A joke has upset someone. What is the best next step?', 'Stop, apologise and listen', 'Say they are too sensitive', 'Repeat it more loudly', 'Repair starts by stopping the harm and listening.'],
  ],
  'Understanding emotions': [
    ['What can help when a strong feeling arrives?', 'Pause and take slow breaths', 'Break something', 'Pretend feelings never happen', 'A pause creates space to choose a safe response.'],
    ['Who can help with a worry that will not go away?', 'A trusted adult', 'Only strangers online', 'Nobody', 'Trusted adults can listen and help keep you safe.'],
    ['Which statement about feelings is true?', 'All feelings are valid, but actions still need to be safe', 'Anger makes hurting people acceptable', 'Only happy feelings are normal', 'Feelings carry information; we remain responsible for our actions.'],
  ],
  'Staying safe online': [
    ['A game asks for your home address. What should you do?', 'Do not share it and tell a trusted adult', 'Post it publicly', 'Swap it for coins', 'Personal information should not be shared without trusted-adult help.'],
    ['Someone online makes you uncomfortable. What is the safest response?', 'Stop contact, save evidence and tell a trusted adult', 'Meet them alone', 'Send more personal details', 'Blocking, reporting and getting adult support are safe steps.'],
    ['Which password is safest?', 'A long unique passphrase', 'password', 'Your first name', 'Long, unique passwords are harder to guess.'],
  ],
  'Families and relationships': [
    ['What do caring families have in common?', 'They aim to provide care and safety', 'They all look exactly alike', 'They never disagree', 'Families can be different while still providing care and belonging.'],
    ['What is a respectful way to discuss a different family?', 'Use kind language and listen', 'Make assumptions', 'Say one family type is best', 'Respect does not depend on a family matching your own.'],
    ['When should a secret be shared with a trusted adult?', 'When it could mean someone is unsafe', 'Never under any circumstances', 'Only when it is funny', 'Safety matters more than keeping a harmful secret.'],
  ],
  'Conflict and repair': [
    ['What is a calm way to begin resolving a disagreement?', 'Explain what happened using “I” statements', 'Interrupt and shout', 'Post about it online', 'Clear, calm language helps people listen.'],
    ['What makes an apology meaningful?', 'Naming the harm and trying to repair it', 'Blaming the other person', 'Demanding instant forgiveness', 'A real apology accepts responsibility and supports repair.'],
    ['If a conflict feels unsafe, what should you do?', 'Move away and get a trusted adult', 'Stay and fight', 'Keep it secret', 'Getting help is the right response when safety is at risk.'],
  ],
  'Money choices': [
    ['What is saving?', 'Keeping money for a future need or goal', 'Spending every penny immediately', 'Borrowing without a plan', 'Saving helps prepare for future choices.'],
    ['Before buying something, what is useful to ask?', 'Do I need it and can I afford it?', 'Will an advert be impressed?', 'Can I hide the purchase?', 'A pause helps separate needs, wants and pressure.'],
    ['Why can online game purchases be risky?', 'Small payments can add up quickly', 'Digital money has no value', 'Every offer is free', 'Real money can be spent even when the item is virtual.'],
  ],
  'Identity and belonging': [
    ['What should you do if someone is treated unfairly for being different?', 'Get help and challenge it safely', 'Join in', 'Pretend it is always a joke', 'Safe action and adult support can challenge discrimination.'],
    ['Which statement is respectful?', 'People can belong to several groups and still be individuals', 'Everyone in a group is identical', 'Difference should be hidden', 'Identity is personal and can have many parts.'],
    ['What does inclusion mean?', 'Helping people participate and belong', 'Choosing only people like you', 'Ignoring barriers', 'Inclusion notices and removes unfair barriers.'],
  ],
  'Health and wellbeing': [
    ['Which habit supports wellbeing?', 'A regular sleep routine', 'Skipping sleep every night', 'Never taking a break', 'Sleep supports learning, mood and physical health.'],
    ['What is a balanced approach to food?', 'Eating a varied range over time', 'Labelling all foods as good or bad', 'Skipping meals to copy an influencer', 'Variety and regular nourishment support health.'],
    ['When a worry affects everyday life, what is a good step?', 'Talk to a trusted adult', 'Keep it secret forever', 'Follow unverified online advice', 'Support is available and asking is a strength.'],
  ],
  'Media and influence': [
    ['Why might an advert use an influencer?', 'To persuade an audience to buy or believe something', 'To guarantee the claim is true', 'To remove all bias', 'Influencers can be part of paid persuasion.'],
    ['A photo online looks perfect. What should you remember?', 'It may be selected or edited', 'It shows someone’s whole life', 'Everyone must copy it', 'Online posts rarely show the complete picture.'],
    ['How can you check a surprising claim?', 'Compare reliable sources and evidence', 'Share it before reading', 'Trust it because it has many likes', 'Popularity is not the same as accuracy.'],
  ],
  'Changing relationships': [
    ['A friendship is changing. What can help?', 'Communicate respectfully and seek support if needed', 'Spread rumours', 'Demand it stays identical', 'Relationships can change, and honest respectful communication helps.'],
    ['What is true about consent and boundaries?', 'A person can change their mind', 'Silence always means yes', 'Friends cannot set boundaries', 'Consent must be freely given and can be withdrawn.'],
    ['If someone pressures you to do something unsafe, what can you say?', 'No, leave and tell a trusted adult', 'I must agree to keep the friendship', 'I will keep it secret', 'A healthy relationship does not depend on unsafe pressure.'],
  ],
  'Community and democracy': [
    ['Why do communities use shared rules?', 'To support safety, fairness and cooperation', 'To give one person everything', 'To stop all discussion', 'Fair rules help people live and work together.'],
    ['What is a democratic way to make a class decision?', 'Hear views and use a fair vote', 'Let the loudest person decide', 'Exclude people who disagree', 'Participation and fair processes are central to democracy.'],
    ['A right usually comes with what?', 'Responsibilities to respect other people’s rights', 'Permission to harm others', 'No limits at all', 'Rights work alongside responsibilities.'],
  ],
  'Preparing for transition': [
    ['What can make a big change feel more manageable?', 'Find reliable information and make a small plan', 'Imagine only the worst outcome', 'Avoid every conversation', 'Information, planning and support reduce uncertainty.'],
    ['Who could help with questions about a new school?', 'A trusted adult or school staff member', 'An unknown private account', 'Nobody', 'Trusted people can give accurate information and support.'],
    ['Which statement about mixed feelings is true?', 'It is normal to feel excited and worried at the same time', 'Only one feeling is allowed', 'Worry means you will fail', 'Several feelings can exist together during change.'],
  ],
};
export const getReviewedQuestions = (subject: string, topic: string, age: number): BankQuestion[] => {
  if (subject !== 'PSHE') return [];
  return (QUESTIONS[topic] ?? []).map(([question, correct, wrong1, wrong2, explanation], index) => ({
    id: `reviewed-pshe-${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index + 1}`,
    subject,
    topic,
    ageGroup: [age],
    difficulty: Difficulty.Medium,
    question,
    options: [correct, wrong1, wrong2].sort(() => Math.random() - 0.5),
    correctAnswer: correct,
    explanation,
    questionType: QuestionType.MultipleChoice,
    cognitiveLevel: index === 0 ? CognitiveLevel.Understand : CognitiveLevel.Apply,
  }));
};
