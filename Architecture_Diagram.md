# 🏗️ MoodTracker Architecture Diagrams

## 📐 System Architecture Overview

```
                    🌐 INTERNET
                         │
┌────────────────────────┼────────────────────────┐
│                   AWS CLOUD                     │
│                        │                        │
│    ┌─────────────────────────────────────┐      │
│    │          CloudFront CDN             │      │
│    │    (Global Content Delivery)        │      │
│    │  • HTTPS Termination                │      │
│    │  • Global Caching                   │      │
│    │  • DDoS Protection                  │      │
│    └─────────────────┬───────────────────┘      │
│                      │                          │
│    ┌─────────────────▼───────────────────┐      │
│    │           S3 Bucket                 │      │
│    │      (Frontend Hosting)             │      │
│    │  • React SPA Files                  │      │
│    │  • Static Assets                    │      │
│    │  • Public Read Access              │      │
│    └─────────────────────────────────────┘      │
│                                                 │
│    ┌─────────────────────────────────────┐      │
│    │         AWS Cognito                 │      │
│    │    (User Authentication)            │      │
│    │  • User Pool Management             │      │
│    │  • JWT Token Generation            │      │
│    │  • Email Verification              │      │
│    │  • Password Policies               │      │
│    └─────────────────────────────────────┘      │
│                                                 │
└─────────────────────────────────────────────────┘
                         │
                    USER BROWSER
              ┌─────────────────────┐
              │   React Frontend    │
              │                     │
              │ ┌─────┐ ┌─────────┐ │
              │ │Auth │ │Dashboard│ │
              │ │Pages│ │ + Tabs  │ │
              │ └─────┘ └─────────┘ │
              │                     │
              │ ┌─────────────────┐ │
              │ │   Components    │ │
              │ │ • EntryForm     │ │
              │ │ • Analytics     │ │
              │ │ • AI Chat       │ │
              │ │ • Calendar      │ │
              │ └─────────────────┘ │
              └─────────────────────┘
```

## 🔄 Data Flow Architecture

```
┌─────────────────┐    HTTP Requests    ┌─────────────────┐
│  React Client   │────────────────────▶│  API Gateway    │
│                 │                     │                 │
│ • User Actions  │◀────────────────────│ • Route Requests│
│ • State Updates │    JSON Responses   │ • CORS Handling │
│ • UI Rendering  │                     │ • Throttling    │
└─────────────────┘                     └─────────────────┘
         │                                       │
         │                                       │
         ▼                                       ▼
┌─────────────────┐                     ┌─────────────────┐
│ Local Storage   │                     │ Lambda Functions│
│                 │                     │                 │
│ • Offline Cache │                     │ ┌─────────────┐ │
│ • Photo Blobs   │                     │ │createEntry  │ │
│ • User Prefs    │                     │ │getEntries   │ │
│ • Session Data  │                     │ │deleteEntry  │ │
└─────────────────┘                     │ │analytics    │ │
                                        │ │aiChat       │ │
                                        │ │sentiment    │ │
                                        │ │photoUpload  │ │
                                        │ │photoManager │ │
                                        │ └─────────────┘ │
                                        └─────────────────┘
                                                 │
                                                 ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐
│  DynamoDB   │  │ S3 Photos   │  │External APIs│  │AWS Comprehend│
│             │  │             │  │             │  │              │
│• Mood Data  │  │• User Images│  │• OpenAI GPT │  │• Sentiment   │
│• User Prefs │  │• Thumbnails │  │• Anthropic  │  │• Language    │
│• Analytics  │  │• Metadata   │  │• Groq API   │  │• Detection   │
└─────────────┘  └─────────────┘  └─────────────┘  └──────────────┘
```

## 🔐 Authentication & Security Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                      │
└─────────────────────────────────────────────────────────────┘

1. User Registration
   ┌─────────┐  signup   ┌─────────┐  verify   ┌─────────┐
   │ Client  │──────────▶│ Cognito │──────────▶│  Email  │
   │         │           │         │           │ Service │
   └─────────┘           └─────────┘           └─────────┘

2. Email Verification
   ┌─────────┐   code    ┌─────────┐  confirm  ┌─────────┐
   │  User   │──────────▶│ Client  │──────────▶│ Cognito │
   │         │           │         │           │         │
   └─────────┘           └─────────┘           └─────────┘

3. Session Management
   ┌─────────┐    JWT    ┌─────────┐  validate ┌─────────┐
   │ Cognito │──────────▶│ Client  │──────────▶│ Lambda  │
   │         │           │         │           │Functions│
   └─────────┘           └─────────┘           └─────────┘

