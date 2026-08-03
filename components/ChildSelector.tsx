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
  onCreateChild?: (details: { name: string; age: number; pin: string }) =>
    | Promise<{ id: string; name: string; age: number }>
    | { id: string; name: string; age: number };
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
  onCreateChild,
  onSetChildPin,
  onRenameChild,
  onUnlinkChild,
  onDeleteChild
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [busyAction, setBusyAction] = useState<null | 'regenerate' | 'rename' | 'unlink' | 'delete'>(null);
  const [settingPin, setSettingPin] = useState(false);
  const [showCreateChild, setShowCreateChild] = useState(children.length === 0);
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState(9);
  const [childPin, setChildPin] = useState('');
  const [confirmChildPin, setConfirmChildPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [createError, setCreateError] = useState('');
  const [creatingChild, setCreatingChild] = useState(false);
  const [createdDetails, setCreatedDetails] = useState<{ name: string; pin: string } | null>(null);

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

  const generatePin = () => {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    const generated = String(values[0] % 1_000_000).padStart(6, '0');
    setChildPin(generated);
    setConfirmChildPin(generated);
    setShowPin(true);
    setCreateError('');
  };

  const handleCreateChild = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!onCreateChild) return;
    const name = childName.trim();
    if (!name || name.length > 40) {
      setCreateError('Enter a child name (maximum 40 characters).');
      return;
    }
    if (!Number.isInteger(childAge) || childAge < 5 || childAge > 18) {
      setCreateError('Choose an age between 5 and 18.');
      return;
    }
    if (!/^[0-9]{4,6}$/.test(childPin)) {
      setCreateError('PIN must be 4 to 6 digits.');
      return;
    }
    if (childPin !== confirmChildPin) {
      setCreateError('PINs do not match.');
      return;
    }

    setCreatingChild(true);
    setCreateError('');
    try {
      const pinToShare = childPin;
      const child = await onCreateChild({ name, age: childAge, pin: pinToShare });
      setCreatedDetails({ name: child.name, pin: pinToShare });
      setChildName('');
      setChildAge(9);
      setChildPin('');
      setConfirmChildPin('');
      setShowCreateChild(false);
    } catch (error: any) {
      setCreateError(error?.message || 'Failed to create child profile.');
    } finally {
      setCreatingChild(false);
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
            Create their profile and PIN below. Then they can sign in using their details and your parent code.
          </p>
        </div>
      )}

      {onCreateChild && (
        <div className="mt-4">
          {!showCreateChild ? (
            <button
              type="button"
              onClick={() => {
                setShowCreateChild(true);
                setCreatedDetails(null);
              }}
              className="px-4 py-2 rounded-lg font-bold bg-emerald-600 text-white hover:bg-emerald-700"
            >
              + Add child and PIN
            </button>
          ) : (
            <form onSubmit={handleCreateChild} className="p-5 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h4 className="font-bold text-emerald-950">Create a child profile</h4>
                  <p className="text-sm text-emerald-800">Choose their name, age and private login PIN.</p>
                </div>
                {children.length > 0 && (
                  <button type="button" onClick={() => setShowCreateChild(false)} className="text-sm font-bold text-gray-600 hover:text-gray-900">
                    Cancel
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm font-bold text-gray-700">
                  Child's name
                  <input
                    value={childName}
                    onChange={(event) => setChildName(event.target.value)}
                    maxLength={40}
                    autoComplete="off"
                    className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-lg font-normal"
                    required
                  />
                </label>
                <label className="text-sm font-bold text-gray-700">
                  Age
                  <input
                    type="number"
                    min={5}
                    max={18}
                    value={childAge}
                    onChange={(event) => setChildAge(Number(event.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-lg font-normal"
                    required
                  />
                </label>
                <label className="text-sm font-bold text-gray-700">
                  PIN (4–6 digits)
                  <input
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]{4,6}"
                    value={childPin}
                    onChange={(event) => setChildPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    autoComplete="new-password"
                    className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-lg font-normal tracking-widest"
                    required
                  />
                </label>
                <label className="text-sm font-bold text-gray-700">
                  Confirm PIN
                  <input
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]{4,6}"
                    value={confirmChildPin}
                    onChange={(event) => setConfirmChildPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    autoComplete="new-password"
                    className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-lg font-normal tracking-widest"
                    required
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <button type="button" onClick={generatePin} className="px-4 py-2 rounded-lg font-bold bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100">
                  Generate secure PIN
                </button>
                <button type="button" onClick={() => setShowPin((value) => !value)} className="px-4 py-2 rounded-lg font-bold text-gray-700 hover:bg-white">
                  {showPin ? 'Hide PIN' : 'Show PIN'}
                </button>
                <button type="submit" disabled={creatingChild} className="sm:ml-auto px-5 py-2 rounded-lg font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
                  {creatingChild ? 'Creating…' : 'Create child'}
                </button>
              </div>
              {createError && <p role="alert" className="mt-3 text-sm font-bold text-red-700">{createError}</p>}
            </form>
          )}
        </div>
      )}

      {createdDetails && (
        <div className="mt-4 p-4 bg-green-50 border border-green-300 rounded-xl" role="status">
          <p className="font-bold text-green-900">✓ {createdDetails.name}'s profile is ready</p>
          <p className="text-sm text-green-800 mt-1">
            Their PIN is <code className="font-mono font-bold text-base">{createdDetails.pin}</code>. Save it now—only its secure hash is stored, so it cannot be displayed again.
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
          Child sign-in needs this parent code plus the PIN you create for that child.
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
