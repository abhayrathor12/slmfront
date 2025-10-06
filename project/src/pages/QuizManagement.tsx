import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import api from '../utils/api';
import { toast } from 'react-toastify';

interface MainContent {
  id: number;
  title: string;
}

interface Question {
  id: number;
  question_text: string;
  choice1: string;
  choice2: string;
  choice3: string;
  choice4: string;
  correct_answer: string;
}

const QuizManagement = () => {
  const [mainContents, setMainContents] = useState<MainContent[]>([]);
  const [selectedMainContent, setSelectedMainContent] = useState('');
  const [quizId, setQuizId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    question_text: '',
    choice1: '',
    choice2: '',
    choice3: '',
    choice4: '',
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

  const handleMainContentChange = async (mainContentId: string) => {
    setSelectedMainContent(mainContentId);

    if (!mainContentId) {
      setQuizId(null);
      setQuestions([]);
      return;
    }

    try {
      const response = await api.get(`/api/quizzes/?main_content=${mainContentId}`);

      if (response.data.length > 0) {
        const quiz = response.data[0];
        setQuizId(quiz.id);
        setQuestions(quiz.questions || []);
      } else {
        const createResponse = await api.post('/api/quizzes/', {
          main_content: mainContentId,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.question_text.length < 5) {
      toast.error('Question must be at least 5 characters');
      return;
    }

    if (!formData.choice1 || !formData.choice2 || !formData.choice3 || !formData.choice4) {
      toast.error('All choices must be filled');
      return;
    }

    if (!quizId) {
      toast.error('Please select a main content first');
      return;
    }

    setSubmitting(true);

    try {
      await api.post(`/api/quizzes/${quizId}/add_question/`, formData);
      toast.success('Question added successfully');
      setFormData({
        question_text: '',
        choice1: '',
        choice2: '',
        choice3: '',
        choice4: '',
        correct_answer: '1',
      });
      handleMainContentChange(selectedMainContent);
    } catch (error) {
      toast.error('Failed to add question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await api.delete(`/api/questions/${questionId}/`);
      toast.success('Question deleted successfully');
      handleMainContentChange(selectedMainContent);
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Quiz Management</h1>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Main Content
          </label>
          <select
            value={selectedMainContent}
            onChange={(e) => handleMainContentChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Select a main content</option>
            {mainContents.map((content) => (
              <option key={content.id} value={content.id}>
                {content.title}
              </option>
            ))}
          </select>
        </div>

        {quizId && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Question</h2>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choice 1
                    </label>
                    <input
                      type="text"
                      value={formData.choice1}
                      onChange={(e) => setFormData({ ...formData, choice1: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Enter choice 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choice 2
                    </label>
                    <input
                      type="text"
                      value={formData.choice2}
                      onChange={(e) => setFormData({ ...formData, choice2: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Enter choice 2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choice 3
                    </label>
                    <input
                      type="text"
                      value={formData.choice3}
                      onChange={(e) => setFormData({ ...formData, choice3: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Enter choice 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choice 4
                    </label>
                    <input
                      type="text"
                      value={formData.choice4}
                      onChange={(e) => setFormData({ ...formData, choice4: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Enter choice 4"
                    />
                  </div>
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

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                  {submitting ? 'Adding...' : 'Add Question'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Questions ({questions.length})
              </h2>
              {questions.length > 0 ? (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-800">
                          Q{index + 1}: {question.question_text}
                        </h3>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div
                          className={`p-2 rounded ${
                            question.correct_answer === '1'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-50'
                          }`}
                        >
                          1. {question.choice1}
                        </div>
                        <div
                          className={`p-2 rounded ${
                            question.correct_answer === '2'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-50'
                          }`}
                        >
                          2. {question.choice2}
                        </div>
                        <div
                          className={`p-2 rounded ${
                            question.correct_answer === '3'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-50'
                          }`}
                        >
                          3. {question.choice3}
                        </div>
                        <div
                          className={`p-2 rounded ${
                            question.correct_answer === '4'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-50'
                          }`}
                        >
                          4. {question.choice4}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No questions added yet</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizManagement;