import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, TextInput, ScrollView, Platform } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { AppButton } from '@/components/ui/app-button';
import { BookApiCard, BookApiItem } from '../components/book-api-card';
import { theme } from '@/theme/theme';

type ApiConfig = {
  id: string;
  name: string;
  method: string;
  url: string;
};

const PRESET_APIS: ApiConfig[] = [
  {
    id: 'local_books',
    name: '[GET] Danh sách sách (Local)',
    method: 'GET',
    url: 'http://localhost:8088/api/books?size=50',
  },
  {
    id: 'google_books',
    name: '[GET] Tìm Google Books API',
    method: 'GET',
    url: 'https://www.googleapis.com/books/v1/volumes?q=clean+code&maxResults=10',
  },
  {
    id: 'custom',
    name: '[Custom] Gọi API bất kỳ',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/todos/1',
  }
];

export function BooksApiTestScreen() {
  const [selectedApi, setSelectedApi] = useState<ApiConfig>(PRESET_APIS[0]);
  const [url, setUrl] = useState(PRESET_APIS[0].url);
  const [method, setMethod] = useState(PRESET_APIS[0].method);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawJson, setRawJson] = useState<any>(null);
  const [bookData, setBookData] = useState<BookApiItem[] | null>(null);
  const [activeTab, setActiveTab] = useState<'ui' | 'json'>('json');

  const handleSelectPreset = (preset: ApiConfig) => {
    setSelectedApi(preset);
    setUrl(preset.url);
    setMethod(preset.method);
    setRawJson(null);
    setBookData(null);
    setError(null);
  };

  const parseBooksData = (json: any) => {
    if (!json) return null;

    // Parse Spring Boot Page<Book>
    if (json.content && Array.isArray(json.content)) {
      return json.content.map((item: any) => ({
        id: item.id,
        title: item.title,
        author: item.author,
        publisher: item.publisher,
        year: item.year,
        isbn: item.isbn,
        coverUrl: item.coverUrl,
        categories: item.categories?.map((c: any) => c.label) || [],
      }));
    }
    // Parse Google Books API
    if (json.items && Array.isArray(json.items)) {
      return json.items.map((item: any) => ({
        id: item.id,
        title: item.volumeInfo?.title || 'No Title',
        author: item.volumeInfo?.authors?.join(', ') || 'Unknown Author',
        publisher: item.volumeInfo?.publisher || 'Unknown Publisher',
        year: item.volumeInfo?.publishedDate ? parseInt(item.volumeInfo.publishedDate.substring(0,4)) : 0,
        isbn: item.volumeInfo?.industryIdentifiers?.[0]?.identifier || 'No ISBN',
        coverUrl: item.volumeInfo?.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
        categories: item.volumeInfo?.categories || [],
      }));
    }
    return null;
  };

  const handleSendRequest = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setRawJson(null);
    setBookData(null);

    try {
      const res = await fetch(url, { method });
      const text = await res.text();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${json.message || res.statusText}`);
      }

      setRawJson(json);
      const parsedBooks = parseBooksData(json);
      if (parsedBooks) {
        setBookData(parsedBooks);
        setActiveTab('ui');
      } else {
        setActiveTab('json');
      }
    } catch (e: any) {
      setError(e.message || 'Lỗi khi gọi API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <AppText variant="headline" style={styles.sidebarTitle}>
          API Tester
        </AppText>
        <ScrollView>
          <View style={{ gap: 8 }}>
            {PRESET_APIS.map((preset) => {
              const isSelected = selectedApi.id === preset.id;
              return (
                <AppButton
                  key={preset.id}
                  label={preset.name}
                  variant={isSelected ? 'primary' : 'secondary'}
                  onPress={() => handleSelectPreset(preset)}
                />
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Main Content */}
      <View style={styles.main}>
        <AppText variant="title" style={styles.header}>
          Request Configuration
        </AppText>
        
        <View style={styles.requestBox}>
          <View style={styles.urlRow}>
            <TextInput
              style={[styles.input, { width: 80, marginRight: 8, textAlign: 'center' }]}
              value={method}
              onChangeText={setMethod}
              placeholder="Method"
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={url}
              onChangeText={setUrl}
              placeholder="https://api.example.com/..."
            />
          </View>
          <View style={{ alignSelf: 'flex-start' }}>
            <AppButton 
              label="Gửi Request" 
              onPress={handleSendRequest} 
              disabled={loading}
              variant="primary"
            />
          </View>
        </View>

        {/* Results Tab */}
        <View style={styles.resultContainer}>
          <View style={styles.tabRow}>
            <AppButton 
              label="Response JSON" 
              variant={activeTab === 'json' ? 'secondary' : 'ghost'} 
              onPress={() => setActiveTab('json')} 
            />
            {bookData && (
              <AppButton 
                label="Hiển thị Giao diện (UI)" 
                variant={activeTab === 'ui' ? 'secondary' : 'ghost'} 
                onPress={() => setActiveTab('ui')} 
              />
            )}
          </View>

          <ScrollView style={styles.resultContent}>
            {loading && (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <AppText style={{ marginTop: 12 }}>Đang chờ phản hồi...</AppText>
              </View>
            )}

            {error && !loading && (
              <View style={styles.errorBox}>
                <AppText tone="danger">LỖI: {error}</AppText>
              </View>
            )}

            {!loading && !error && rawJson && activeTab === 'json' && (
              <View style={styles.rawContainer}>
                <AppText variant="caption" style={styles.rawText}>
                  {JSON.stringify(rawJson, null, 2)}
                </AppText>
              </View>
            )}

            {!loading && !error && bookData && activeTab === 'ui' && (
              <View style={styles.listContainer}>
                <AppText variant="bodyStrong" style={{ marginBottom: 12 }}>
                  Tự động nhận diện cấu trúc Book - Hiển thị {bookData.length} kết quả
                </AppText>
                <View style={styles.grid}>
                  {bookData.map((book, index) => (
                    <View key={book.id || index} style={styles.gridItem}>
                      <BookApiCard book={book} />
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {!loading && !error && !rawJson && (
              <View style={styles.center}>
                <AppText tone="muted">Chưa có kết quả.</AppText>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    backgroundColor: theme.colors.background,
  },
  sidebar: {
    width: Platform.OS === 'web' ? 320 : '100%',
    backgroundColor: theme.colors.surface,
    borderRightWidth: 1,
    borderBottomWidth: Platform.OS === 'web' ? 0 : 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  sidebarTitle: {
    marginBottom: theme.spacing.xl,
  },
  main: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  requestBox: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
    boxShadow: theme.shadow.subtle,
  },
  urlRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 12,
    fontSize: 14,
    backgroundColor: theme.colors.background,
    fontFamily: theme.fonts.sansRegular,
  },
  resultContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    boxShadow: theme.shadow.subtle,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    padding: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  resultContent: {
    flex: 1,
    padding: theme.spacing.md,
  },
  center: {
    padding: 40,
    alignItems: 'center',
  },
  errorBox: {
    backgroundColor: theme.colors.dangerSoft,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  rawContainer: {
    backgroundColor: '#1E1E1E',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  rawText: {
    color: '#D4D4D4',
    fontFamily: theme.fonts.mono,
  },
  listContainer: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItem: {
    width: Platform.OS === 'web' ? '50%' : '100%',
    paddingHorizontal: 8,
  },
});
