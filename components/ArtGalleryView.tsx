import React, { useState, useMemo } from 'react';
import { famousArtworks, drawingLessons, Artwork, DrawingLesson } from '../data/artResources';

interface ArtGalleryViewProps {
  onSelectArtwork: (artwork: Artwork) => void;
  onSelectLesson: (lesson: DrawingLesson) => void;
  onBack: () => void;
  studentAge: number;
}

type TabType = 'gallery' | 'lessons';

export const ArtGalleryView: React.FC<ArtGalleryViewProps> = ({
  onSelectArtwork,
  onSelectLesson,
  onBack,
  studentAge,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('gallery');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const availableLessons = useMemo(() => {
    return drawingLessons.filter(lesson => lesson.ageGroup.includes(studentAge));
  }, [studentAge]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Hard': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleArtworkClick = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
  };

  const handleCloseModal = () => {
    setSelectedArtwork(null);
  };

  const handleStartQuiz = () => {
    if (selectedArtwork) {
      onSelectArtwork(selectedArtwork);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors"
          >
            <span className="text-xl">←</span>
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-2xl font-bold text-purple-800 flex items-center gap-2">
            <span>🎨</span> Art Studio
          </h1>
          <div className="w-20" /> {/* Spacer */}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
              activeTab === 'gallery'
                ? 'bg-purple-500 text-white shadow-lg scale-105'
                : 'bg-white text-purple-600 hover:bg-purple-50'
            }`}
          >
            🖼️ Famous Art Gallery
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
              activeTab === 'lessons'
                ? 'bg-pink-500 text-white shadow-lg scale-105'
                : 'bg-white text-pink-600 hover:bg-pink-50'
            }`}
          >
            ✏️ Drawing Lessons
          </button>
        </div>

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div>
            <p className="text-gray-600 mb-4 text-center">
              Click on a famous artwork to learn about it and take a quiz!
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {famousArtworks.map(artwork => (
                <button
                  key={artwork.id}
                  onClick={() => handleArtworkClick(artwork)}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-105 text-left"
                >
                  <div className="aspect-square relative">
                    <img
                      src={artwork.thumbnailUrl}
                      alt={artwork.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white text-sm font-bold truncate">{artwork.title}</p>
                      <p className="text-white/80 text-xs truncate">{artwork.artist}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lessons Tab */}
        {activeTab === 'lessons' && (
          <div>
            <p className="text-gray-600 mb-4 text-center">
              Learn to draw step-by-step! These lessons are just for fun - no grades! 🎨
            </p>
            <div className="grid gap-4">
              {availableLessons.map(lesson => (
                <button
                  key={lesson.id}
                  onClick={() => onSelectLesson(lesson)}
                  className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-102 text-left flex items-center gap-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center text-3xl">
                    ✏️
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{lesson.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getDifficultyColor(lesson.difficulty)}`}>
                        {lesson.difficulty}
                      </span>
                      <span className="text-xs text-gray-500">⏱️ {lesson.duration}</span>
                      <span className="text-xs text-gray-500">📦 {lesson.materials.length} materials</span>
                    </div>
                  </div>
                  <span className="text-purple-500 text-xl">→</span>
                </button>
              ))}
              
              {availableLessons.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No lessons available for your age group yet.</p>
                  <p className="text-sm mt-2">Check back soon for more activities!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Artwork Detail Modal */}
        {selectedArtwork && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Artwork Image */}
              <div className="relative">
                <img
                  src={selectedArtwork.imageUrl}
                  alt={selectedArtwork.title}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={handleCloseModal}
                  className="absolute top-3 right-3 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:bg-white hover:text-black transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Artwork Info */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800">{selectedArtwork.title}</h2>
                <p className="text-lg text-gray-600">by {selectedArtwork.artist}</p>
                <p className="text-sm text-gray-500 mt-1">{selectedArtwork.year} • {selectedArtwork.country}</p>

                {/* Details */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm w-20">Style:</span>
                    <span className="font-medium">{selectedArtwork.style}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm w-20">Medium:</span>
                    <span className="font-medium">{selectedArtwork.medium}</span>
                  </div>
                </div>

                {/* Fun Facts */}
                <div className="mt-4 p-4 bg-yellow-50 rounded-xl">
                  <h3 className="font-bold text-yellow-800 mb-2">🌟 Fun Facts:</h3>
                  <ul className="space-y-1">
                    {selectedArtwork.funFacts.map((fact, idx) => (
                      <li key={idx} className="text-sm text-yellow-700 flex items-start gap-2">
                        <span>•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Techniques */}
                <div className="mt-4">
                  <h3 className="font-bold text-gray-700 mb-2">🎨 Techniques Used:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedArtwork.techniques.map((technique, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {technique}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Colours */}
                <div className="mt-4">
                  <h3 className="font-bold text-gray-700 mb-2">🎨 Main Colours:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedArtwork.colours.map((colour, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {colour}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 py-3 px-4 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleStartQuiz}
                    className="flex-1 py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 transition-all"
                  >
                    🧠 Take Quiz!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtGalleryView;
