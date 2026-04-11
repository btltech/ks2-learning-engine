import { useState, useEffect } from 'react';
import { progressVisualizationService, SkillTree, SkillNode } from '../services/progressVisualizationService';

interface Props {
  subject: string;
  onClose: () => void;
}

export default function SkillTreeView({ subject, onClose }: Props) {
  const [skillTree, setSkillTree] = useState<SkillTree | null>(null);
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);

  useEffect(() => {
    loadSkillTree();
  }, [subject]);

  const loadSkillTree = () => {
    const tree = progressVisualizationService.getSkillTree(subject);
    setSkillTree(tree);
  };

  if (!skillTree) {
    return <div>Loading skill tree...</div>;
  }

  const getNodeColor = (node: SkillNode) => {
    if (node.isCompleted) return 'bg-green-500 border-green-600';
    if (node.isUnlocked) return 'bg-blue-500 border-blue-600';
    return 'bg-gray-300 border-gray-400';
  };

  const getNodeIcon = (node: SkillNode) => {
    if (node.isCompleted) return '✓';
    if (node.isUnlocked) return '🎯';
    return '🔒';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">{subject} Skill Tree</h2>
              <p className="text-purple-100">
                {skillTree.completedNodes} / {skillTree.totalNodes} skills mastered
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-3 bg-purple-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{
                width: `${(skillTree.completedNodes / skillTree.totalNodes) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Skill Tree Grid */}
        <div className="flex-1 overflow-auto p-8 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="relative" style={{ minHeight: '600px' }}>
            {/* Render nodes in grid */}
            {skillTree.nodes.map((node) => (
              <div
                key={node.id}
                className="absolute transition-all duration-300 hover:scale-110 cursor-pointer"
                style={{
                  left: `${node.position.x * 200}px`,
                  top: `${node.position.y * 150}px`,
                }}
                onClick={() => setSelectedNode(node)}
              >
                {/* Connection lines (simplified) */}
                {node.prerequisites.map((prereqId) => {
                  const prereq = skillTree.nodes.find((n) => n.id === prereqId);
                  if (prereq) {
                    return (
                      <div
                        key={prereqId}
                        className="absolute w-0.5 bg-gray-400"
                        style={{
                          height: `${Math.abs(prereq.position.y - node.position.y) * 150}px`,
                          left: '50%',
                          top: `-${Math.abs(prereq.position.y - node.position.y) * 150}px`,
                        }}
                      />
                    );
                  }
                  return null;
                })}

                {/* Node Circle */}
                <div
                  className={`w-24 h-24 rounded-full border-4 ${getNodeColor(
                    node
                  )} shadow-lg flex items-center justify-center text-white font-bold text-3xl`}
                >
                  {getNodeIcon(node)}
                </div>

                {/* Node Label */}
                <div className="mt-2 text-center">
                  <p className="font-bold text-sm text-gray-900">{node.name}</p>
                  {node.isUnlocked && !node.isCompleted && (
                    <p className="text-xs text-blue-600">{node.progress}%</p>
                  )}
                </div>

                {/* Level Badge */}
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white">
                  {node.level}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Node Details */}
        {selectedNode && (
          <div className="border-t-2 border-gray-200 p-6 bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedNode.name}
                </h3>
                <p className="text-gray-600 mb-4">{selectedNode.description}</p>

                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    <div>
                      <p className="text-xs text-gray-500">Level</p>
                      <p className="font-bold">{selectedNode.level}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <p className="text-xs text-gray-500">Required Score</p>
                      <p className="font-bold">{selectedNode.requiredScore}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    <div>
                      <p className="text-xs text-gray-500">Reward</p>
                      <p className="font-bold">+{selectedNode.rewards.points} pts</p>
                    </div>
                  </div>

                  {selectedNode.rewards.badge && (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{selectedNode.rewards.badge}</span>
                      <div>
                        <p className="text-xs text-gray-500">Badge</p>
                        <p className="font-bold">Earned!</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {selectedNode.isUnlocked && !selectedNode.isCompleted && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-700">Progress</span>
                      <span className="text-sm font-bold text-blue-600">
                        {selectedNode.progress}%
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${selectedNode.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Status */}
                {selectedNode.isCompleted && (
                  <div className="mt-4 p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                    <p className="text-green-800 font-semibold">✓ Skill Mastered!</p>
                  </div>
                )}

                {!selectedNode.isUnlocked && (
                  <div className="mt-4 p-3 bg-gray-50 border-2 border-gray-200 rounded-lg">
                    <p className="text-gray-600 font-semibold">
                      🔒 Complete prerequisites to unlock
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-gray-600 ml-4"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
