// Utility to handle pending registrations for retry mechanism
import { supabase } from '../supabaseClient';

export const retryPendingRegistration = async () => {
  const pendingData = localStorage.getItem('pendingRegistration');

  if (!pendingData) {
    return null;
  }

  try {
    const registrationData = JSON.parse(pendingData);
    console.log('🔄 Retrying pending registration for:', registrationData.teamName);

    const { error } = await supabase.functions.invoke("register-team", {
      body: registrationData,
    });

    if (error) {
      console.error('❌ Registration retry failed:', error);
      return { success: false, error };
    } else {
      console.log('✅ Pending registration completed successfully');
      localStorage.removeItem('pendingRegistration');
      return { success: true };
    }
  } catch (err) {
    console.error('❌ Error during registration retry:', err);
    return { success: false, error: err };
  }
};

export const hasPendingRegistration = () => {
  return !!localStorage.getItem('pendingRegistration');
};

export const getPendingRegistrationData = () => {
  const pendingData = localStorage.getItem('pendingRegistration');
  return pendingData ? JSON.parse(pendingData) : null;
};

export const clearPendingRegistration = () => {
  localStorage.removeItem('pendingRegistration');
};

// Auto-retry mechanism that runs on app initialization
export const initializeRetryMechanism = () => {
  // Only retry if there's a pending registration and some time has passed
  const retryTimestamp = localStorage.getItem('pendingRegistrationRetry');
  const now = Date.now();

  // Wait at least 30 seconds between retries
  if (retryTimestamp && (now - parseInt(retryTimestamp)) < 30000) {
    console.log('⏳ Too soon to retry, waiting...');
    return;
  }

  if (hasPendingRegistration()) {
    console.log('🔄 Found pending registration, attempting retry...');
    localStorage.setItem('pendingRegistrationRetry', now.toString());

    // Retry with a slight delay to allow app to fully initialize
    setTimeout(() => {
      retryPendingRegistration().then((result) => {
        if (result?.success) {
          console.log('🎉 Pending registration completed successfully!');
          // Could trigger a notification or success message here
        }
      });
    }, 2000);
  }
};