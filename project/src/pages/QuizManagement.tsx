import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, BookOpen, ArrowLeft } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import api from '../utils/api';
import { toast } from 'react-toastify';

interface MainContent {
  id: number;
  title: string;
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
  const [mainContents, setMainContents] = useState<MainContent[]>([]);
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
    fetchMainContents();
  }, []);

  const fetchMainContents = async () => {
    try {
      const response = await api.get('/api/maincontents/');
      setMainContents(response.data);
    } catch (error) {
      toast.error('Failed to fetch main contents');
    } finally {
      setLoading(false);
    }
  };

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

  const handleBackToModules = () => {
    setSelectedMainContent(null);
    setQuizId(null);
    setQuestions([]);
    setShowAddForm(false);
    setEditingQuestion(null);
  };

// ✅ Add or Update Question
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (formData.question_text.length < 5) {
    toast.error("Question must be at least 5 characters");
    return;
  }

  if (formData.choices.some((choice) => !choice)) {
    toast.error("All choices must be filled");
    return;
  }

  if (!quizId) {
    toast.error("Please select a main content first");
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
      // ✅ UPDATE question
      await api.put(`/api/quizzes/${quizId}/update_question/`, {
        question_id: editingQuestion.id,
        ...payload,
      });
      toast.success("Question updated successfully");
    } else {
      // ✅ ADD question
      await api.post(`/api/quizzes/${quizId}/add_question/`, payload);
      toast.success("Question added successfully");
    }

    // Reset form
    setFormData({
      question_text: "",
      choices: ["", "", "", ""],
      correct_answer: "1",
    });
    setShowAddForm(false);
    setEditingQuestion(null);

    // Refresh questions
    if (selectedMainContent) {
      handleMainContentSelect(selectedMainContent);
    }
  } catch (error) {
    toast.error(editingQuestion ? "Failed to update question" : "Failed to add question");
  } finally {
    setSubmitting(false);
  }
};


  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      question_text: question.text,
      choices: question.choices.map(choice => choice.text),
      correct_answer: String(question.choices.findIndex(choice => choice.is_correct) + 1),
    });
    setShowAddForm(true);
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.delete(`/api/quizzes/${quizId}/delete_question/`, {
        data: { question_id: questionId }
      });
      toast.success('Question deleted successfully');
      if (selectedMainContent) {
        handleMainContentSelect(selectedMainContent);
      }
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingQuestion(null);
    setFormData({
      question_text: '',
      choices: ['', '', '', ''],
      correct_answer: '1',
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            {selectedMainContent && (
              <button
                onClick={handleBackToModules}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Modules
              </button>
            )}
            <h1 className="text-3xl font-bold text-gray-800">
              {selectedMainContent ? selectedMainContent.title : 'Quiz Management'}
            </h1>
          </div>
          {!selectedMainContent ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mainContents.map((content) => (
                <div
                  key={content.id}
                  onClick={() => handleMainContentSelect(content)}
                  className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-all duration-200 border-2 border-transparent hover:border-blue-500"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {content.title}
                      </h3>
                      <p className="text-sm text-gray-500">Click to manage quiz</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question
                      </label>
                      <textarea
                        value={formData.question_text}
                        onChange={(e) =>
                          setFormData({ ...formData, question_text: e.target.value })
                        }
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correct Answer
                      </label>
                      <select
                        value={formData.correct_answer}
                        onChange={(e) =>
                          setFormData({ ...formData, correct_answer: e.target.value })
                        }
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
                        {editingQuestion ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        {submitting ? 'Saving...' : editingQuestion ? 'Update Question' : 'Add Question'}
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
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Questions
                </h2>
                {questions.length > 0 ? (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition">
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
                              className={`p-3 rounded-lg ${
                                choice.is_correct
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizManagement;