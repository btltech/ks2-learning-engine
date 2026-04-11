import React, { useState, useMemo } from 'react';
import { nationalCurriculumObjectives } from '../data/nationalCurriculum';
import { NCObjective, UserProfile, YearGroup } from '../types';
import { ChevronDownIcon, ChevronUpIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface CurriculumTrackingProps {
  user: UserProfile;
}

// Map app topics to NC strands
const TOPIC_TO_STRAND_MAP: Record<string, Record<string, string[]>> = {
  "Maths": {
    "Fractions": ["Number - fractions", "Number - fractions (including decimals)", "Number - fractions (including decimals and percentages)"],
    "Addition": ["Number - addition and subtraction", "Number - addition, subtraction, multiplication and division"],
    "Subtraction": ["Number - addition and subtraction", "Number - addition, subtraction, multiplication and division"],
    "Multiplication": ["Number - multiplication and division", "Number - addition, subtraction, multiplication and division"],
    "Division": ["Number - multiplication and division", "Number - addition, subtraction, multiplication and division"],
    "Geometry": ["Geometry - properties of shapes", "Geometry - position and direction"],
    "Measurements": ["Measurement"],
    "Statistics": ["Statistics"],
    "Algebra": ["Algebra"],
    "Ratio": ["Ratio and proportion"]
  },
  "English": {
    "Reading": ["Reading - word reading", "Reading - comprehension"],
    "Writing": ["Writing - transcription", "Writing - composition", "Writing - vocabulary, grammar and punctuation"],
    "Spelling": ["Writing - transcription"],
    "Grammar": ["Writing - vocabulary, grammar and punctuation"]
  },
  "Science": {
    "Plants": ["Plants"],
    "Animals": ["Animals, including humans"],
    "Living Things": ["Living things and their habitats"],
    "Evolution": ["Evolution and inheritance"],
    "Materials": ["Everyday materials", "Uses of everyday materials", "Properties and changes of materials", "States of matter"],
    "Light": ["Light"],
    "Sound": ["Sound"],
    "Electricity": ["Electricity"],
    "Forces": ["Forces", "Forces and magnets"],
    "Earth and Space": ["Earth and space"],
    "Rocks": ["Rocks"],
    "Seasons": ["Seasonal changes"]
  },
  "History": {
    "British History": ["British History"],
    "World History": ["World History"],
    "Local History": ["Local History"],
    "Romans": ["British History"],
    "Vikings": ["British History"],
    "Stone Age": ["British History"],
    "Egyptians": ["World History"],
    "Greeks": ["World History"],
    "Mayans": ["World History"]
  },
  "Geography": {
    "Locational Knowledge": ["Locational Knowledge"],
    "Place Knowledge": ["Place Knowledge"],
    "Human Geography": ["Human and Physical Geography"],
    "Physical Geography": ["Human and Physical Geography"],
    "Fieldwork": ["Geographical Skills and Fieldwork"],
    "Maps": ["Geographical Skills and Fieldwork"]
  },
  "Languages": {
    "Listening": ["Listening and Comprehension"],
    "Speaking": ["Speaking and Pronunciation"],
    "Reading": ["Reading and Comprehension"],
    "Writing": ["Writing"],
    "Grammar": ["Grammar"],
    "Vocabulary": ["Vocabulary"]
  },
  "Music": {
    "Performance": ["Performance"],
    "Composition": ["Composition"],
    "Listening": ["Listening"],
    "Notation": ["Notation"],
    "History": ["History of Music"],
    "Appreciation": ["Appreciation"]
  },
  "Physical Education": {
    "Movement": ["Movement Skills"],
    "Games": ["Games"],
    "Gymnastics": ["Gymnastics and Athletics"],
    "Athletics": ["Gymnastics and Athletics"],
    "Dance": ["Dance"],
    "Outdoor": ["Outdoor Activities"],
    "Swimming": ["Swimming"]
  }
};

const CurriculumTracking: React.FC<CurriculumTrackingProps> = ({ user }) => {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [expandedStrand, setExpandedStrand] = useState<string | null>(null);

  // Filter objectives by user's year group (or all if we want to show everything)
  // For now, let's show objectives for the user's current year group
  // We need to map the user's age to a year group if not explicitly set
  const userYearGroup = React.useMemo(() => {
    // Simple age to year group mapping
    if (user.age === 7 || user.age === 8) return 3;
    if (user.age === 8 || user.age === 9) return 4;
    if (user.age === 9 || user.age === 10) return 5;
    if (user.age >= 10) return 6;
    return 3; // Default
  }, [user.age]);

  const objectivesBySubject = useMemo(() => {
    const grouped: Record<string, Record<string, NCObjective[]>> = {};
    
    nationalCurriculumObjectives
      .filter(obj => obj.yearGroup === userYearGroup)
      .forEach(obj => {
        if (!grouped[obj.subject]) {
          grouped[obj.subject] = {};
        }
        if (!grouped[obj.subject][obj.strand]) {
          grouped[obj.subject][obj.strand] = [];
        }
        grouped[obj.subject][obj.strand].push(obj);
      });
      
    return grouped;
  }, [userYearGroup]);

  const getMasteryStatus = (subject: string, strand: string, objective: NCObjective) => {
    // Check if we have direct mastery data for the topic corresponding to this strand
    if (!user.mastery || !user.mastery[subject]) return 'not-started';

    // Find which topic maps to this strand
    const subjectMap = TOPIC_TO_STRAND_MAP[subject];
    if (!subjectMap) return 'not-started';

    // Find topics that include this strand
    const relevantTopics = Object.entries(subjectMap)
      .filter(([_, strands]) => strands.includes(strand))
      .map(([topic]) => topic);

    if (relevantTopics.length === 0) return 'not-started';

    // Calculate average score across relevant topics
    let totalScore = 0;
    let count = 0;

    relevantTopics.forEach(topic => {
      const score = user.mastery[subject][topic];
      if (score !== undefined) {
        totalScore += score;
        count++;
      }
    });

    if (count === 0) return 'not-started';
    
    const avgScore = totalScore / count;
    
    if (avgScore >= 80) return 'mastered';
    if (avgScore > 0) return 'in-progress';
    return 'not-started';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'text-green-600 bg-green-50 border-green-200';
      case 'in-progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-400 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mastered': return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'in-progress': return <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />; // Or a partial circle
      default: return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        📚 Curriculum Coverage (Year {userYearGroup})
      </h3>
      <p className="text-gray-600 mb-6">
        Track progress against statutory National Curriculum objectives.
      </p>

      <div className="space-y-4">
        {Object.entries(objectivesBySubject).map(([subject, strands]) => (
          <div key={subject} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedSubject(expandedSubject === subject ? null : subject)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-bold text-gray-700">{subject}</span>
              {expandedSubject === subject ? (
                <ChevronUpIcon className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {expandedSubject === subject && (
              <div className="p-4 space-y-4 bg-white">
                {Object.entries(strands).map(([strand, objectives]) => {
                  // Calculate strand progress
                  const masteredCount = objectives.filter(obj => getMasteryStatus(subject, strand, obj) === 'mastered').length;
                  const progressPercent = Math.round((masteredCount / objectives.length) * 100);

                  return (
                    <div key={strand} className="border border-gray-100 rounded-lg">
                      <button
                        onClick={() => setExpandedStrand(expandedStrand === strand ? null : strand)}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div>
                          <div className="font-semibold text-gray-700">{strand}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {masteredCount}/{objectives.length} objectives mastered
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          {expandedStrand === strand ? (
                            <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {expandedStrand === strand && (
                        <div className="p-3 space-y-2 bg-gray-50/50">
                          {objectives.map(obj => {
                            const status = getMasteryStatus(subject, strand, obj);
                            return (
                              <div 
                                key={obj.code} 
                                className={`p-3 rounded-lg border flex gap-3 items-start ${getStatusColor(status)}`}
                              >
                                <div className="mt-0.5 flex-shrink-0">
                                  {getStatusIcon(status)}
                                </div>
                                <div>
                                  <div className="text-xs font-bold opacity-70 mb-0.5">{obj.code}</div>
                                  <div className="text-sm">{obj.description}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurriculumTracking;
