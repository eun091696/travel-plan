import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

import BottomTabs from './components/BottomTabs';
import AIPlanResultScreen from './screens/AIPlanResultScreen';
import AIPlanScreen from './screens/AIPlanScreen';
import HomeScreen from './screens/HomeScreen';
import ItineraryDetailScreen from './screens/ItineraryDetailScreen';
import ItineraryScreen from './screens/ItineraryScreen';
import LoginScreen from './screens/LoginScreen';
import MyPageScreen from './screens/MyPageScreen';
import RegionDetailScreen from './screens/RegionDetailScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ServerConnectionProvider, useServerConnection } from './contexts/ServerConnectionContext';
import { destinations } from './data/mockData';
import { itineraryService } from './services/itineraryService';
import { tripService } from './services/tripService';

export default function App() {
  return (
    <AuthProvider>
      <ServerConnectionProvider>
        <AppShell />
      </ServerConnectionProvider>
    </AuthProvider>
  );
}

function AuthLoadingScreen() {
  return (
    <View testID="auth-loading-screen" style={styles.authLoadingScreen}>
      <View style={styles.loadingMark} />
      <Text style={styles.loadingTitle}>로그인 상태를 확인하는 중입니다</Text>
      <Text style={styles.loadingText}>저장된 게스트 계정을 불러오고 있어요.</Text>
    </View>
  );
}

