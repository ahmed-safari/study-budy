# Study Buddy: AI-Powered Learning Assistant


## 🌟 Live Demo

Experience Study Buddy in action: [https://study-budy-psi.vercel.app](https://study-budy-psi.vercel.app)

## 📚 Overview

Study Buddy is an AI-powered learning assistant designed to revolutionize how students interact with educational materials. The application leverages advanced natural language processing technologies to transform passive learning materials into interactive study tools. Study Buddy helps students organize study materials, generate summaries, create flashcards, and take quizzes to enhance learning efficiency and retention.

Developed as a project for DSAI4201 Selected Topics in Data Science (Winter 2025), Study Buddy demonstrates practical applications of AI in educational technology.

## ✨ Key Features

- **Multi-format Material Processing**: Support for PDF documents and audio files (MP3, WAV, M4A)
- **Intelligent Content Extraction**: AI-powered extraction of text from PDFs and transcription of audio files
- **Study Session Management**: Organize materials by subject and purpose
- **AI-Generated Summaries**: Create concise summaries of study materials with key concepts highlighted
- **Interactive Flashcards**: Automatically generate flashcards from uploaded content
- **Custom Quizzes**: Create quizzes with different difficulty levels based on uploaded materials
- **Content Sharing**: Share summaries and study materials with peers
- **Material Analysis**: Get insights into the content and structure of study materials
- **Responsive Design**: Fully responsive interface works on desktop and mobile devices
- **Material Management**: Organize, categorize, and search through your study materials

## 🛠️ Technology Stack

### Frontend

- **Next.js**: React framework for building the user interface
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide Icons**: Beautiful, consistent icon set
- **React Markdown**: Rendering markdown content

### Backend

- **Next.js API Routes**: Backend API endpoints
- **Prisma ORM**: Database access and management
- **PostgreSQL**: Relational database for data storage
- **Vercel Blob**: Storage for uploaded files
- **OpenAI API**: GPT-4o for intelligent content processing
- **Whisper API**: Audio transcription

### DevOps

- **Vercel**: Hosting and deployment
- **GitHub**: Version control

## 🔧 Setup & Installation

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- PostgreSQL database
- OpenAI API key

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/studybuddy"

# OpenAI
OPENAI_API_KEY="your_openai_api_key"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="your_vercel_blob_token"
```

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/ahmed-safari/study-budy
   cd study-buddy
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up the database**

   ```bash
   npx prisma migrate deploy
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Feature Details

### Study Session Management

Study sessions are the top-level organizational units. Each session can contain multiple study materials and has properties like title, description, and subject. This helps users organize materials by topic or course.

### Material Processing

Study Buddy supports several document formats:

- **PDFs**: Uses GPT-4o to extract text and generate descriptions
- **Audio files**: Uses Whisper API to transcribe content and GPT-3.5 to generate descriptions
- **Web content**: Processes text content from web URLs

> **Note on YouTube Content**: Due to YouTube's strict API policies, direct downloading of content is not permitted.

### AI-Generated Summaries

Study Buddy creates concise, structured summaries of your study materials. The summary generation:

1. Analyzes the full content of the material
2. Identifies key topics and concepts
3. Organizes information in a hierarchical structure
4. Formats the content with markdown for readability
5. Includes explanations of complex ideas

Summaries can be viewed online, shared, printed, or downloaded as markdown files.

### Flashcard Generation

The flashcard feature uses AI to identify key terms, concepts, and information suitable for flash card format. Each flashcard consists of:

- A front side with a question or prompt
- A back side with the answer or explanation

Users can:

- Create multiple flashcard decks per material
- Customize flashcard content
- Review flashcards in study mode

### Quiz Generation

Study Buddy creates quizzes based on the material content with:

- Multiple choice questions
- True/false questions
- Fill-in-the-blank questions
- Difficulty settings (easy, medium, hard)
- Explanations for answers

### Material Viewer

The material viewer provides a clean interface for accessing processed materials:

- Formatted display of extracted text
- File information (type, size, date created)
- Access to all generated study tools (summaries, flashcards, quizzes)
- Material status monitoring

## 🧠 AI Implementation Details

### PDF Processing

PDFs are processed using OpenAI's GPT-4o model with the following approach:

1. The PDF file is converted to base64 encoding
2. The file is sent to the OpenAI API with a specialized system prompt
3. GPT-4o extracts all text content including headers, paragraphs, bullet points
4. The model identifies and describes visual elements (images, tables, graphs)
5. A concise description is generated for the document
6. The response is returned in JSON format with extracted text and description

### Audio Processing

Audio files are processed using OpenAI's Whisper API and GPT-3.5:

1. The audio file is converted to a suitable format
2. The file is sent to the Whisper API for transcription
3. The transcription is processed by GPT-3.5 to generate a description
4. The response includes both the transcribed text and a description

### Summary Generation

Summaries are generated using GPT-4 with a specific prompt structure:

1. The material's raw content is provided as context
2. The model is instructed to create a comprehensive summary with clear structure
3. The summary is formatted with markdown headings, bullet points, and emphasis
4. Key concepts are highlighted and complex ideas are explained
5. A brief overview is provided at the beginning

### Flashcard Generation

Flashcards are created using GPT-4 with specialized instructions:

1. The material's content is analyzed for suitable flashcard topics
2. The model identifies key terms, definitions, concepts, and facts
3. Each item is formatted as a question-answer pair
4. The front contains a question or prompt that tests understanding
5. The back contains the answer or explanation

### Quiz Generation

Quizzes are generated using GPT-4 with difficulty-specific prompting:

1. The material's content is analyzed for quiz-worthy topics
2. Questions are created based on the selected difficulty level
3. Multiple-choice options include the correct answer and plausible distractors
4. Explanations are provided for each correct answer
5. The questions are organized into a structured quiz format

## 📝 AI Prompts Used

### PDF Processing Prompt

```
You are a PDF content extractor that provides responses in JSON format only. When processing a PDF document:
1. Extract ALL text content including headers, paragraphs, bullets, footnotes, and captions.
2. Pay special attention to images, graphs, tables, charts, and diagrams - describe their content in detail within the text. Include numerical data from tables, axis labels from charts, and key information from diagrams.
3. Create a very concise description (maximum 2 sentences) of what this document is about.
4. Always maintain the document's structure and formatting as much as possible.
Return your response as valid JSON with the following format:
{
  "extracted_text": "The full extracted text with all content including descriptions of visual elements",
  "description": "A concise 1-2 sentence description of the document"
}
```

### Audio Transcription Description Prompt

```
Generate a very concise description (maximum 2 sentences) of what this audio transcription is about.
```

### Summary Generation Prompt

```
Based on the following study material, create a comprehensive summary in markdown format.

Study Material:
[Content of the material]

Requirements:
1. The summary should be titled: [Title]
2. Structure the summary with clear headings (using markdown # syntax) for main topics
3. Use subheadings (##, ###) for subtopics
4. Include bullet points for key concepts
5. Include examples where appropriate
6. Explain complex ideas clearly
7. Format the output in well-structured markdown
8. Include a brief summary at the beginning
9. Group related concepts together
10. Use bold and italic formatting to highlight key terms
```

### Flashcard Generation Prompt

```
Create a set of flashcards based on the following study material. Each flashcard should have a question on the front and the answer on the back.

Study Material:
[Content of the material]

Requirements:
1. Create [number] flashcards covering key concepts, definitions, facts, and principles
2. Each flashcard should test understanding, not just memorization
3. Front side should contain a clear, concise question or prompt
4. Back side should contain a complete, accurate answer
5. Include a mix of definitional, conceptual, and application questions
6. Return the flashcards as a JSON array
```

### Quiz Generation Prompt

```
Create a [difficulty] quiz based on the following study material. Include a mix of question types.

Study Material:
[Content of the material]

Requirements:
1. Create [number] questions at the [difficulty] level
2. Include multiple-choice questions with 4 options each
3. For multiple-choice, ensure only one option is correct
4. Include true/false questions when appropriate
5. Write clear, unambiguous questions
6. Provide a brief explanation for each correct answer
7. Return the quiz as a JSON object
```

## 📁 Project Structure

```
study-buddy/
├── app/                   # Next.js app directory
│   ├── api/               # API routes
│   ├── flashcards/        # Flashcard pages
│   ├── materials/         # Material viewer pages
│   ├── quiz/              # Quiz pages
│   ├── sessions/          # Session management
│   ├── summary/           # Summary pages
│   └── upload_materials/  # Material upload pages
├── components/            # React components
│   ├── layout/            # Layout components
│   ├── materials/         # Material-related components
│   ├── ui/                # UI components
│   └── utils/             # Utility components
├── lib/                   # Library functions
├── prisma/                # Prisma schema and migrations
├── public/                # Static assets
└── utils/                 # Utility functions
    ├── database.js        # Database utilities
    ├── fileProcessors.js  # File processing logic
    └── youtube.js         # YouTube processing utilities
```

## 🔄 Workflow

1. **Create a Study Session**: Start by creating a session for a specific subject
2. **Upload Materials**: Add PDF documents, audio files, or web links
3. **Process Materials**: Study Buddy automatically processes and extracts content
4. **Generate Study Tools**: Create summaries, flashcards, or quizzes
5. **Study and Review**: Use the generated tools to study and test knowledge
6. **Share and Collaborate**: Share materials and summaries with peers

## 📈 Future Enhancements

- **User Authentication**: Add user accounts and authentication
- **Collaboration Features**: Real-time collaboration on study materials
- **Progress Tracking**: Monitor learning progress over time
- **Advanced Analytics**: Detailed insights into study patterns and performance
- **Mobile App**: Native mobile applications for iOS and Android
- **Offline Mode**: Support for studying without an internet connection
- **Integration with LMS**: Connect with Learning Management Systems
- **AI Tutor**: Interactive AI tutor for personalized learning

## 👥 Contributors
- [Ahmed Safari](https://github.com/ahmed-safari/)
- [Taha Alfarawati](https://github.com/TTM-Fa)
- [Noora Al-Kuwari](https://github.com/Nooraalkuwari)

## 🙏 Acknowledgements

- OpenAI for providing the AI models that power Study Buddy
- Vercel for hosting and deployment services
- The Next.js team for the excellent framework
- All contributors and testers who helped improve the product

---

Made with ❤️ for learners everywhere
