import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  Circle, 
  Clock, 
  ChevronDown, 
  ChevronRight, 
  Filter,
  PieChart,
  Award
} from 'lucide-react';
import { nationalCurriculumObjectives, getObjectivesByYear, getObjectivesBySubject } from '../data/nationalCurriculum';
import { YearGroup, NCObjective } from '../types';

// Mock progress data generator (since we don't have a real backend yet)
const generateMockProgress = (objectives: NCObjective[]) => {
  const progress: Record<string, 'not-started' | 'in-progress' | 'mastered'> = {};
  objectives.forEach(obj => {
    const rand = Math.random();
    if (rand > 0.7) progress[obj.code] = 'mastered';
    else if (rand > 0.4) progress[obj.code] = 'in-progress';
    else progress[obj.code] = 'not-started';
  });
  return progress;
};

interface CurriculumCoverageDashboardProps {
  studentName?: string;
  studentYear?: YearGroup;
}

export const CurriculumCoverageDashboard: React.FC<CurriculumCoverageDashboardProps> = ({ 
  studentName = "Alex", 
  studentYear = YearGroup.Year5 
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('Maths');
  const [selectedYear, setSelectedYear] = useState<YearGroup>(studentYear);
  const [expandedStrands, setExpandedStrands] = useState<Record<string, boolean>>({});

  // Filter objectives
  const filteredObjectives = useMemo(() => {
    return (nationalCurriculumObjectives as NCObjective[]).filter(obj => 
      obj.subject === selectedSubject && 
      obj.yearGroup === selectedYear
    );
  }, [selectedSubject, selectedYear]);

  // Generate mock progress for the current view
  const progressData = useMemo(() => generateMockProgress(filteredObjectives), [filteredObjectives]);

  // Group by strand
  const objectivesByStrand = useMemo(() => {
    const groups: Record<string, NCObjective[]> = {};
    filteredObjectives.forEach(obj => {
      if (!groups[obj.strand]) {
        groups[obj.strand] = [];
      }
      groups[obj.strand].push(obj);
    });
    return groups;
  }, [filteredObjectives]);

  // Calculate stats
  const stats = useMemo(() => {
    let total = filteredObjectives.length;
    let mastered = 0;
    let inProgress = 0;
    let notStarted = 0;

    filteredObjectives.forEach(obj => {
      const status = progressData[obj.code];
      if (status === 'mastered') mastered++;
      else if (status === 'in-progress') inProgress++;
      else notStarted++;
    });

    return {
      total,
      mastered,
      inProgress,
      notStarted,
      coveragePercent: total > 0 ? Math.round(((mastered + inProgress) / total) * 100) : 0,
      masteryPercent: total > 0 ? Math.round((mastered / total) * 100) : 0
    };
  }, [filteredObjectives, progressData]);

  const toggleStrand = (strand: string) => {
    setExpandedStrands(prev => ({
      ...prev,
      [strand]: !prev[strand]
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mastered': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-amber-500" />;
      default: return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'mastered': return 'Mastered';
      case 'in-progress': return 'In Progress';
      default: return 'Not Started';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              National Curriculum Coverage
            </h1>
            <p className="text-gray-500 mt-1">Tracking progress for {studentName} against DfE statutory objectives</p>
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-indigo-500"
              >
                <option value="Maths">Maths</option>
                <option value="English">English</option>
                <option value="Science">Science</option>
                <option value="Art and Design">Art and Design</option>
                <option value="Computing">Computing</option>
                <option value="Design and Technology">Design and Technology</option>
                <option value="Geography">Geography</option>
                <option value="History">History</option>
                <option value="Languages">Languages</option>
                <option value="Music">Music</option>
                <option value="Physical Education">Physical Education</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            <div className="relative">
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value) as YearGroup)}
                className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-indigo-500"
              >
                <option value={3}>Year 3</option>
                <option value={4}>Year 4</option>
                <option value={5}>Year 5</option>
                <option value={6}>Year 6</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-full">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Objectives</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Mastery Level</p>
              <p className="text-2xl font-bold text-gray-900">{stats.masteryPercent}%</p>
              <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1">
                <div className="h-1.5 bg-green-500 rounded-full" style={{ width: `${stats.masteryPercent}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <PieChart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Coverage</p>
              <p className="text-2xl font-bold text-gray-900">{stats.coveragePercent}%</p>
              <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1">
                <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${stats.coveragePercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Detailed Breakdown by Strand</h2>
            <div className="flex gap-2 text-sm">
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Mastered</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-amber-500" /> In Progress</span>
              <span className="flex items-center gap-1"><Circle className="w-4 h-4 text-gray-300" /> Not Started</span>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {Object.keys(objectivesByStrand).length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No objectives found for this selection.
              </div>
            ) : (
              Object.entries(objectivesByStrand).map(([strand, objectives]: [string, NCObjective[]]) => {
                const isExpanded = expandedStrands[strand] || false;
                const strandMastered = objectives.filter(o => progressData[o.code] === 'mastered').length;
                const strandTotal = objectives.length;
                const strandProgress = Math.round((strandMastered / strandTotal) * 100);

                return (
                  <div key={strand} className="bg-white">
                    <button 
                      onClick={() => toggleStrand(strand)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                        <div className="text-left">
                          <h3 className="font-medium text-gray-900">{strand}</h3>
                          <p className="text-sm text-gray-500">{strandMastered}/{strandTotal} objectives mastered</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-2 bg-gray-200 rounded-full hidden sm:block">
                          <div 
                            className={`h-2 rounded-full ${strandProgress === 100 ? 'bg-green-500' : 'bg-indigo-500'}`} 
                            style={{ width: `${strandProgress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-10 text-right">{strandProgress}%</span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 space-y-3">
                        {objectives.map(obj => {
                          const status = progressData[obj.code];
                          return (
                            <div key={obj.code} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                              <div className="mt-0.5 flex-shrink-0">
                                {getStatusIcon(status)}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="text-xs font-mono text-gray-400">{obj.code}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(status)}`}>
                                    {getStatusLabel(status)}
                                  </span>
                                </div>
                                <p className="text-gray-800 text-sm leading-relaxed">{obj.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
