# Enhanced Journaling Features

This document outlines the comprehensive journaling UI implementation for the Ephra app, which provides users with rich multimedia journaling capabilities.

## Features Overview

### 1. Mood Recording
- **Visual Mood Selection**: Users can select from 5 mood levels with emoji indicators:
  - Rad 😄 (Green)
  - Good 😊 (Light Green)
  - Meh 😐 (Yellow)
  - Bad 😞 (Orange)
  - Awful 😢 (Red)
- **Color-coded Interface**: Each mood has a distinct color for easy visual identification

### 2. Emotion Tracking
- **Detailed Emotions**: Users can select multiple emotions from a comprehensive list with emojis:
  - Positive: happy 😊, excited 🤩, grateful 🙏, calm 😌, confident 😎, energetic ⚡, peaceful ☮️, loved 🥰, proud 🏆, hopeful 🌟
  - Negative: anxious 😰, stressed 😤, sad 😢, angry 😠, frustrated 😤, lonely 😔, overwhelmed 🤯, tired 😴, worried 😟, disappointed 😞
- **Multi-select Interface**: Chip-based UI with emojis allows selecting multiple emotions
- **Visual Feedback**: Selected emotions are highlighted with color changes

### 3. Sleep Quality Tracking
- **Sleep Assessment**: Users can track their sleep quality with 5 levels:
  - Excellent 😴 (Green)
  - Good 😊 (Light Green)
  - Okay 😐 (Yellow)
  - Poor 😵 (Orange)
  - Terrible 🥱 (Red)
- **Visual Interface**: Color-coded buttons with emoji indicators for easy selection

### 4. Text Input Options
- **Quick Note**: Short text input for immediate thoughts (200 character limit)
- **Detailed Notes**: Longer form text input for comprehensive journaling
- **Rich Text Support**: Supports multi-line text with proper formatting

### 5. Voice Recording & Transcription
- **Voice Recording**: High-quality audio recording with real-time duration display
- **Voice-to-Text**: Automatic transcription of voice memos (placeholder implementation ready for real API)
- **Transcription Display**: Shows transcribed text alongside voice memo
- **Auto-append**: Option to automatically add transcriptions to detailed notes

### 6. Photo Attachments
- **Camera Integration**: Take photos directly from the app
- **Gallery Selection**: Choose existing photos from device gallery
- **Photo Preview**: Thumbnail previews with remove functionality
- **Multiple Photos**: Support for multiple photo attachments per entry

### 7. Document Attachments
- **File Types**: Support for PDF, Markdown (.md), and plain text files
- **Document Picker**: Native file picker integration
- **File Management**: Display file names with remove functionality

### 8. Coach Sharing
- **Privacy Control**: Toggle to share entries with assigned coach
- **Visual Indicator**: Clear indication when entries are shared
- **Granular Control**: Per-entry sharing decisions

## Technical Implementation

### Frontend Components

#### JournalEntryScreen.tsx
- **Main Entry Interface**: Comprehensive form for creating/editing journal entries
- **Media Handling**: Integrated photo, voice, and document management
- **Real-time Validation**: Input validation and user feedback
- **Auto-save**: Prevents data loss during entry creation

#### JournalEntryCard.tsx
- **Rich Display**: Shows mood, emotions, media indicators, and content preview
- **Media Previews**: Thumbnail images and media count indicators
- **Responsive Design**: Adapts to different content types and screen sizes

#### TranscriptionService.ts
- **Modular Design**: Easily replaceable with real speech-to-text APIs
- **Error Handling**: Robust error handling and user feedback
- **Language Support**: Ready for multi-language transcription

### Backend Schema Updates

#### Enhanced Journal Model
```sql
-- New fields added to journals table
mood VARCHAR                    -- Main mood selection
emotions JSON                   -- Array of detailed emotions
sleep VARCHAR                   -- Sleep quality tracking
quick_note TEXT                 -- Short note content
notes TEXT                      -- Detailed note content
date TIMESTAMP                  -- Entry date (can differ from created_at)
shared_with_coach BOOLEAN       -- Privacy setting
photo_urls JSON                 -- Array of photo URLs
voice_memo_urls JSON           -- Array of voice memo URLs
voice_memo_durations JSON      -- Array of voice memo durations
pdf_urls JSON                  -- Array of document URLs
pdf_names JSON                 -- Array of document names
```

#### API Endpoints
- **Enhanced CRUD**: Updated journal endpoints support all new fields
- **File Upload**: Media upload endpoints for photos, voice, and documents
- **Validation**: Server-side validation for all new field types

### File Upload Flow

1. **Create Entry**: Basic journal entry created with text content
2. **Upload Media**: Files uploaded to media service with entry association
3. **Update Entry**: Entry updated with media URLs and metadata
4. **Error Handling**: Failed uploads don't prevent entry creation

### Data Flow

```
User Input → Local State → Validation → API Call → Database → Response → UI Update
     ↓
Media Files → Upload Service → File URLs → Entry Update → Final Save
```

## Usage Instructions

### Creating a Journal Entry

1. **Quick Note**: Add immediate thoughts in the quick note field
2. **Mood Selection**: Tap on mood emoji to select current feeling
3. **Emotions**: Select multiple emotions that apply
4. **Voice Recording**:
   - Tap record button to start/stop recording
   - Tap transcribe button to convert speech to text
5. **Photos**: Use camera or gallery buttons to add images
6. **Documents**: Tap document button to attach files
7. **Detailed Notes**: Add comprehensive thoughts in the notes field
8. **Coach Sharing**: Toggle sharing option if desired
9. **Save**: Tap save to create the entry

### Editing Existing Entries

1. **Navigate**: Tap on any journal entry card from the main journal screen
2. **Edit**: Modify any field including adding/removing media
3. **Update**: Save changes to update the entry

## Future Enhancements

### Planned Features
- **Real Speech-to-Text**: Integration with Google Speech-to-Text or OpenAI Whisper
- **Mood Analytics**: Trend analysis and mood pattern recognition
- **Export Options**: PDF export of journal entries
- **Search Functionality**: Full-text search across all entries
- **Tags System**: Custom tags for better organization
- **Reminders**: Configurable journaling reminders

### Technical Improvements
- **Offline Support**: Local storage for offline journaling
- **Sync Optimization**: Efficient data synchronization
- **Performance**: Image compression and lazy loading
- **Accessibility**: Enhanced screen reader support

## Testing Recommendations

### Manual Testing
1. **Create entries** with various combinations of content types
2. **Test media uploads** with different file sizes and types
3. **Verify transcription** functionality (placeholder behavior)
4. **Check responsive design** on different screen sizes
5. **Test error scenarios** (network failures, invalid files)

### Automated Testing
- **Unit tests** for transcription service
- **Integration tests** for API endpoints
- **UI tests** for form validation and media handling

## Deployment Notes

### Database Migration
- Run the provided Alembic migration to add new journal fields
- Ensure JSON column support in your database (PostgreSQL recommended)

### Environment Variables
- Configure media upload directories
- Set up file size limits
- Configure transcription service API keys (when implementing real service)

### Performance Considerations
- Implement file size limits for uploads
- Use image compression for photos
- Consider CDN for media file delivery
- Monitor database performance with JSON queries
