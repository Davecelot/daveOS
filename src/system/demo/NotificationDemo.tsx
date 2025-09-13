import React from 'react';
import { showNotification } from '../ui/NotificationCenter';
import { Bell, TestTube } from 'lucide-react';

export const NotificationDemo: React.FC = () => {
  const createDemoNotifications = () => {
    // Welcome notification
    showNotification.info(
      'Welcome to daveOS!',
      'Your WebOS is ready to use. Explore the apps in the dock below.',
      {
        persistent: true,
        appId: 'system',
        actions: [
          {
            label: 'Get Started',
            action: () => console.log('Getting started...'),
            primary: true
          },
          {
            label: 'Learn More',
            action: () => console.log('Learning more...')
          }
        ]
      }
    );

    // System update notification
    setTimeout(() => {
      showNotification.success(
        'System Updated',
        'daveOS has been updated to version 1.0.1 with new features and improvements.',
        {
          appId: 'system',
          actions: [
            {
              label: 'View Changes',
              action: () => console.log('Viewing changelog...'),
              primary: true
            }
          ]
        }
      );
    }, 2000);

    // Calendar reminder
    setTimeout(() => {
      showNotification.warning(
        'Meeting Reminder',
        'Team standup meeting starts in 15 minutes in Conference Room A.',
        {
          appId: 'calendar',
          actions: [
            {
              label: 'Join Now',
              action: () => console.log('Joining meeting...'),
              primary: true
            },
            {
              label: 'Snooze 5min',
              action: () => console.log('Snoozed for 5 minutes')
            }
          ]
        }
      );
    }, 4000);

    // File operation notification
    setTimeout(() => {
      showNotification.success(
        'File Saved',
        'Document "Project Proposal.txt" has been saved successfully.',
        {
          appId: 'textedit'
        }
      );
    }, 6000);

    // System error notification
    setTimeout(() => {
      showNotification.error(
        'Network Error',
        'Unable to connect to the internet. Please check your network settings.',
        {
          persistent: true,
          appId: 'system',
          actions: [
            {
              label: 'Retry',
              action: () => console.log('Retrying connection...'),
              primary: true
            },
            {
              label: 'Settings',
              action: () => console.log('Opening network settings...')
            }
          ]
        }
      );
    }, 8000);

    // Calculator result notification
    setTimeout(() => {
      showNotification.info(
        'Calculation Complete',
        'Result: 1,234.56 has been copied to clipboard.',
        {
          appId: 'calculator'
        }
      );
    }, 10000);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={createDemoNotifications}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
        title="Generate demo notifications"
      >
        <TestTube className="w-4 h-4" />
        <span>Demo Notifications</span>
      </button>
    </div>
  );
};

// Initialize demo notifications on app start
export const initializeDemoNotifications = () => {
  // Wait a bit for the app to load
  setTimeout(() => {
    showNotification.info(
      'daveOS Ready',
      'Welcome to your WebOS! All systems are operational.',
      {
        appId: 'system',
        icon: <Bell className="w-5 h-5 text-blue-500" />
      }
    );
  }, 3000);
};