function AppShell() {
  const { user: authUser, isAuthenticated, isCheckingAuth, isLoggingIn, loginAsGuest, logout } = useAuth();
  const serverConnection = useServerConnection();
  const [activeTab, setActiveTab] = useState('home');
  const [route, setRoute] = useState({ name: 'Home' });
  const [savedPlans, setSavedPlans] = useState([]);
  const [draftPlan, setDraftPlan] = useState(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [isLoadingSavedPlans, setIsLoadingSavedPlans] = useState(true);
  const [savedPlansError, setSavedPlansError] = useState('');

  useEffect(() => {
    if (isAuthenticated) return;

    setSavedPlans([]);
    setDraftPlan(null);
    setGenerationError('');
    setSavedPlansError('');
    setIsLoadingSavedPlans(false);
    setActiveTab('home');
    setRoute({ name: 'Home' });
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authUser) return;

    let mounted = true;

    const loadSavedPlans = async () => {
      setIsLoadingSavedPlans(true);
      setSavedPlansError('');
      try {
        const trips = await tripService.getTrips();
        if (mounted) setSavedPlans(trips);
      } catch (error) {
        if (error?.name === 'AuthRequiredError') {
          await handleLogout();
          return;
        }
        console.warn('Failed to load saved travel plans.', error);
        if (mounted) setSavedPlansError('저장된 여행 일정을 불러오지 못했습니다. 로컬 데이터를 확인해주세요.');
      } finally {
        if (mounted) setIsLoadingSavedPlans(false);
      }
    };

    loadSavedPlans();

    return () => {
      mounted = false;
    };
  }, [authUser?.userId]);

  const selectedDestination = useMemo(() => {
    return destinations.find((item) => item.id === route.params?.destinationId) || destinations[0];
  }, [route.params?.destinationId]);

  const selectedSavedPlan = useMemo(() => {
    return savedPlans.find((plan) => plan.id === route.params?.planId) || null;
  }, [savedPlans, route.params?.planId]);

  const openTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') setRoute({ name: 'Home' });
    if (tab === 'itinerary') setRoute({ name: 'Itinerary' });
    if (tab === 'my') setRoute({ name: 'MyPage' });
  };

  const goToDestination = (destinationId) => {
    setActiveTab('home');
    setRoute({ name: 'RegionDetail', params: { destinationId } });
  };

  const goToAIPlan = (destination = selectedDestination) => {
    setRoute({ name: 'AIPlan', params: { destinationId: destination.id } });
  };

  const openSavedPlan = (planId) => {
    setActiveTab('itinerary');
    setRoute({ name: 'ItineraryDetail', params: { planId } });
  };

  const setLocalSavedPlans = (nextPlans) => {
    setSavedPlans(nextPlans);
  };

  const handleGuestLogin = async () => {
    await loginAsGuest();
    setActiveTab('home');
    setRoute({ name: 'Home' });
  };

  const handleLogout = async () => {
    await logout();
    setSavedPlans([]);
    setDraftPlan(null);
    setGenerationError('');
    setSavedPlansError('');
    setIsLoadingSavedPlans(false);
    setActiveTab('home');
    setRoute({ name: 'Home' });
  };

  const generatePlan = async (form) => {
    setIsGeneratingPlan(true);
    setGenerationError('');

    try {
      const nextDraftPlan = await itineraryService.generateItinerary({
        destination: selectedDestination,
        startDate: form.startDate,
        endDate: form.endDate,
        arrivalTime: form.arrivalTime,
        departureTime: form.departureTime,
        budget: form.budget,
        companions: form.companions,
        style: form.style,
      });
      setDraftPlan(nextDraftPlan);
      setGenerationError(nextDraftPlan.aiFallbackReason ? 'AI 일정 생성에 실패해 mock 일정으로 대체했습니다.' : '');
      setRoute({ name: 'AIPlanResult', params: { destinationId: selectedDestination.id } });
    } catch (error) {
      console.log('[App] itinerary generation failed', error);
      setGenerationError('일정을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const saveDraftPlan = async (planOverride) => {
    const sourcePlan = planOverride || draftPlan;
    if (!sourcePlan) return;

    const planToSave = {
      ...sourcePlan,
      savedAt: new Date().toISOString(),
    };

    setDraftPlan(null);
    const savedPlan = await tripService.createTrip(planToSave);
    const nextPlans = [savedPlan, ...savedPlans];
    setLocalSavedPlans(nextPlans);

    setActiveTab('itinerary');
    setRoute({ name: 'Itinerary' });
  };

  const updateSavedPlan = async (updatedPlan) => {
    const nextPlans = savedPlans.map((plan) =>
      plan.id === updatedPlan.id
        ? {
            ...updatedPlan,
            savedAt: updatedPlan.savedAt || plan.savedAt,
            updatedAt: new Date().toISOString(),
          }
        : plan
    );

    const savedPlan = await tripService.updateTrip(updatedPlan.id, nextPlans.find((plan) => plan.id === updatedPlan.id));
    setLocalSavedPlans(nextPlans.map((plan) => (plan.id === savedPlan.id ? savedPlan : plan)));
    setActiveTab('itinerary');
    setRoute({ name: 'Itinerary' });
  };

  const syncSavedPlan = async (updatedPlan) => {
    const nextPlans = savedPlans.map((plan) =>
      plan.id === updatedPlan.id
        ? {
            ...updatedPlan,
            savedAt: updatedPlan.savedAt || plan.savedAt,
            updatedAt: new Date().toISOString(),
          }
        : plan
    );

    const savedPlan = await tripService.updateTrip(updatedPlan.id, nextPlans.find((plan) => plan.id === updatedPlan.id));
    setLocalSavedPlans(nextPlans.map((plan) => (plan.id === savedPlan.id ? savedPlan : plan)));
  };

  const deleteSavedPlan = async (planId) => {
    const nextPlans = savedPlans.filter((plan) => plan.id !== planId);
    await tripService.deleteTrip(planId);
    setLocalSavedPlans(nextPlans);
    setActiveTab('itinerary');
    setRoute({ name: 'Itinerary' });
  };

  const renderScreen = () => {
    if (route.name === 'RegionDetail') {
      return (
        <RegionDetailScreen
          destination={selectedDestination}
          onBack={() => setRoute({ name: 'Home' })}
          onCreateAIPlan={goToAIPlan}
        />
      );
    }

    if (route.name === 'AIPlan') {
      return (
        <AIPlanScreen
          destination={selectedDestination}
          onBack={() => setRoute({ name: 'RegionDetail', params: { destinationId: selectedDestination.id } })}
          onSubmit={generatePlan}
          isLoading={isGeneratingPlan}
          error={generationError}
        />
      );
    }

    if (route.name === 'AIPlanResult') {
      return (
        <AIPlanResultScreen
          plan={draftPlan}
          onBack={() => setRoute({ name: 'AIPlan', params: { destinationId: selectedDestination.id } })}
          onSave={saveDraftPlan}
        />
      );
    }

    if (route.name === 'Itinerary') {
      return (
        <ItineraryScreen
          plans={savedPlans}
          onSelectPlan={openSavedPlan}
          isLoading={isLoadingSavedPlans}
          error={savedPlansError}
        />
      );
    }

    if (route.name === 'ItineraryDetail') {
      return (
        <ItineraryDetailScreen
          plan={selectedSavedPlan}
          onBack={() => setRoute({ name: 'Itinerary' })}
          onSave={updateSavedPlan}
          onSyncPlan={syncSavedPlan}
          onDeletePlan={deleteSavedPlan}
        />
      );
    }

    if (route.name === 'MyPage') {
      return <MyPageScreen user={authUser} onLogout={handleLogout} serverConnection={serverConnection} />;
    }

    return <HomeScreen onSelectDestination={goToDestination} />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4fbf8" />
      {isCheckingAuth ? (
        <AuthLoadingScreen />
      ) : !isAuthenticated ? (
        <LoginScreen onGuestLogin={handleGuestLogin} isLoading={isLoggingIn} />
      ) : (
        <View style={styles.app}>
          <View style={styles.content}>{renderScreen()}</View>
          <BottomTabs activeTab={activeTab} onChangeTab={openTab} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4fbf8',
  },
  app: {
    flex: 1,
    backgroundColor: '#f4fbf8',
  },
  content: {
    flex: 1,
  },
  authLoadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f4fbf8',
  },
  loadingMark: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 16,
    backgroundColor: '#176b55',
  },
  loadingTitle: {
    color: '#14231f',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#61736c',
    fontSize: 14,
    textAlign: 'center',
  },
});
