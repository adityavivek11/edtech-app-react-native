import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#4CAF50',
      tabBarInactiveTintColor: '#666666',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
      },
      headerShown: false,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color }) => <FontAwesome name="book" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="doubts"
        options={{
          title: 'Doubts',
          tabBarIcon: ({ color }) => <FontAwesome name="question-circle" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
