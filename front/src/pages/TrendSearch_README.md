# TrendSearch Frontend Updates

## Overview
Updated the TrendSearch.tsx component to support the enhanced LangChain-based backend API with comprehensive trend analysis features.

## New Features

### 🔄 Search Mode Toggle
- **Quick Search (3-10 seconds)**: Fast analysis using search results only
- **Detailed Search (10-30 seconds)**: Comprehensive analysis with web scraping

### 📊 Enhanced Data Display
- **Popularity Score**: Visual progress bar showing trend popularity (0-100)
- **Trend Direction**: Color-coded indicators (上昇中/安定/下降中)
- **Related Topics**: Additional relevant topics discovered during analysis
- **Metadata**: Search timestamp and data source count
- **Improved UI**: Better visual hierarchy and responsive design

### 🎯 Categorized Trend Selection
- **TrendSearchDemo Component**: Organized trends by category
  - テクノロジー (Technology)
  - ビジネス (Business) 
  - 社会・環境 (Society & Environment)
  - ライフスタイル (Lifestyle)

## Updated Interface

```typescript
interface TrendResult {
  trend: string;
  summary: string;
  keywords: string[];
  insights: string[];
  popularity_score?: number;        // NEW: 0-100 popularity score
  trend_direction?: string;         // NEW: 上昇中/安定/下降中
  related_topics?: string[];        // NEW: Related topics array
  search_timestamp?: string;        // NEW: ISO timestamp
  data_sources?: number;           // NEW: Number of data sources used
  raw_response?: string;           // Error fallback
}
```

## API Integration

### Updated Endpoints
- `GET /api/trendSearch/search` - Full analysis with web scraping
- `GET /api/trendSearch/search/simple` - Quick analysis without web scraping

### Service Functions
```typescript
// Full search
export const search = async (trend: string) => { ... }

// Quick search  
export const searchSimple = async (trend: string) => { ... }
```

## UI Components

### Search Mode Selector
```tsx
<div className="bg-white rounded-lg p-1 shadow-md">
  <button onClick={() => setSearchMode('simple')}>
    クイック検索 (3-10秒)
  </button>
  <button onClick={() => setSearchMode('full')}>
    詳細検索 (10-30秒)
  </button>
</div>
```

### Popularity Score Display
```tsx
<div className="w-20 h-3 bg-gray-200 rounded-full overflow-hidden">
  <div 
    className={`h-full transition-all duration-500 ${getPopularityColor(score)}`}
    style={{ width: `${score}%` }}
  />
</div>
```

### Trend Direction Badge
```tsx
<span className={`px-3 py-1 rounded-full text-sm font-medium ${getTrendDirectionColor(direction)}`}>
  📈 {direction}
</span>
```

## Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Grid Layout**: Responsive grid for keywords and related topics
- **Flexible Cards**: Adaptive card layouts for different screen sizes
- **Touch-friendly**: Larger touch targets for mobile interaction

## Error Handling

- **Network Errors**: Clear error messages with retry options
- **API Failures**: Graceful fallback to raw response display
- **Loading States**: Visual loading indicators with estimated time
- **Validation**: Input validation and encoding for search terms

## Performance Optimizations

- **Conditional Rendering**: Only render demo when no results
- **Lazy Loading**: Components load only when needed
- **Optimized Re-renders**: Proper state management to minimize re-renders
- **Caching**: URL encoding for proper API calls

## Usage Examples

### Basic Search
```tsx
const handleSearch = async (trend: string) => {
  const endpoint = searchMode === 'full' ? 'search' : 'search/simple';
  const response = await fetch(`${API_BASE_URL}/trendSearch/${endpoint}?trend=${encodeURIComponent(trend)}`);
  const data = await response.json();
  setResult(data);
};
```

### Mode Selection
```tsx
const [searchMode, setSearchMode] = useState<'full' | 'simple'>('simple');
```

## Migration Notes

- **Backward Compatible**: Existing API calls continue to work
- **Enhanced Data**: Additional fields are optional and won't break existing code
- **Progressive Enhancement**: New features enhance the experience without breaking old functionality
- **Type Safety**: Full TypeScript support with proper type definitions