┌─────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   Frontend      │  ✓ Input Validation
│   Security      │  ✓ HTTPS Only
│                 │  ✓ Secure Headers
└─────────────────┘

┌─────────────────┐
│   API Gateway   │  ✓ CORS Policies
│   Security      │  ✓ Rate Limiting
│                 │  ✓ Request/Response Logging
└─────────────────┘

┌─────────────────┐
│   Lambda        │  ✓ JWT Validation
│   Security      │  ✓ Input Sanitization
│                 │  ✓ Error Handling
└─────────────────┘

┌─────────────────┐
│   Database      │  ✓ Encryption at Rest
│   Security      │  ✓ User Isolation
│                 │  ✓ Conditional Operations
└─────────────────┘
```

## 📱 Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT COMPONENT TREE                     │
└─────────────────────────────────────────────────────────────┘

                        ┌─────────┐
                        │   App   │
                        │ (Router)│
                        └────┬────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
         ┌────▼────┐    ┌────▼────┐    ┌───▼────┐
         │Landing  │    │ Login   │    │Dashboard│
         │  Page   │    │  Page   │    │  Page   │
         └─────────┘    └─────────┘    └────┬────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
               ┌────▼────┐            ┌────▼────┐            ┌────▼────┐
               │  Entry  │            │Analytics│            │AI Chat  │
               │  Form   │            │Dashboard│            │Component│
               └─────────┘            └─────────┘            └─────────┘
                    │                       │
           ┌────────┼────────┐         ┌───┼───┐
           │        │        │         │       │
      ┌───▼──┐ ┌───▼──┐ ┌───▼──┐ ┌───▼───┐ ┌─▼───┐
      │Photo │ │Tags  │ │Mood  │ │Charts │ │Heat │
      │Upload│ │Input │ │Slider│ │       │ │ Map │
      └──────┘ └──────┘ └──────┘ └───────┘ └─────┘

┌─────────────────────────────────────────────────────────────┐
│                    CONTEXT PROVIDERS                        │
└─────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │  ErrorBoundary  │
                    │   (Global)      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  AuthProvider   │
                    │ • User State    │
                    │ • Tokens        │
                    │ • Auth Actions  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ ThemeProvider   │
                    │ • Light/Dark    │
                    │ • Animations    │
                    │ • Preferences   │
                    └─────────────────┘
```

## 📊 Lambda Function Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LAMBDA FUNCTIONS                         │
└─────────────────────────────────────────────────────────────┘

API Gateway
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│                   REQUEST ROUTING                           │
├─────────────────────────────────────────────────────────────┤
│  POST /entries        → createEntry Lambda                  │
│  GET  /entries        → getEntries Lambda                   │
│  DELETE /entries/{id} → deleteEntry Lambda                  │
│  GET  /analytics      → analytics Lambda                    │
│  POST /chat           → aiChat Lambda                       │
│  POST /sentiment      → sentiment Lambda                    │
│  POST /photos/upload  → photoUpload Lambda                  │
│  GET  /photos         → photoManager Lambda                 │
│  DELETE /photos/{id}  → photoManager Lambda                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  createEntry    │  │   getEntries    │  │  deleteEntry    │
│                 │  │                 │  │                 │
│ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │
│ │ Validation  │ │  │ │ Query Build │ │  │ │ Ownership   │ │
│ │ • Mood 1-5  │ │  │ │ • Date Range│ │  │ │ Check       │ │
│ │ • Tags      │ │  │ │ • Pagination│ │  │ │ • User ID   │ │
│ │ • Photos    │ │  │ │ • Sorting   │ │  │ │ • Entry ID  │ │
│ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │
│ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │
│ │ DynamoDB    │ │  │ │ Response    │ │  │ │ DynamoDB    │ │
│ │ Put Item    │ │  │ │ Formatting  │ │  │ │ Delete Item │ │
│ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   analytics     │  │    aiChat       │  │   sentiment     │
│                 │  │                 │  │                 │
│ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │
│ │ Data Query  │ │  │ │ Provider    │ │  │ │ AWS         │ │
│ │ • 7-30 Days │ │  │ │ Selection   │ │  │ │ Comprehend  │ │
│ │ • User Data │ │  │ │ • OpenAI    │ │  │ │ • Sentiment │ │
│ └─────────────┘ │  │ │ • Anthropic │ │  │ │ • Language  │ │
│ ┌─────────────┐ │  │ │ • Groq      │ │  │ └─────────────┘ │
│ │Statistical  │ │  │ └─────────────┘ │  │ ┌─────────────┐ │
│ │Processing   │ │  │ ┌─────────────┐ │  │ │ Mood Scale  │ │
│ │ • Averages  │ │  │ │ Therapy     │ │  │ │ Conversion  │ │
│ │ • Trends    │ │  │ │ Context     │ │  │ │ • 1-5 Scale │ │
│ │ • Patterns  │ │  │ │ • Crisis    │ │  │ │ • Confidence│ │
│ └─────────────┘ │  │ │ • Techniques│ │  │ └─────────────┘ │
└─────────────────┘  │ └─────────────┘ │  └─────────────────┘
                     └─────────────────┘

