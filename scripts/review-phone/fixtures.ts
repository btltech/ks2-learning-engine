const query = new URLSearchParams(location.search);
export const fixtureUser = { id:'visual-review', name:'Casey', role:'student', age:9, totalPoints:120, streak:4, unlockedItems:[], mastery:{Maths:{Addition:85}}, badges:[{id:'first-steps',name:'First Steps',description:'Complete your first quiz',icon:'🏁'}], quizHistory:[] };
export const status = { isUnlocked:!query.has('locked'), gamesRemaining:query.has('locked')?0:2, requiredCorrect:7, totalQuestions:10, passesCount:2, requiredPasses:3, highScores:{maths_mission:95}, gamesPlayed:1, activeSessionId:null };
const nodes = ['Counting Master','Adding Explorer','Number Detective','Times Table Titan'].map((name,i)=>({id:`review-${i}`,subject:'Maths',topic:name,name,description:`Practise ${name.toLowerCase()}`,level:i+1,prerequisites:[],isUnlocked:i<3,isCompleted:i===0,progress:i===0?85:i===1?40:0,requiredScore:70,rewards:{points:50},position:{x:i+1,y:1}}));
export const progressVisualizationService = { getSkillTree:(subject:string)=>({subject,nodes:nodes.map(n=>({...n,subject})),totalNodes:4,completedNodes:1,unlockedNodes:3}), getProgressData:()=>[], getWeeklySummary:()=>({totalQuizzes:5,averageScore:74,totalTime:24,topSubject:'Maths',improvement:8}), getCertificates:()=>[] };
export const socialLearningService = {getFriends:()=>[]};
export const gamesUnlockService = {setStatus:()=>{}};
const session = {sessionId:'review-session',gameId:'maths_mission',config:{yearGroup:'3-4'},status:'active',currentIndex:0,totalQuestions:10,correctAnswers:0,question:{id:'review-question',kind:'choice',prompt:'Which number makes 7 + ? = 10?',options:['2','3','4','5']},startedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+86400000).toISOString()};
export const gameService = { getState:async()=>({status,activeSession:query.has('session')?session:null}), startGame:async()=>({status,session}), answerQuestion:async()=>({status,session:{...session,currentIndex:1},correct:true,correctAnswer:'3',explanation:'Seven and three make ten.',completed:false}), abandonGame:async()=>({status}) };
export const streakRewardsService = { getStreak:()=>({currentStreak:4,longestStreak:7,totalDaysActive:12,streakFreezes:1}),getDailyRewards:()=>Array.from({length:7},(_,i)=>({type:'xp',value:10,claimed:i<3})),getChallenges:()=>[],checkDailyLogin:()=>({rewards:[]}),claimChallenge:()=>null };
export const useUser = ()=>({user:fixtureUser});
export const useGameSounds = ()=>({soundEnabled:false,playClick:()=>{},playCorrect:()=>{},playIncorrect:()=>{},toggleSound:()=>{}});

export const useGameSoundsEnhanced = useGameSounds;
export const getTopicsForSubject = async()=>['Addition','Subtraction','Multiplication'];
export const generateLesson = async()=> '# Addition\nAdding means putting groups together.\n## Worked example\nSeven and three make ten: 7 + 3 = 10.\n## Remember\nCount on to find the total.';
export const generateQuiz = async()=>[{question:'What is 7 + 3?',options:['8','9','10','11'],correctAnswer:'10',explanation:'Seven and three make ten.',questionType:query.get('kind')||'multiple-choice',matchingPairs:[{left:'One',right:'1'},{left:'Two',right:'2'}],dragItems:['Apple','Carrot'],dropZones:['Fruit','Vegetables']}];
export const generateQuizHint = async()=> 'Count on three from seven.';
export const askMiRa = async()=> 'Try counting on from seven.';
export const generateSubjectConnections = async()=>[];
export const generateProjectSuggestions = async()=>[];
export const generateConceptReinforcement = async()=>'';
export const useTTSEnhanced = ()=>({speak:()=>{},cancel:()=>{},pause:()=>{},resume:()=>{},isSpeaking:false,isPaused:false,isLoading:false});

export const generateFeedback = async()=>[];

const classroomSession={id:'local-session',sessionCode:'ABC123',teacherId:'teacher',teacherName:'Teacher',title:'Fractions practice',subject:'Maths',topic:'Fractions',difficulty:'Medium',status:'waiting',questions:[{question:'Which is the same as one half?',options:['2/4','1/4','2/3','3/4'],correctAnswer:'2/4',explanation:'Two quarters make one half.'}],currentQuestionIndex:0,timePerQuestion:300,students:{},createdAt:0,settings:{showLeaderboardDuringQuiz:false,showCorrectAnswers:true,allowLateJoin:true,randomizeQuestions:false,randomizeOptions:false}};
export const classroomService={joinSession:async()=>classroomSession,submitAnswer:async()=>{},getLeaderboard:()=>[],leaveSession:async()=>{},subscribeToSession:(_id,callback)=>{if(query.get('state')==='active')setTimeout(()=>callback({...classroomSession,status:'active',questionStartTime:Date.now()}),100);return()=>{}}};

export const recordQuizAttempts = async()=>{};
