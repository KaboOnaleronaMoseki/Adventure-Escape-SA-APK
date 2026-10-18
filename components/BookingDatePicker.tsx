import { DateTime } from 'luxon';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/constants/theme';
import { BOOKING_TIME_ZONE, formatSouthAfricanDate, todayInSouthAfrica } from '@/services/bookingValidation';

type BookingDatePickerProps = {
  label: string;
  value: string;
  minimumDate?: string;
  error?: string;
  onChange: (value: string) => void;
};

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export function BookingDatePicker({
  label,
  value,
  minimumDate = todayInSouthAfrica(),
  error,
  onChange,
}: BookingDatePickerProps) {
  const [month, setMonth] = useState(() =>
    DateTime.fromISO(value || minimumDate, { zone: BOOKING_TIME_ZONE }).startOf('month'),
  );
  const firstWeekday = month.startOf('month').weekday - 1;
  const daysInMonth = month.daysInMonth ?? 0;
  const selectedDate = value
    ? DateTime.fromISO(value, { zone: BOOKING_TIME_ZONE }).toISODate()
    : null;
  const previousMonth = month.minus({ months: 1 });
  const previousDisabled = previousMonth.endOf('month').toISODate()! < minimumDate;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.selectedDate}>
        {value ? formatSouthAfricanDate(value) : 'Select a date (DD/MM/YYYY)'}
      </Text>
      <View style={styles.calendar}>
        <View style={styles.monthNavigation}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            accessibilityState={{ disabled: previousDisabled }}
            disabled={previousDisabled}
            onPress={() => setMonth(previousMonth)}
            style={styles.monthButton}
          >
            <Text style={[styles.monthButtonText, previousDisabled && styles.disabledText]}>‹</Text>
          </Pressable>
          <Text style={styles.monthTitle}>{month.setLocale('en-ZA').toFormat('MMMM yyyy')}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next month"
            onPress={() => setMonth(month.plus({ months: 1 }))}
            style={styles.monthButton}
          >
            <Text style={styles.monthButtonText}>›</Text>
          </Pressable>
        </View>
        <View style={styles.grid}>
          {WEEKDAYS.map((day) => (
            <Text key={day} style={styles.weekday}>
              {day}
            </Text>
          ))}
          {Array.from({ length: firstWeekday }, (_, index) => (
            <View key={`blank-${index}`} style={styles.dayCell} />
          ))}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const date = month.set({ day: index + 1 }).toISODate()!;
            const disabled = date < minimumDate;
            const selected = date === selectedDate;
            return (
              <Pressable
                key={date}
                accessibilityRole="button"
                accessibilityLabel={DateTime.fromISO(date, { zone: BOOKING_TIME_ZONE })
                  .setLocale('en-ZA')
                  .toFormat('cccc d MMMM yyyy')}
                accessibilityState={{ disabled, selected }}
                disabled={disabled}
                onPress={() => onChange(date)}
                style={[
                  styles.dayCell,
                  selected && styles.selectedDay,
                  disabled && styles.disabledDay,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    selected && styles.selectedDayText,
                    disabled && styles.disabledText,
                  ]}
                >
                  {index + 1}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { marginBottom: 5, color: colors.text, fontSize: 14, fontWeight: '700' },
  selectedDate: { marginBottom: spacing.sm, color: colors.muted, fontSize: 13 },
  calendar: {
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.backgroundDark,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  monthButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonText: { color: colors.accent, fontSize: 28, fontWeight: '700' },
  monthTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: {
    width: '14.2857%',
    paddingVertical: 8,
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
  },
  dayCell: {
    width: '14.2857%',
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  dayText: { color: colors.text, fontSize: 13 },
  selectedDay: { backgroundColor: colors.accent },
  selectedDayText: { color: colors.backgroundDark, fontWeight: '800' },
  disabledDay: { opacity: 0.35 },
  disabledText: { color: colors.muted },
  error: { marginTop: spacing.xs, color: colors.accent, fontSize: 13, lineHeight: 19 },
});
