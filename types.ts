export interface ConceptNode {
  name: string;
  children?: ConceptNode[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Doubt {
  doubt: string;
  clarification: string;
}

export interface KnowledgeModule {
  identifiedObject: string;
  conceptMap: ConceptNode;
  scientificExplanation: string;
  workingPrinciples: string;
  applications: string[];
  quiz: QuizQuestion[];
  beginnerDoubts: Doubt[];
  suggestedTopics: string[];
}

export interface SavedKnowledgeModule extends KnowledgeModule {
  id: string;
  savedAt: number;
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  data: KnowledgeModule | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface WebSource {
  title: string;
  uri: string;
}

export interface WebResourceData {
  summary: string;
  sources: WebSource[];
}