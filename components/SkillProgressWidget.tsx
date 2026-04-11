import { useState, useEffect } from 'react';
import { progressVisualizationService } from '../services/progressVisualizationService';
import { useNavigate } from 'react-router-dom';

export default function SkillProgressWidget() {
  const [trees, setTrees] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = () => {
    const subjects = ['Maths', 'English', 'Science'];
    const treeData = subjects.map(subject => ({
      subject,
      tree: progressVisualizationService.getSkillTree(subject)
    }));
    setTrees(treeData);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span>🌳</span> Skill Progress
      </h3>
      
      <div className="space-y-3">
        {trees.map(({ subject, tree }) => {
          const progress = tree.totalNodes > 0 
            ? (tree.completedNodes / tree.totalNodes) * 100 
            : 0;
          
          return (
            <div
              key={subject}
              className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              onClick={() => navigate('/progress')}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-700">{subject}</span>
                <span className="text-xs text-gray-500">
                  {tree.completedNodes}/{tree.totalNodes}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    subject === 'Maths' ? 'bg-blue-500' :
                    subject === 'English' ? 'bg-green-500' :
                    'bg-orange-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => navigate('/progress')}
        className="w-full mt-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-semibold text-sm transition-colors"
      >
        View All Skills
      </button>
    </div>
  );
}
