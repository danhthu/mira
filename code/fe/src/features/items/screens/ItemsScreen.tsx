import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import DataState from '@/shared/components/DataState';
import { vi } from '@/i18n/vi';
import {
  findOwnedItems,
  createItem,
  markItemUsed,
  releaseItem,
} from '@/db/repositories/itemRepository';
import { colors, fontSize, radius } from '@/shared/theme/tokens';
import { weekStart } from '@/shared/utils/date';
import type { Item } from '@/db/schema';
import ItemRow from '../components/ItemRow';
import { pickWeeklyRelease } from '../itemCost';

function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function ItemsScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [addVisible, setAddVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    let cancelled = false;
    findOwnedItems()
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const suggested = useMemo(
    () => pickWeeklyRelease(items, weekStart(new Date())),
    [items],
  );

  async function handleSave(): Promise<void> {
    const name = newName.trim();
    if (!name) return;
    const digits = digitsOnly(newPrice);
    const created = await createItem({
      name,
      price: digits ? Number(digits) : undefined,
    });
    setItems((prev) => [created, ...prev]);
    setNewName('');
    setNewPrice('');
    setAddVisible(false);
  }

  async function handleMarkUsed(id: string): Promise<void> {
    await markItemUsed(id);
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, useCount: i.useCount + 1 } : i)),
    );
  }

  async function handleRelease(id: string): Promise<void> {
    await releaseItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <ItemRow
            item={item}
            onMarkUsed={(id) => void handleMarkUsed(id)}
            onRelease={(id) => void handleRelease(id)}
          />
        )}
        ListHeaderComponent={
          items.length === 0 ? null : (
            <View style={styles.header}>
              <Text style={styles.total}>{vi.items.totalItems(items.length)}</Text>
              {suggested !== null && (
                <Card style={styles.suggestCard}>
                  <Text style={styles.suggestTitle}>{vi.items.suggestRelease}</Text>
                  <Text style={styles.suggestName}>{suggested.name}</Text>
                  <Button
                    label={vi.items.release}
                    onPress={() => void handleRelease(suggested.id)}
                    variant="secondary"
                    style={styles.suggestButton}
                  />
                </Card>
              )}
            </View>
          )
        }
        ListEmptyComponent={
          <DataState
            message={vi.items.emptyState}
            action={{
              label: vi.items.addItem,
              onPress: () => setAddVisible(true),
            }}
          />
        }
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setAddVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={addVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{vi.items.addItem}</Text>
            <TextInput
              style={styles.input}
              placeholder={vi.items.itemName}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <TextInput
              style={[styles.input, styles.inputSpaced]}
              placeholder={vi.items.itemPrice}
              value={newPrice}
              onChangeText={(raw) => setNewPrice(digitsOnly(raw))}
              keyboardType="number-pad"
            />
            <View style={styles.modalActions}>
              <Button
                label={vi.moments.cancel}
                onPress={() => setAddVisible(false)}
                variant="ghost"
                style={styles.modalActionButton}
              />
              <Button
                label={vi.moments.save}
                onPress={() => void handleSave()}
                disabled={!newName.trim()}
                style={styles.modalActionButton}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { flexGrow: 1, paddingBottom: 80 },
  header: { padding: 16 },
  total: {
    fontSize: fontSize.heading,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  suggestCard: { marginTop: 16 },
  suggestTitle: {
    fontSize: fontSize.bodyLarge,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  suggestName: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    marginTop: 6,
  },
  suggestButton: { marginTop: 14 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  fabIcon: { color: colors.textOnAccent, fontSize: 28, lineHeight: 32 },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: 14,
    fontSize: fontSize.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputSpaced: { marginTop: 12 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  modalActionButton: { flex: 1 },
});

export default ItemsScreen;