┌─────────────────┐  ┌─────────────────────────────────────────┐
│  photoUpload    │  │           photoManager                  │
│                 │  │                                         │
│ ┌─────────────┐ │  │ ┌─────────────┐  ┌─────────────────────┐│
│ │ Validation  │ │  │ │    LIST     │  │       DELETE        ││
│ │ • File Type │ │  │ │             │  │                     ││
│ │ • Size Limit│ │  │ │ ┌─────────┐ │  │ ┌─────────────────┐ ││
│ │ • User Auth │ │  │ │ │S3 List  │ │  │ │ Ownership Check │ ││
│ └─────────────┘ │  │ │ │Objects  │ │  │ │ • User Prefix   │ ││
│ ┌─────────────┐ │  │ │ └─────────┘ │  │ └─────────────────┘ ││
│ │ Presigned   │ │  │ │ ┌─────────┐ │  │ ┌─────────────────┐ ││
│ │ URL Gen     │ │  │ │ │Format   │ │  │ │ S3 Delete       │ ││
│ │ • 5min TTL  │ │  │ │ │Response │ │  │ │ Object          │ ││
│ │ • Metadata  │ │  │ │ └─────────┘ │  │ └─────────────────┘ ││
│ └─────────────┘ │  │ └─────────────┘  └─────────────────────┘│
└─────────────────┘  └─────────────────────────────────────────┘
```

## 🗄️ Database Design

```
┌─────────────────────────────────────────────────────────────┐
│                    DYNAMODB TABLE DESIGN                    │
└─────────────────────────────────────────────────────────────┘

Table Name: MoodEntries

Primary Key:
├── Partition Key: userId (String)
└── Sort Key: entryId (String)

Attributes:
├── userId: "user_email_com"         (Partition Key)
├── entryId: "uuid-v4"               (Sort Key)  
├── mood: 1-5                        (Number)
├── intensity: 1-10                  (Number, Optional)
├── note: "User's note text"         (String, Optional)
├── tags: ["work", "family"]         (String Set, Optional)
├── photos: [                        (List, Optional)
│   {
│     "id": "photo_uuid",
│     "url": "s3://bucket/key",
│     "fileName": "image.jpg",
│     "fileType": "image/jpeg",
│     "fileSize": 1024000
│   }
├── ]
├── promptId: "daily_reflection"     (String, Optional)
├── createdAt: "2024-01-15T10:30:00Z" (ISO String)
├── date: "Jan 15, 2024"             (Readable String)
└── timestamp: 1705315800000         (Number, for sorting)

Global Secondary Indexes:
├── DateIndex: 
│   ├── Partition Key: userId
│   └── Sort Key: createdAt
└── (Additional indexes as needed)

Query Patterns:
├── Get user entries: PK = userId
├── Get entries by date: GSI with userId + createdAt range
├── Get single entry: PK = userId, SK = entryId
└── Delete entry: PK = userId, SK = entryId

┌─────────────────────────────────────────────────────────────┐
│                    S3 BUCKET STRUCTURE                       │
└─────────────────────────────────────────────────────────────┘

Frontend Bucket: moodtracker-frontend
├── index.html                       (Entry point)
├── assets/
│   ├── index-[hash].js             (React bundle)
│   ├── index-[hash].css            (Styles)
│   └── images/                     (Static assets)
└── (CloudFront distribution)

Photos Bucket: moodtracker-photos
├── users/
│   ├── user_email_com/
│   │   └── photos/
│   │       ├── photo_uuid_1/
│   │       │   └── image.jpg
│   │       ├── photo_uuid_2/
│   │       │   └── selfie.png
│   │       └── ...
│   └── another_user_domain_com/
│       └── photos/...
└── (Lifecycle policies for cleanup)
```

This comprehensive documentation provides you with everything you need to explain the MoodTracker application to recruiters and technical interviewers. The visual diagrams help illustrate the sophisticated architecture and your technical skills across frontend development, cloud services, and system design.