// Review-only synthetic data. The separate Vite config replaces service imports;
// these fixtures are not imported by the application or production build.
export const teacher = { id: 'synthetic-teacher', name: 'Sample Teacher', role: 'teacher', age: 35, badges: [], quizHistory: [] };
const query = new URLSearchParams(location.search);
const record = (action: string) => { ((window as any).__teacherCalls ||= []).push(action); };
export const learners = ['Sample Learner','Demo Learner','Example Learner'].map((studentName,i) => ({ studentId: 'synthetic-pupil-'+i, studentName, age: 9+i%2, points: 300-i*90, streak: 4-i, lastActive: '2026-11-06T10:00:00Z', totalQuizzes: 5-i, averageScore: [85,65,45][i], timeSpent: 60-i*10, subjectMastery: { Maths: [80,60,40][i], English: [90,70,50][i] } }));
export const sampleClass = { classId:'synthetic-class', className:'Sample Class', teacherId:teacher.id, teacherName:teacher.name, grade:'Year 4', joinCode:'DEMO-ONLY', studentIds:learners.map(p=>p.studentId), students: learners, createdAt:'2026-11-01T10:00:00Z', updatedAt:'2026-11-06T10:00:00Z' };
export const assignment = { homeworkId:'synthetic-homework', teacherId:teacher.id, title:'Sample fractions practice', description:'Synthetic assignment for visual review.', subject:'Maths', topics:['Fractions'], difficulty:'Medium', questionCount:10, dueDate:'2026-11-20T23:59:00Z', assignedClassIds:[sampleClass.classId], assignedTo:[sampleClass.classId], createdAt:'2026-11-01T10:00:00Z', updatedAt:'2026-11-06T10:00:00Z', submissions:[{ submissionId:'synthetic-submission', homeworkId:'synthetic-homework', studentId:learners[0].studentId, studentName:learners[0].studentName, submittedAt:'2026-11-06T10:00:00Z', score:80, totalQuestions:10, timeSpent:300, reviewed:false }] };
export const useUser = () => ({ user:teacher });
export const useGameSounds = () => ({ playClick:()=>{}, soundEnabled:false });
export const teacherWorkspaceService = {
 getClasses:async()=>{ if(query.has('error')) throw Error('Synthetic class loading error'); return query.has('empty')?[]:[sampleClass]; },
 getHomework:async()=>query.has('empty')?[]:[assignment],
 createClass:async(className:string,grade:string)=>{record('createClass');return {...sampleClass,classId:'synthetic-new-class',className,grade,studentIds:[],students:[]};},
 removeStudent:async()=>{record('removeStudent');},
 createHomework:async(details:any)=>{record('createHomework');return {...assignment,...details,homeworkId:'synthetic-new-homework',topics:[details.topic],submissions:[]};},
};
export const homeworkStats = (homework:any, assignedStudents:number) => { const submissions=homework.submissions||[];return {totalAssigned:assignedStudents,submitted:submissions.length,pending:Math.max(0,assignedStudents-submissions.length),averageScore:submissions.length?Math.round(submissions.reduce((s:number,p:any)=>s+p.score,0)/submissions.length):0}; };
const progress = learners.map(p=>({...p,grade:'4',recentActivity:[],strengths:['English'],weaknesses:p.averageScore<60?['Maths']:[]}));
export const teacherAnalyticsService = {
 getClasses:()=>query.has('empty')?[]:[{...sampleClass,grade:'4',students:sampleClass.studentIds}],
 getClassAnalytics:()=>({classId:sampleClass.classId,className:sampleClass.className,totalStudents:3,averageScore:65,totalQuizzes:12,totalTimeSpent:150,subjectPerformance:{Maths:{averageScore:60,quizzesCompleted:7,topTopics:['Addition'],strugglingTopics:['Fractions']},English:{averageScore:70,quizzesCompleted:5,topTopics:['Reading'],strugglingTopics:[]}},topPerformers:progress.slice(0,2),needingHelp:progress.slice(2)}),
 exportClassReport:()=>{record('enhancedExport');return JSON.stringify({source:'synthetic-review',className:sampleClass.className});},
};
export const homeworkService = { getTeacherHomework:()=>query.has('empty')?[]:[assignment], getHomeworkStats:()=>homeworkStats(assignment,3), isOverdue:()=>false };
export const questions = [{ question:'Which fraction is equal to one half?',options:['2/4','1/4','2/3','3/4'],correctAnswer:'2/4',explanation:'Two quarters make one half.' },{ question:'What is 3 + 4?',options:['5','6','7','8'],correctAnswer:'7',explanation:'Three and four make seven.' }];
export const generateQuiz = async()=>questions;
const classroomStudents = Object.fromEntries(learners.map((p,i)=>[p.studentId,{id:p.studentId,name:p.studentName,avatarColor:'#1E55C8',score:200-i*50,answers:[{questionIndex:0,correct:i!==2,timeMs:5000}],joinedAt:0}]));
let session:any = { id:'synthetic-session',sessionCode:'DEMO00',teacherId:teacher.id,teacherName:teacher.name,title:'Sample live fractions',subject:'Maths',topic:'Fractions',difficulty:'Medium',status:'waiting',questions,currentQuestionIndex:0,timePerQuestion:300,students:classroomStudents,createdAt:0,settings:{showLeaderboardDuringQuiz:true,showCorrectAnswers:true,allowLateJoin:true,randomizeQuestions:false,randomizeOptions:false} };
const listeners = new Set<(s:any)=>void>();
const emit = (patch:any) => { session={...session,...patch};listeners.forEach(listener=>listener(session)); };
(window as any).__teacherSession = { emit, listenerCount:()=>listeners.size };
export const classroomService = {
 createSession:async()=>{record('createSession');return session;}, joinSession:async()=>session,
 subscribeToSession:(_id:string,listener:(s:any)=>void)=>{listeners.add(listener);return()=>listeners.delete(listener);},
 startSession:async()=>{record('startSession');emit({status:'active',questionStartTime:Date.now()});},
 nextQuestion:async()=>{record('nextQuestion');const hasMore=session.currentQuestionIndex<questions.length-1;emit(hasMore?{currentQuestionIndex:session.currentQuestionIndex+1,questionStartTime:Date.now()}:{status:'completed'});return hasMore;},
 endSession:async()=>{record('endSession');emit({status:'completed'});},
 getLeaderboard:(s:any)=>Object.values(s.students||{}).sort((a:any,b:any)=>b.score-a.score),
 submitAnswer:async()=>{record('submitAnswer');},
};
