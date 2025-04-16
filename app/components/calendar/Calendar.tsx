import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar as RNCalendar, DateData } from 'react-native-calendars';
import { format } from 'date-fns';

interface CalendarProps {
  onDayPress: (date: Date) => void;
  markedDates?: Record<string, any>;
  initialDate?: Date;
}

const Calendar: React.FC<CalendarProps> = ({ 
  onDayPress, 
  markedDates = {}, 
  initialDate = new Date() 
}) => {
  const [selectedDate, setSelectedDate] = useState(format(initialDate, 'yyyy-MM-dd'));

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    onDayPress(new Date(day.timestamp));
  };

  return (
    <View style={styles.container}>
      <RNCalendar
        current={selectedDate}
        onDayPress={handleDayPress}
        markedDates={{
          ...markedDates,
          [selectedDate]: { 
            selected: true, 
            selectedColor: '#4CAF50',
            ...markedDates[selectedDate]
          }
        }}
        theme={{
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#4CAF50',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#4CAF50',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#4CAF50',
          selectedDotColor: '#ffffff',
          arrowColor: '#4CAF50',
          monthTextColor: '#2d4150',
          indicatorColor: '#4CAF50',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 16
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 10,
    marginBottom: 20,
  },
});

export default Calendar;
