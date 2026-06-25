import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';

import BottomTabs from './components/BottomTabs';
import AIPlanResultScreen from './screens/AIPlanResultScreen';
import AIPlanScreen from './screens/AIPlanScreen';
import HomeScreen from './screens/HomeScreen';
import ItineraryDetailScreen from './screens/ItineraryDetailScreen';
import ItineraryScreen from './screens/ItineraryScreen';
import MyPageScreen from './screens/MyPageScreen';
import RegionDetailScreen from './screens/RegionDetailScreen';
import { destinations } from './data/mockData';
import { generateItinerary } from './utils/generateItinerary';

const SAVED_PLANS_KEY = 'travel-plan:saved-plans';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [route, setRoute] = useState({ name: 'Home' });
  const [savedPlans, setSavedPlans] = useState([]);
  const [draftPlan, setDraftPlan] = useState(null);

  useEffect(() => {
    const loadSavedPlans = async () => {
      try {
        const storedPlans = await AsyncStorage.getItem(SAVED_PLANS_KEY);
        if (storedPlans) {
          setSavedPlans(JSON.parse(storedPlans));
        }
      } catch (error) {
        console.warn('Failed to load saved travel plans.', error);
      }
    };

    loadSavedPlans();
  }, []);

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

  const persistSavedPlans = async (nextPlans) => {
    setSavedPlans(nextPlans);

    try {
      await AsyncStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(nextPlans));
    } catch (error) {
      console.warn('Failed to sync saved travel plans.', error);
    }
  };

  const generatePlan = (form) => {
    const nextDraftPlan = generateItinerary(selectedDestination, form);
    setDraftPlan(nextDraftPlan);
    setRoute({ name: 'AIPlanResult', params: { destinationId: selectedDestination.id } });
  };

  const saveDraftPlan = async (planOverride) => {
    const sourcePlan = planOverride || draftPlan;
    if (!sourcePlan) return;

    const planToSave = {
      ...sourcePlan,
      savedAt: new Date().toISOString(),
    };
    const nextPlans = [planToSave, ...savedPlans];

    setDraftPlan(null);
    await persistSavedPlans(nextPlans);

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

    await persistSavedPlans(nextPlans);
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

    await persistSavedPlans(nextPlans);
  };

  const deleteSavedPlan = async (planId) => {
    const nextPlans = savedPlans.filter((plan) => plan.id !== planId);
    await persistSavedPlans(nextPlans);
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
      return <ItineraryScreen plans={savedPlans} onSelectPlan={openSavedPlan} />;
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
      return <MyPageScreen />;
    }

    return <HomeScreen onSelectDestination={goToDestination} />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4fbf8" />
      <View style={styles.app}>
        <View style={styles.content}>{renderScreen()}</View>
        <BottomTabs activeTab={activeTab} onChangeTab={openTab} />
      </View>
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
});
