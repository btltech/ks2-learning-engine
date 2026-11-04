import { KidCard } from './sunny/KidCard';
import { KidButton } from './sunny/KidButton';
import { Meter } from './sunny/Meter';
import { Owl } from './sunny/Owl';
import { SubjectPicture } from './sunny/SubjectPicture';
import './SunnyTopicsLesson.css';
import React, { useState, useEffect, useCallback } from 'react';
// Fix: 'Difficulty' is an enum used as a value, so it must be a value import. 'Subject' is only used as a type.
import { Difficulty, type Subject, type ProgressData } from '../types';
import { getTopicsForSubject } from '../services/geminiService';
import { createCacheKey } from '../services/cacheService';
import LoadingSpinner from './LoadingSpinner';
import OfflineBadge from './OfflineBadge';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { useGameSounds } from '../hooks/useGameSounds';
import {
  getCurriculumUnits,
  getYearGroupForAge,
} from '../data/curriculumSequences';

interface TopicSelectorProps {
  subject: Subject;
  studentAge: number;
  onSelect: (topic: string) => void;
  onBack: () => void;
  progress: ProgressData;
  supplementaryAction?: {
    label: string;
    description: string;
    icon: string;
    onClick: () => void;
  };
}

const TopicSelector: React.FC<TopicSelectorProps> = ({
  subject,
  studentAge,
  onSelect,
  onBack,
  progress,
  supplementaryAction,
}) => {
  const [query, setQuery] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { playClick } = useGameSounds();

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTopics = await getTopicsForSubject(subject.name, studentAge);
      if (fetchedTopics.length === 0) {
        setError('No topics available at the moment. Please try again.');
      } else {
        setTopics(fetchedTopics);
      }
    } catch (err) {
      console.error('Error fetching topics:', err);
      setError(
        "Oops! We couldn't load the topics. Please check your internet connection and try again.",
      );
    }
    setLoading(false);
  }, [subject.name, studentAge]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const completedTopics = progress[subject.name] || [];
  const curriculumUnits = getCurriculumUnits(subject.name, studentAge);
  const unitByTitle = new Map(
    curriculumUnits.map((unit) => [unit.title, unit]),
  );
  const firstIncompleteTitle = curriculumUnits.find(
    (unit) => !completedTopics.includes(unit.title),
  )?.title;

  const handleSelect = (topic: string) => {
    playClick();
    onSelect(topic);
  };

  const handleBack = () => {
    playClick();
    onBack();
  };

  const visibleTopics = topics.filter((topic) =>
    topic.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
  const completedCount = topics.filter((topic) =>
    completedTopics.includes(topic),
  ).length;
  const year = getYearGroupForAge(studentAge);

  return (
    <div className="sunny-topics sunny-ui">
      <button
        onClick={handleBack}
        className="sunny-back-button"
        aria-label="Go back to subject selection"
      >
        <ArrowLeftIcon aria-hidden="true" /> Back
      </button>
      <KidCard hero tint="sky" className="sunny-subject-banner">
        <SubjectPicture
          name={subject.name}
          fallback={subject.icon}
          size={110}
        />
        <div className="sunny-subject-summary">
          <h2>{subject.name} Island</h2>
          <p>
            Year {year} · {completedCount} of {topics.length} topics done
          </p>
          <Meter
            label={`${subject.name} topics completed`}
            value={completedCount}
            max={topics.length || 1}
          />
        </div>
        <div className="sunny-subject-tools">
          <ul className="sunny-year-chips" aria-label="Year groups">
            {[3, 4, 5, 6].map((group) => (
              <li key={group}>
                <span aria-current={year === group ? 'true' : undefined}>
                  Year {group}
                </span>
              </li>
            ))}
          </ul>
          <label className="sunny-topic-search">
            <span className="sr-only">Find a topic</span>
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a topic"
            />
          </label>
        </div>
      </KidCard>
      <p className="sunny-topic-intro">
        Year {year} · Follow the units in order so each lesson builds on the
        last.
      </p>
      <p>You can revisit any earlier unit whenever you need a reminder.</p>
      {supplementaryAction && (
        <KidButton
          variant="tint"
          tint="leaf"
          className="sunny-supplementary"
          onClick={supplementaryAction.onClick}
        >
          <span aria-hidden="true">{supplementaryAction.icon}</span>
          <span>
            <strong>{supplementaryAction.label}</strong>
            <span>{supplementaryAction.description}</span>
          </span>
          <span aria-hidden="true">→</span>
        </KidButton>
      )}
      <div aria-live="polite" aria-busy={loading}>
        {loading ? (
          <LoadingSpinner
            message={`Finding exciting ${subject.name} topics for you...`}
          />
        ) : error ? (
          <KidCard className="sunny-topic-error">
            <p>{error}</p>
            <KidButton onClick={fetchTopics}>Try Again</KidButton>
          </KidCard>
        ) : visibleTopics.length === 0 ? (
          <KidCard>
            <p>No topics match “{query}”.</p>
            <KidButton variant="white" onClick={() => setQuery('')}>
              Show all topics
            </KidButton>
          </KidCard>
        ) : (
          <ol
            className="sunny-topic-path"
            role="list"
            aria-label="Available topics"
          >
            {visibleTopics.map((topic, index) => {
              const isCompleted = completedTopics.includes(topic);
              const unit = unitByTitle.get(topic);
              const isRecommended = firstIncompleteTitle === topic;
              const lessonCacheKey = createCacheKey(
                'lesson',
                subject.name,
                topic,
                Difficulty.Medium,
                studentAge.toString(),
              );
              const strand = unit?.bankTopic;
              const startsStrand =
                index === 0 ||
                strand !== unitByTitle.get(visibleTopics[index - 1])?.bankTopic;
              return (
                <li
                  key={topic}
                  data-state={
                    isCompleted ? 'done' : isRecommended ? 'current' : 'new'
                  }
                >
                  {startsStrand && strand && (
                    <h3 className="sunny-topic-strand">
                      {strand.replace(`${subject.name}: `, '')}
                    </h3>
                  )}
                  <div className="sunny-topic-step">
                    <div className="sunny-path-stone" aria-hidden="true">
                      {isCompleted ? (
                        <CheckCircleIcon />
                      ) : (
                        unit?.order || topics.indexOf(topic) + 1
                      )}
                      {isRecommended && !isCompleted && (
                        <Owl
                          pose="wave"
                          height={82}
                          className="sunny-path-owl"
                        />
                      )}
                    </div>
                    <KidCard className="sunny-topic-label">
                      <button
                        onClick={() => handleSelect(topic)}
                        aria-label={`${topic}${isCompleted ? ' - completed' : ''}`}
                      >
                        <span className="sunny-topic-title">
                          <strong>{topic}</strong>
                          <span className="sunny-topic-status">
                            {isCompleted
                              ? '✓ Done'
                              : isRecommended
                                ? '★ You are here'
                                : 'New'}
                          </span>
                        </span>
                        <span className="sunny-topic-unit">
                          Unit {unit?.order || 1}
                        </span>
                        {unit?.objective && (
                          <span className="sunny-topic-objective">
                            {unit.objective}
                          </span>
                        )}
                        {isRecommended && !isCompleted && (
                          <span className="sunny-topic-recommendation">
                            Recommended next
                          </span>
                        )}
                        {unit?.practicalNote && (
                          <span className="sunny-topic-note">
                            ⚠ {unit.practicalNote}
                          </span>
                        )}
                        <span className="sunny-topic-start">
                          {isCompleted
                            ? 'Read again'
                            : isRecommended
                              ? 'Start here'
                              : 'Start'}{' '}
                          <span aria-hidden="true">→</span>
                        </span>
                        <OfflineBadge cacheKey={lessonCacheKey} />
                      </button>
                    </KidCard>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
};

export default TopicSelector;
