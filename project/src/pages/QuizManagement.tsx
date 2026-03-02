import { useEffect, useState } from 'react';
import { Plus, Save, Trash2, Edit2, BookOpen, ArrowLeft, ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import api from '../utils/api';
import { toast } from 'react-toastify';

interface Topic {
  id: number;
  name: string;
}

interface Module {
  id: number;
  title: string;
  topic: number;
  order?: number;
}

interface MainContent {
  id: number;
  title: string;
  module: number;
  module_detail: { id: number; title: string };
  order?: number;
}

interface Choice {
  id: number;
  text: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  text: string;
  choices: Choice[];
}

const QuizManagement = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [mainContents, setMainContents] = useState<MainContent[]>([]);

  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [expandedMainContents, setExpandedMainContents] = useState<Set<number>>(new Set());

  const [selectedMainContent, setSelectedMainContent] = useState<MainContent | null>(null);
  const [quizId, setQuizId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    question_text: '',
    choices: ['', '', '', ''],
    correct_answer: '1',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [topicsRes, modulesRes, mainContentsRes] = await Promise.all([
        api.get('/api/topics/'),
        api.get('/api/modules/'),
        api.get('/api/maincontents/'),
      ]);
      setTopics(topicsRes.data);
      setModules(modulesRes.data);
      setMainContents(mainContentsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topicId: number) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      next.has(topicId) ? next.delete(topicId) : next.add(topicId);
      return next;
    });
  };

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(moduleId) ? next.delete(moduleId) : next.add(moduleId);
      return next;
    });
  };

  const toggleMainContent = (mainContentId: number) => {
    setExpandedMainContents((prev) => {
      const next = new Set(prev);
      next.has(mainContentId) ? next.delete(mainContentId) : next.add(mainContentId);
      return next;
    });
  };

  const getModulesByTopic = (topicId: number) =>
    modules.filter((m) => m.topic === topicId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const getMainContentsByModule = (moduleId: number) =>
    mainContents
      .filter((mc) => mc.module_detail.id === moduleId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const handleMainContentSelect = async (content: MainContent) => {
    setSelectedMainContent(content);
    try {
      const response = await api.get(`/api/quizzes/?main_content=${content.id}`);
      if (response.data.length > 0) {
        const quiz = response.data[0];
        setQuizId(quiz.id);
        setQuestions(quiz.questions || []);
      } else {
        const createResponse = await api.post('/api/quizzes/', {
          main_content: content.id,
          title: 'Quiz',
        });
        setQuizId(createResponse.data.id);
        setQuestions([]);
        toast.success('Quiz created for this main content');
      }
    } catch (error) {
      toast.error('Failed to load quiz');
    }
  };

  const handleBackToList = () => {
    setSelectedMainContent(null);
    setQuizId(null);
    setQuestions([]);
    setShowAddForm(false);
    setEditingQuestion(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.question_text.length < 5) {
      toast.error('Question must be at least 5 characters');
      return;
    }
    if (formData.choices.some((c) => !c)) {
      toast.error('All choices must be filled');
      return;
    }
    if (!quizId) {
      toast.error('Please select a main content first');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        text: formData.question_text,
        choices: formData.choices.map((text, index) => ({
          text,
          is_correct: String(index + 1) === formData.correct_answer,
        })),
      };
      if (editingQuestion) {
        await api.put(`/api/quizzes/${quizId}/update_question/`, {
          question_id: editingQuestion.id,
          ...payload,
        });
        toast.success('Question updated successfully');
      } else {
        await api.post(`/api/quizzes/${quizId}/add_question/`, payload);
        toast.success('Question added successfully');
      }
      setFormData({ question_text: '', choices: ['', '', '', ''], correct_answer: '1' });
      setShowAddForm(false);
      setEditingQuestion(null);
      if (selectedMainContent) handleMainContentSelect(selectedMainContent);
    } catch (error) {
      toast.error(editingQuestion ? 'Failed to update question' : 'Failed to add question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      question_text: question.text,
      choices: question.choices.map((c) => c.text),
      correct_answer: String(question.choices.findIndex((c) => c.is_correct) + 1),
    });
    setShowAddForm(true);
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.delete(`/api/quizzes/${quizId}/delete_question/`, {
        data: { question_id: questionId },
      });
      toast.success('Question deleted successfully');
      if (selectedMainContent) handleMainContentSelect(selectedMainContent);
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingQuestion(null);
    setFormData({ question_text: '', choices: ['', '', '', ''], correct_answer: '1' });
  };

  if (loading) return <Loader />;

  // ─── Quiz Detail View ──────────────────────────────────────────────────────
  if (selectedMainContent) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Quiz Management
              </button>
              <h1 className="text-3xl font-bold text-gray-800">{selectedMainContent.title}</h1>
            </div>

            <div className="mb-6">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
                Add New Question
              </button>
            </div>

            {showAddForm && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                    <textarea
                      value={formData.question_text}
                      onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      rows={3}
                      placeholder="Enter question (min 5 characters)"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.choices.map((choice, index) => (
                      <div key={index}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Choice {index + 1}
                        </label>
                        <input
                          type="text"
                          value={choice}
                          onChange={(e) => {
                            const newChoices = [...formData.choices];
                            newChoices[index] = e.target.value;
                            setFormData({ ...formData, choices: newChoices });
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          placeholder={`Enter choice ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                    <select
                      value={formData.correct_answer}
                      onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="1">Choice 1</option>
                      <option value="2">Choice 2</option>
                      <option value="3">Choice 3</option>
                      <option value="4">Choice 4</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {editingQuestion ? <Edit2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                      {submitting ? 'Saving...' : editingQuestion ? 'Update Question' : 'Save Question'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelForm}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Questions</h2>
              {questions.length > 0 ? (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-800 flex-1">
                          Q{index + 1}: {question.text}
                        </h3>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditQuestion(question)}
                            className="text-blue-600 hover:text-blue-800 transition p-2"
                            title="Edit question"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="text-red-600 hover:text-red-800 transition p-2"
                            title="Delete question"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {question.choices.map((choice, choiceIndex) => (
                          <div
                            key={choice.id}
                            className={`p-3 rounded-lg ${choice.is_correct
                                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                                : 'bg-gray-50'
                              }`}
                          >
                            <span className="font-medium">{choiceIndex + 1}.</span> {choice.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No questions added yet</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Add your first question
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Hierarchy List View ───────────────────────────────────────────────────
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Quiz Management</h1>
            <p className="text-gray-500 mt-1">Select a main content to manage its quiz questions</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            {topics.length > 0 ? (
              <div className="space-y-3">
                {topics.map((topic) => {
                  const topicModules = getModulesByTopic(topic.id);
                  const isTopicExpanded = expandedTopics.has(topic.id);

                  return (
                    <div key={topic.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Topic Row */}
                      <div
                        onClick={() => toggleTopic(topic.id)}
                        className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 cursor-pointer p-4 transition"
                      >
                        <div className="flex items-center gap-3">
                          {isTopicExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          )}
                          <h3 className="text-lg font-semibold text-gray-800">{topic.name}</h3>
                          <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                            {topicModules.length} module{topicModules.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Modules */}
                      {isTopicExpanded && (
                        <div className="pl-6 py-2 space-y-2">
                          {topicModules.length > 0 ? (
                            topicModules.map((module) => {
                              const moduleMainContents = getMainContentsByModule(module.id);
                              const isModuleExpanded = expandedModules.has(module.id);

                              return (
                                <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                  {/* Module Row */}
                                  <div
                                    onClick={() => toggleModule(module.id)}
                                    className="flex items-center justify-between bg-blue-50 hover:bg-blue-100 cursor-pointer p-3 transition"
                                  >
                                    <div className="flex items-center gap-3">
                                      {isModuleExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-blue-600" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-blue-600" />
                                      )}
                                      <h4 className="text-md font-medium text-gray-700">{module.title}</h4>
                                      <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                                        {moduleMainContents.length} content{moduleMainContents.length !== 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Main Contents */}
                                  {isModuleExpanded && (
                                    <div className="pl-6 py-2 space-y-2">
                                      {moduleMainContents.length > 0 ? (
                                        moduleMainContents.map((mainContent) => {
                                          const isMainContentExpanded = expandedMainContents.has(mainContent.id);

                                          return (
                                            <div key={mainContent.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                              {/* MainContent Row */}
                                              <div
                                                onClick={() => toggleMainContent(mainContent.id)}
                                                className="flex items-center justify-between bg-indigo-50 hover:bg-indigo-100 cursor-pointer p-3 transition"
                                              >
                                                <div className="flex items-center gap-3">
                                                  {isMainContentExpanded ? (
                                                    <ChevronDown className="w-4 h-4 text-indigo-600" />
                                                  ) : (
                                                    <ChevronRight className="w-4 h-4 text-indigo-600" />
                                                  )}
                                                  <BookOpen className="w-4 h-4 text-indigo-500" />
                                                  <h5 className="text-sm font-medium text-gray-700">{mainContent.title}</h5>
                                                </div>
                                              </div>

                                              {/* Quiz Entry */}
                                              {isMainContentExpanded && (
                                                <div className="pl-6 py-3 bg-white">
                                                  <div
                                                    onClick={() => handleMainContentSelect(mainContent)}
                                                    className="group relative flex items-center gap-4 p-4 rounded-lg border border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all duration-200"
                                                  >
                                                    <div className="p-2 bg-[#203f78] rounded-lg group-hover:scale-110 transition-transform duration-200">
                                                      <HelpCircle className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                      <p className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                                                        Quiz for "{mainContent.title}"
                                                      </p>
                                                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block"></span>
                                                        Click to manage questions
                                                      </p>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })
                                      ) : (
                                        <div className="py-4 text-center text-gray-500 text-sm">
                                          No main contents found for this module
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <div className="py-4 text-center text-gray-500 text-sm">
                              No modules found for this topic
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">No topics found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizManagement;