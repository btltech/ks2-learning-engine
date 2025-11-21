import React, { useState } from 'react';
import { UserGroupIcon, PlusIcon, LinkIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface ChildSelectorProps {
  children: Array<{ id: string; name: string; age: number }>;
  selectedChildId: string | null;
  onSelectChild: (childId: string) => void;
  onAddChild: (childCode: string) => void;
  parentCode?: string;
  onCopyCode?: () => void;
}

const ChildSelector: React.FC<ChildSelectorProps> = ({
  children,
  selectedChildId,
  onSelectChild,
  onAddChild,
  parentCode,
  onCopyCode
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [linkCode, setLinkCode] = useState('');
  const [copiedText, setCopiedText] = useState(false);

  const handleAddChild = () => {
    if (linkCode.trim()) {
      onAddChild(linkCode);
      setLinkCode('');
      setShowAddModal(false);
    }
  };

  const handleCopyCode = () => {
    if (parentCode) {
      navigator.clipboard.writeText(parentCode);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
      if (onCopyCode) onCopyCode();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-2 border-purple-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <UserGroupIcon className="h-6 w-6 text-purple-600" />
          Your Children
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-bold"
        >
          <PlusIcon className="h-5 w-5" />
          Link Child
        </button>
      </div>

      {/* Children List */}
      {children.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => onSelectChild(child.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedChildId === child.id
                  ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                  : 'border-gray-200 hover:border-purple-300 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-800">{child.name}</p>
                  <p className="text-sm text-gray-600">Age: {child.age}</p>
                </div>
                <div className="text-3xl">👧</div>
              </div>
              {selectedChildId === child.id && (
                <div className="mt-2 pt-2 border-t border-purple-200">
                  <span className="text-xs font-bold text-purple-600">✓ Currently Monitoring</span>
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-bold">No children linked yet</p>
          <p className="text-sm text-gray-500 mb-4">Link your first child to start monitoring their progress</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-bold"
          >
            Link Your First Child
          </button>
        </div>
      )}

      {/* Your Parent Code Section */}
      <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <p className="text-sm font-bold text-gray-700 mb-2">📋 Your Parent Code (Share with your child)</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-3 py-2 bg-white border border-purple-300 rounded font-mono font-bold text-lg text-center text-purple-600">
            {parentCode || '----'}
          </code>
          <button
            onClick={handleCopyCode}
            disabled={!parentCode}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${
              copiedText
                ? 'bg-green-500 text-white'
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
          >
            {copiedText ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Add Child Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-pop-in">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-2xl font-bold text-gray-800">Link a Child</h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Ask your child to enter this parent code when they log in, or enter a child's code here if they've already created an account.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Child's Unique Code
                </label>
                <input
                  type="text"
                  value={linkCode}
                  onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
                  placeholder="e.g., ABC123"
                  maxLength={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all font-mono text-center text-lg font-bold"
                />
              </div>

              <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-200">
                💡 <strong>How it works:</strong> Each child gets a unique code when they create their account. Ask them for this code and enter it here to link them to your account.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddChild}
                  disabled={!linkCode.trim()}
                  className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold flex items-center gap-2 justify-center"
                >
                  <LinkIcon className="h-5 w-5" />
                  Link Child
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildSelector;
