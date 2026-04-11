import React, { useState } from 'react';
import { UserGroupIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

interface ChildSelectorProps {
  children: Array<{ id: string; name: string; age: number }>;
  selectedChildId: string | null;
  onSelectChild: (childId: string) => void;
  parentCode?: string;
  onRefresh?: () => void | Promise<void>;
  onCopyCode?: () => void;
  onRegenerateCode?: () => void | Promise<void>;
  onSetChildPin?: (childId: string, pin: string) => void | Promise<void>;
  onRenameChild?: (childId: string, newName: string) => void | Promise<void>;
  onUnlinkChild?: (childId: string) => void | Promise<void>;
  onDeleteChild?: (childId: string) => void | Promise<void>;
}

const ChildSelector: React.FC<ChildSelectorProps> = ({
  children,
  selectedChildId,
  onSelectChild,
  parentCode,
  onRefresh,
  onCopyCode,
  onRegenerateCode,
  onSetChildPin,
  onRenameChild,
  onUnlinkChild,
  onDeleteChild
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [busyAction, setBusyAction] = useState<null | 'regenerate' | 'rename' | 'unlink' | 'delete'>(null);
  const [settingPin, setSettingPin] = useState(false);

  const handleCopyCode = () => {
    if (parentCode) {
      navigator.clipboard.writeText(parentCode);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
      if (onCopyCode) onCopyCode();
    }
  };

  const effectiveSelectedChildId = selectedChildId || (children.length > 0 ? children[0].id : null);
  const selectedChild = effectiveSelectedChildId ? children.find((c) => c.id === effectiveSelectedChildId) : undefined;

  const handleRegenerateCode = async () => {
    if (!onRegenerateCode) return;
    if (!confirm('Regenerate your parent code? Old codes will stop working.')) return;
    setBusyAction('regenerate');
    try {
      await onRegenerateCode();
      alert('✅ Parent code regenerated.');
    } catch (e: any) {
      alert(e?.message || 'Failed to regenerate parent code.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleRenameSelected = async () => {
    if (!selectedChild || !onRenameChild) return;
    const nextName = prompt('New name for this child:', selectedChild.name)?.trim() || '';
    if (!nextName) return;
    if (nextName.length > 40) {
      alert('Name is too long (max 40 characters).');
      return;
    }
    setBusyAction('rename');
    try {
      await onRenameChild(selectedChild.id, nextName);
      alert('✅ Child renamed.');
    } catch (e: any) {
      alert(e?.message || 'Failed to rename child.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleUnlinkSelected = async () => {
    if (!selectedChild || !onUnlinkChild) return;
    if (!confirm(`Unlink ${selectedChild.name}? They will no longer appear in your portal.`)) return;
    setBusyAction('unlink');
    try {
      await onUnlinkChild(selectedChild.id);
      alert('✅ Child unlinked.');
    } catch (e: any) {
      alert(e?.message || 'Failed to unlink child.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedChild || !onDeleteChild) return;
    if (!confirm(`Delete ${selectedChild.name}'s profile? This cannot be undone.`)) return;
    setBusyAction('delete');
    try {
      await onDeleteChild(selectedChild.id);
      alert('✅ Child profile deleted.');
    } catch (e: any) {
      alert(e?.message || 'Failed to delete child.');
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-2 border-purple-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <UserGroupIcon className="h-6 w-6 text-purple-600" />
          Your Children
        </h3>
        {onRefresh && (
          <button
            onClick={() => void onRefresh()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-bold"
            title="Refresh linked children"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Refresh
          </button>
        )}
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
          <p className="text-sm text-gray-500">
            Give your parent code to your child. On the login page they choose “Child” and enter
            their name, age, and your parent code.
          </p>
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
          {onRegenerateCode && (
            <button
              onClick={handleRegenerateCode}
              disabled={busyAction === 'regenerate'}
              className="px-4 py-2 rounded-lg font-bold bg-white border border-purple-300 text-purple-700 hover:bg-purple-100 disabled:opacity-50"
              title="Generate a new code (old code stops working)"
            >
              {busyAction === 'regenerate' ? '…' : 'Regenerate'}
            </button>
          )}
        </div>
        <p className="text-xs text-purple-700 mt-2">
          Tip: If you think someone is guessing your code, regenerate it.
        </p>
      </div>

      {selectedChild && (onSetChildPin || onRenameChild || onUnlinkChild || onDeleteChild) ? (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-bold text-gray-700">
            Manage selected child: <span className="text-gray-900">{selectedChild.name}</span>
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {onSetChildPin && (
              <button
                onClick={async () => {
                  if (!effectiveSelectedChildId) return;
                  const nextPin = prompt('Set/Reset PIN (4–6 digits). Share this PIN with your child:', '')?.trim() || '';
                  if (!nextPin) return;
                  if (!/^[0-9]{4,6}$/.test(nextPin)) {
                    alert('PIN must be 4 to 6 digits.');
                    return;
                  }
                  setSettingPin(true);
                  try {
                    await onSetChildPin(effectiveSelectedChildId, nextPin);
                    alert('✅ PIN set. Share it with your child.');
                  } catch (e: any) {
                    alert(e?.message || 'Failed to set PIN.');
                  } finally {
                    setSettingPin(false);
                  }
                }}
                disabled={settingPin}
                className="px-4 py-2 rounded-lg font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                title="Set or reset the child's PIN"
              >
                {settingPin ? 'Setting PIN…' : 'Set PIN'}
              </button>
            )}
            {onRenameChild && (
              <button
                onClick={handleRenameSelected}
                disabled={busyAction === 'rename'}
                className="px-4 py-2 rounded-lg font-bold bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 disabled:opacity-50"
              >
                {busyAction === 'rename' ? 'Renaming…' : 'Rename'}
              </button>
            )}
            {onUnlinkChild && (
              <button
                onClick={handleUnlinkSelected}
                disabled={busyAction === 'unlink'}
                className="px-4 py-2 rounded-lg font-bold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {busyAction === 'unlink' ? 'Unlinking…' : 'Unlink'}
              </button>
            )}
            {onDeleteChild && (
              <button
                onClick={handleDeleteSelected}
                disabled={busyAction === 'delete'}
                className="px-4 py-2 rounded-lg font-bold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              >
                {busyAction === 'delete' ? 'Deleting…' : 'Delete'}
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Rename changes what you see in the portal. Unlink removes them from your account. Delete removes the profile entirely.
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default ChildSelector;
