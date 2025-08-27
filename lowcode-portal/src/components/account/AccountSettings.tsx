import React, { useState, useEffect } from 'react';
import { useAlert } from '@/contexts/AlertContext';

interface UserSettings {
  fullName: string;
  email: string;
  company: string;
}

interface UserSettingsResponse {
  success: boolean;
  data?: UserSettings;
  error?: string;
  message?: string;
}

const AccountSettings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    fullName: '',
    email: '',
    company: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showAlert } = useAlert();

  // Mock user ID - replace with actual user ID from authentication context
  const userId = 'user-1';

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/user-settings?userId=${userId}`);
      const data: UserSettingsResponse = await response.json();

      if (data.success && data.data) {
        setSettings(data.data);
      } else {
        // If no settings found, use default values
        setSettings({
          fullName: 'John Doe',
          email: 'john@example.com',
          company: 'Acme Corp',
        });
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
      showAlert('Failed to load user settings', 'error');
      // Use default values on error
      setSettings({
        fullName: 'John Doe',
        email: 'john@example.com',
        company: 'Acme Corp',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (!settings.fullName.trim()) {
      showAlert('Full Name is required', 'error');
      return;
    }

    if (!settings.email.trim()) {
      showAlert('Email is required', 'error');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settings.email)) {
      showAlert('Please enter a valid email address', 'error');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/user-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...settings,
        }),
      });

      const data: UserSettingsResponse = await response.json();

      if (data.success) {
        showAlert(data.message || 'Settings saved successfully!', 'success');
      } else {
        showAlert(data.error || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error('Error saving user settings:', error);
      showAlert('Failed to save settings. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Account Settings</h2>
          </div>
          <div className="p-4 sm:p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-slate-600 dark:text-slate-400">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Account Settings</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage your personal account information
          </p>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={settings.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              placeholder="Enter your email address"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Company
            </label>
            <input
              type="text"
              value={settings.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              placeholder="Enter your company name"
            />
          </div>
          
          <div className="pt-4">
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;