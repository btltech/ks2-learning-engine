/**
 * Drag and Drop Question Component
 * 
 * Interactive question where students drag items to correct zones
 * Supports touch and mouse interactions
 */

import React, { useState, useCallback, useRef } from 'react';
import { DragDropItem, DragDropZone } from '../types';

interface DragDropQuestionProps {
  items: DragDropItem[];
  zones: DragDropZone[];
  onComplete: (isCorrect: boolean, placements: Record<string, string>) => void;
}

export const DragDropQuestion: React.FC<DragDropQuestionProps> = ({ items, zones, onComplete }) => {
  const [placements, setPlacements] = useState<Record<string, string>>({}); // itemId -> zoneId
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null); // For touch devices
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, itemId: string) => {
    if (isSubmitted) return;
    e.dataTransfer.setData('text/plain', itemId);
    setDraggedItem(itemId);
  }, [isSubmitted]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
  }, []);

  // Handle drop on zone
  const handleDrop = useCallback((e: React.DragEvent, zoneId: string) => {
    if (isSubmitted) return;
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    
    // Remove item from previous zone if any
    const newPlacements = { ...placements };
    Object.keys(newPlacements).forEach(key => {
      if (newPlacements[key] === zoneId && key !== itemId) {
        // Keep other items in zone
      }
    });
    newPlacements[itemId] = zoneId;
    setPlacements(newPlacements);
    setDraggedItem(null);
  }, [placements, isSubmitted]);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Touch-friendly selection (for tablets/phones)
  const handleItemClick = useCallback((itemId: string) => {
    if (isSubmitted) return;
    setSelectedItem(itemId === selectedItem ? null : itemId);
  }, [selectedItem, isSubmitted]);

  // Touch-friendly zone selection
  const handleZoneClick = useCallback((zoneId: string) => {
    if (isSubmitted || !selectedItem) return;
    
    const newPlacements = { ...placements };
    newPlacements[selectedItem] = zoneId;
    setPlacements(newPlacements);
    setSelectedItem(null);
  }, [selectedItem, placements, isSubmitted]);

  // Remove item from zone
  const handleRemoveItem = useCallback((itemId: string) => {
    if (isSubmitted) return;
    const newPlacements = { ...placements };
    delete newPlacements[itemId];
    setPlacements(newPlacements);
  }, [placements, isSubmitted]);

  // Submit answers
  const handleSubmit = useCallback(() => {
    if (Object.keys(placements).length !== items.length) return;
    
    setIsSubmitted(true);
    
    // Check correctness
    let correctCount = 0;
    for (const item of items) {
      if (placements[item.id] === item.correctZoneId) {
        correctCount++;
      }
    }
    
    const isAllCorrect = correctCount === items.length;
    onComplete(isAllCorrect, placements);
  }, [placements, items, onComplete]);

  // Get items in a specific zone
  const getItemsInZone = (zoneId: string) => {
    return items.filter(item => placements[item.id] === zoneId);
  };

  // Get unplaced items
  const unplacedItems = items.filter(item => !placements[item.id]);
  const allPlaced = Object.keys(placements).length === items.length;

  return (
    <div ref={containerRef} className="space-y-6">
      <p className="text-center text-gray-600 font-medium">
        {selectedItem 
          ? 'Now tap a zone to place the item'
          : 'Drag items to the correct zones, or tap to select'
        }
      </p>

      {/* Unplaced Items */}
      {unplacedItems.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="text-sm font-bold text-gray-500 mb-3">Items to Sort</h4>
          <div className="flex flex-wrap gap-2">
            {unplacedItems.map((item) => (
              <div
                key={item.id}
                draggable={!isSubmitted}
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragEnd={handleDragEnd}
                onClick={() => handleItemClick(item.id)}
                className={`
                  px-4 py-2 rounded-full cursor-grab active:cursor-grabbing
                  font-medium transition-all select-none
                  ${draggedItem === item.id 
                    ? 'opacity-50' 
                    : selectedItem === item.id
                      ? 'bg-yellow-400 text-yellow-900 scale-110 shadow-lg ring-2 ring-yellow-500'
                      : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-md'
                  }
                `}
              >
                {item.content}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drop Zones */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(zones.length, 3)}, 1fr)` }}>
        {zones.map((zone) => {
          const zoneItems = getItemsInZone(zone.id);
          const isCorrectZone = isSubmitted && zoneItems.every(
            item => items.find(i => i.id === item.id)?.correctZoneId === zone.id
          );
          
          let borderColor = 'border-gray-300';
          if (isSubmitted) {
            borderColor = isCorrectZone ? 'border-green-500' : 'border-red-500';
          } else if (selectedItem) {
            borderColor = 'border-indigo-500 border-dashed';
          }

          return (
            <div
              key={zone.id}
              onDrop={(e) => handleDrop(e, zone.id)}
              onDragOver={handleDragOver}
              onClick={() => handleZoneClick(zone.id)}
              className={`
                min-h-[120px] p-4 rounded-xl border-2 transition-all
                ${borderColor}
                ${selectedItem ? 'hover:bg-indigo-50 cursor-pointer' : ''}
                ${isSubmitted ? (isCorrectZone ? 'bg-green-50' : 'bg-red-50') : 'bg-white'}
              `}
            >
              <h4 className={`text-center font-bold mb-3 pb-2 border-b ${
                isSubmitted 
                  ? (isCorrectZone ? 'text-green-700 border-green-200' : 'text-red-700 border-red-200')
                  : 'text-gray-700 border-gray-200'
              }`}>
                {zone.label}
              </h4>
              
              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {zoneItems.map((item) => {
                  const isCorrect = items.find(i => i.id === item.id)?.correctZoneId === zone.id;
                  
                  return (
                    <div
                      key={item.id}
                      className={`
                        px-3 py-1.5 rounded-full font-medium text-sm
                        flex items-center gap-2 transition-all
                        ${isSubmitted
                          ? (isCorrect 
                              ? 'bg-green-500 text-white' 
                              : 'bg-red-500 text-white')
                          : 'bg-indigo-100 text-indigo-700'
                        }
                      `}
                    >
                      {item.content}
                      {!isSubmitted && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(item.id);
                          }}
                          className="text-xs hover:text-red-600"
                        >
                          ✕
                        </button>
                      )}
                      {isSubmitted && (
                        <span>{isCorrect ? '✓' : '✗'}</span>
                      )}
                    </div>
                  );
                })}
                
                {zoneItems.length === 0 && !isSubmitted && (
                  <div className="text-gray-400 text-sm italic">
                    Drop items here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Indicator */}
      {!isSubmitted && (
        <div className="text-center text-sm text-gray-500">
          {Object.keys(placements).length} of {items.length} items placed
        </div>
      )}

      {/* Submit Button */}
      {!isSubmitted && (
        <button
          onClick={handleSubmit}
          disabled={!allPlaced}
          className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${
            allPlaced
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {allPlaced ? 'Check Answers' : `Place ${items.length - Object.keys(placements).length} more items`}
        </button>
      )}

      {/* Results */}
      {isSubmitted && (
        <div className="text-center p-4 rounded-xl bg-gray-50">
          {items.filter(item => placements[item.id] === item.correctZoneId).length === items.length ? (
            <div className="text-green-600 font-bold text-lg">
              🎉 Perfect! All items sorted correctly!
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-orange-600 font-bold text-lg">
                {items.filter(item => placements[item.id] === item.correctZoneId).length} of {items.length} correct
              </div>
              <p className="text-sm text-gray-500">
                Correct placements are shown in green
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DragDropQuestion;
