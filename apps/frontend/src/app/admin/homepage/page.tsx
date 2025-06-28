'use client';

import { useState, useEffect } from 'react';
import { useSiteContext } from '@/contexts/SiteContext';

interface CommandRole {
  name: string;
  role: string;
}

export default function HomepageManagement() {
  const { settings, featureCards, admiraltyLetter, welcomeContent, refreshAll } = useSiteContext();
  
  // Local state for editing
  const [editingWelcome, setEditingWelcome] = useState({
    title: '',
    content: ''
  });
  
  const [editingFeatures, setEditingFeatures] = useState<Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    order: number;
  }>>([]);
  
  const [editingLetter, setEditingLetter] = useState({
    title: '',
    content: '',
    author: '',
    role: ''
  });
  
  const [editingCommand, setEditingCommand] = useState<CommandRole[]>([]);
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Initialize editing states with current data
  useEffect(() => {
    if (welcomeContent) {
      setEditingWelcome({
        title: welcomeContent.title,
        content: welcomeContent.content
      });
    }
  }, [welcomeContent]);

  useEffect(() => {
    if (featureCards) {
      setEditingFeatures([...featureCards]);
    }
  }, [featureCards]);

  useEffect(() => {
    if (admiraltyLetter) {
      setEditingLetter({
        title: admiraltyLetter.title,
        content: admiraltyLetter.content,
        author: admiraltyLetter.author,
        role: admiraltyLetter.role || ''
      });
    }
  }, [admiraltyLetter]);

  useEffect(() => {
    if (settings?.commandStructure) {
      setEditingCommand([...settings.commandStructure]);
    }
  }, [settings]);

  const saveAllChanges = async () => {
    setSaving(true);
    setMessage('');

    try {
      // Save welcome content
      const welcomeResponse = await fetch('/api/admin/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingWelcome)
      });

      if (!welcomeResponse.ok) {
        throw new Error('Failed to save welcome content');
      }

      // Save features
      const featuresResponse = await fetch('/api/admin/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: editingFeatures })
      });

      if (!featuresResponse.ok) {
        throw new Error('Failed to save features');
      }

      // Save admiralty letter
      const letterResponse = await fetch('/api/admin/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLetter)
      });

      if (!letterResponse.ok) {
        throw new Error('Failed to save admiralty letter');
      }

      // Save command structure (via settings)
      const currentSettings = await fetch('/api/admin/settings').then(res => res.json());
      const settingsResponse = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentSettings,
          commandStructure: editingCommand
        })
      });

      if (!settingsResponse.ok) {
        throw new Error('Failed to save command structure');
      }

      // Refresh context to update the site
      await refreshAll();
      
      setMessage('All homepage content saved successfully!');
    } catch (error) {
      console.error('Error saving homepage content:', error);
      setMessage('Error saving homepage content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    const newFeature = {
      id: Date.now().toString(),
      title: 'New Feature',
      description: 'Feature description',
      icon: '⚓',
      order: editingFeatures.length
    };
    setEditingFeatures([...editingFeatures, newFeature]);
  };

  const removeFeature = (id: string) => {
    setEditingFeatures(editingFeatures.filter(f => f.id !== id));
  };

  const updateFeature = (id: string, field: string, value: string | number) => {
    setEditingFeatures(editingFeatures.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    ));
  };

  const addCommandRole = () => {
    setEditingCommand([...editingCommand, { name: 'New Officer', role: 'Position' }]);
  };

  const removeCommandRole = (index: number) => {
    setEditingCommand(editingCommand.filter((_, i) => i !== index));
  };

  const updateCommandRole = (index: number, field: string, value: string) => {
    setEditingCommand(editingCommand.map((role, i) => 
      i === index ? { ...role, [field]: value } : role
    ));
  };

  return (
    <div className="min-h-screen bg-sandstone-light">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-sail-white border-4 border-navy-dark p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
              Homepage Management
            </h1>
            <button
              onClick={saveAllChanges}
              disabled={saving}
              className="bg-brass hover:bg-brass-dark text-navy-dark font-bold py-2 px-6 border-2 border-navy-dark disabled:opacity-50"
              style={{fontFamily: 'Cinzel, serif'}}
            >
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>

          {message && (
            <div className={`p-4 mb-6 border-2 ${message.includes('Error') ? 'border-red-500 bg-red-100 text-red-700' : 'border-green-500 bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          {/* Welcome Content Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Welcome Section
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-dark mb-2">Title</label>
                <input
                  type="text"
                  value={editingWelcome.title}
                  onChange={(e) => setEditingWelcome({ ...editingWelcome, title: e.target.value })}
                  className="w-full p-3 border-2 border-navy-dark focus:outline-none focus:border-brass"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-dark mb-2">Content</label>
                <textarea
                  value={editingWelcome.content}
                  onChange={(e) => setEditingWelcome({ ...editingWelcome, content: e.target.value })}
                  rows={6}
                  className="w-full p-3 border-2 border-navy-dark focus:outline-none focus:border-brass"
                  placeholder="Use {{siteName}} for dynamic site name replacement"
                />
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                Feature Cards
              </h2>
              <button
                onClick={addFeature}
                className="bg-brass hover:bg-brass-dark text-navy-dark font-bold py-2 px-4 border-2 border-navy-dark"
              >
                Add Feature
              </button>
            </div>
            <div className="space-y-6">
              {editingFeatures.map((feature, index) => (
                <div key={feature.id} className="border-2 border-navy-dark p-4 bg-sandstone-light">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-navy-dark">Feature {index + 1}</h3>
                    <button
                      onClick={() => removeFeature(feature.id)}
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy-dark mb-2">Title</label>
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => updateFeature(feature.id, 'title', e.target.value)}
                        className="w-full p-2 border-2 border-navy-dark focus:outline-none focus:border-brass"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-dark mb-2">Icon (Emoji)</label>
                      <input
                        type="text"
                        value={feature.icon}
                        onChange={(e) => updateFeature(feature.id, 'icon', e.target.value)}
                        className="w-full p-2 border-2 border-navy-dark focus:outline-none focus:border-brass"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-navy-dark mb-2">Description</label>
                      <textarea
                        value={feature.description}
                        onChange={(e) => updateFeature(feature.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full p-2 border-2 border-navy-dark focus:outline-none focus:border-brass"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-dark mb-2">Order</label>
                      <input
                        type="number"
                        value={feature.order}
                        onChange={(e) => updateFeature(feature.id, 'order', parseInt(e.target.value))}
                        className="w-full p-2 border-2 border-navy-dark focus:outline-none focus:border-brass"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admiralty Letter Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Admiralty Letter
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-dark mb-2">Title</label>
                <input
                  type="text"
                  value={editingLetter.title}
                  onChange={(e) => setEditingLetter({ ...editingLetter, title: e.target.value })}
                  className="w-full p-3 border-2 border-navy-dark focus:outline-none focus:border-brass"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-dark mb-2">Content</label>
                <textarea
                  value={editingLetter.content}
                  onChange={(e) => setEditingLetter({ ...editingLetter, content: e.target.value })}
                  rows={8}
                  className="w-full p-3 border-2 border-navy-dark focus:outline-none focus:border-brass"
                  placeholder="Use {{siteName}} for dynamic site name replacement. Separate paragraphs with double line breaks."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-dark mb-2">Author</label>
                  <input
                    type="text"
                    value={editingLetter.author}
                    onChange={(e) => setEditingLetter({ ...editingLetter, author: e.target.value })}
                    className="w-full p-3 border-2 border-navy-dark focus:outline-none focus:border-brass"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-dark mb-2">Role (Optional)</label>
                  <input
                    type="text"
                    value={editingLetter.role}
                    onChange={(e) => setEditingLetter({ ...editingLetter, role: e.target.value })}
                    className="w-full p-3 border-2 border-navy-dark focus:outline-none focus:border-brass"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Command Structure Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                Naval Command Structure
              </h2>
              <button
                onClick={addCommandRole}
                className="bg-brass hover:bg-brass-dark text-navy-dark font-bold py-2 px-4 border-2 border-navy-dark"
              >
                Add Officer
              </button>
            </div>
            <div className="space-y-4">
              {editingCommand.map((role, index) => (
                <div key={index} className="border-2 border-navy-dark p-4 bg-sandstone-light">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-navy-dark">Officer {index + 1}</h3>
                    <button
                      onClick={() => removeCommandRole(index)}
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy-dark mb-2">Name</label>
                      <input
                        type="text"
                        value={role.name}
                        onChange={(e) => updateCommandRole(index, 'name', e.target.value)}
                        className="w-full p-2 border-2 border-navy-dark focus:outline-none focus:border-brass"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-dark mb-2">Role/Position</label>
                      <input
                        type="text"
                        value={role.role}
                        onChange={(e) => updateCommandRole(index, 'role', e.target.value)}
                        className="w-full p-2 border-2 border-navy-dark focus:outline-none focus:border-brass"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
