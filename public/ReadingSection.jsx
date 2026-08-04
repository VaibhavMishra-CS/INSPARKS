import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, BookOpen } from 'lucide-react';

const ReadingSection = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Any');
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentView, setCurrentView] = useState('library'); // library, reading, practice, review
  const [userAnswers, setUserAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Literature', 'Science', 'History', 'Humanities'];
  const difficulties = ['Any', 'Easy', 'Medium', 'Hard'];

  // ========================================
  // FETCH DATA FROM JSON FILES
  // ========================================
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        const allBooks = [];
        const categoryNames = ['science', 'literature', 'history', 'humanities'];

        for (const category of categoryNames) {
          try {
            const response = await fetch(`/data/Reading/${category}.json`);
            
            if (!response.ok) {
              console.error(`Failed to load ${category}.json - Status: ${response.status}`);
              continue;
            }

            const data = await response.json();
            
            // Ensure data is an array
            if (Array.isArray(data)) {
              allBooks.push(...data);
              console.log(`✓ Loaded ${category}.json - ${data.length} items`);
            } else {
              console.error(`${category}.json is not an array:`, data);
            }
          } catch (error) {
            console.error(`Error loading ${category}.json:`, error);
          }
        }

        console.log(`✓ Total books loaded: ${allBooks.length}`);
        setBooks(allBooks);
      } catch (error) {
        console.error('Error loading reading data:', error);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // ========================================
  // FILTER BOOKS
  // ========================================
  const filteredBooks = books.filter(book => {
    const categoryMatch = selectedCategory === 'All' || book.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'Any' || book.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const dailyPicks = books.filter(b => b.difficulty === 'Easy').slice(0, 5);

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScore = (bookId) => {
    return scores[bookId] || null;
  };

  const handleStartPractice = (book) => {
    setSelectedBook(book);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setCurrentView('practice');
  };

  const handleSelectAnswer = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitAnswers = () => {
    if (!selectedBook) return;

    let correct = 0;
    selectedBook.questions.forEach(q => {
      if (userAnswers[q.id] === q.correct) {
        correct++;
      }
    });

    setScores(prev => ({
      ...prev,
      [selectedBook.id]: { correct, total: selectedBook.questions.length }
    }));

    setCurrentView('review');
  };

  const handleNextArticle = () => {
    const currentIndex = filteredBooks.findIndex(b => b.id === selectedBook.id);
    if (currentIndex < filteredBooks.length - 1) {
      setSelectedBook(filteredBooks[currentIndex + 1]);
      setUserAnswers({});
      setCurrentQuestionIndex(0);
      setCurrentView('reading');
    }
  };

  const handleBackToLibrary = () => {
    setSelectedBook(null);
    setUserAnswers({});
    setCurrentView('library');
    setCurrentQuestionIndex(0);
  };

  const isFullScreenLayout = selectedBook && (selectedBook.difficulty === 'Medium' || selectedBook.difficulty === 'Hard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Loading reading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* LEFT SIDEBAR - DASHBOARD */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">My Library</h1>
        </div>

        <div className="p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Today's Picks</h2>
          <div className="space-y-2">
            {dailyPicks.map(book => {
              const score = getScore(book.id);
              return (
                <button
                  key={book.id}
                  onClick={() => {
                    setSelectedBook(book);
                    setCurrentView('reading');
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-1">
                        {book.title_en}
                      </p>
                      <p className="text-xs text-gray-500">{book.category.slice(0, 3).toUpperCase()}</p>
                    </div>
                    {score && (
                      <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">
                        {score.correct}/{score.total}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories in Sidebar */}
        {categories.map(cat => {
          const catBooks = books.filter(b => cat === 'All' ? true : b.category === cat);
          return (
            <div key={cat} className="px-4 py-3 border-t border-gray-200">
              <h3 className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                {cat} {catBooks.length > 0 && <span className="text-gray-400">{catBooks.length}</span>}
              </h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {catBooks.slice(0, 8).map(book => {
                  const score = getScore(book.id);
                  return (
                    <button
                      key={book.id}
                      onClick={() => {
                        setSelectedBook(book);
                        setCurrentView('reading');
                      }}
                      className="w-full text-left px-2 py-2 text-xs rounded hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 truncate">{book.title_en}</span>
                        {score && (
                          <span className="ml-1 bg-red-100 text-red-800 text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0">
                            {score.correct}/{score.total}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* TOP BAR */}
        <div className="bg-white border-b border-gray-200 shadow-sm p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleBackToLibrary}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                ✕ Exit
              </button>
              <div className="flex gap-3">
                {['Easy', 'Medium', 'Hard'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-4 py-2 rounded-full transition-colors ${
                      selectedDifficulty === diff
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex gap-3 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto">
          {currentView === 'library' && (
            <LibraryView
              dailyPicks={dailyPicks}
              filteredBooks={filteredBooks}
              getDifficultyColor={getDifficultyColor}
              getScore={getScore}
              onSelectBook={(book) => {
                setSelectedBook(book);
                setCurrentView('reading');
              }}
            />
          )}

          {currentView === 'reading' && selectedBook && (
            <ReadingView
              book={selectedBook}
              score={getScore(selectedBook.id)}
              onStartPractice={() => handleStartPractice(selectedBook)}
              onNextArticle={handleNextArticle}
            />
          )}

          {currentView === 'practice' && selectedBook && (
            <PracticeView
              book={selectedBook}
              userAnswers={userAnswers}
              onSelectAnswer={handleSelectAnswer}
              onSubmit={handleSubmitAnswers}
              currentQuestionIndex={currentQuestionIndex}
              onQuestionChange={setCurrentQuestionIndex}
              isFullScreen={isFullScreenLayout}
            />
          )}

          {currentView === 'review' && selectedBook && (
            <ReviewView
              book={selectedBook}
              userAnswers={userAnswers}
              score={getScore(selectedBook.id)}
              onNextArticle={handleNextArticle}
              onBackToLibrary={handleBackToLibrary}
              isFullScreen={isFullScreenLayout}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// LIBRARY VIEW COMPONENT
const LibraryView = ({ dailyPicks, filteredBooks, getDifficultyColor, getScore, onSelectBook }) => {
  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Daily Practice Books */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Daily Practice Books</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">DAILY</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {dailyPicks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              getDifficultyColor={getDifficultyColor}
              getScore={getScore}
              onSelect={onSelectBook}
            />
          ))}
        </div>
      </section>

      {/* Full Library */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Library</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              getDifficultyColor={getDifficultyColor}
              getScore={getScore}
              onSelect={onSelectBook}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

// BOOK CARD COMPONENT
const BookCard = ({ book, getDifficultyColor, getScore, onSelect }) => {
  const score = getScore(book.id);
  return (
    <button
      onClick={() => onSelect(book)}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden text-left border border-gray-200 hover:border-blue-300"
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <span className={`text-xs font-bold px-2 py-1 rounded ${getDifficultyColor(book.difficulty)}`}>
            {book.category.slice(0, 3).toUpperCase()}
          </span>
          <span className={`text-xs font-semibold px-2 py-1 rounded ${getDifficultyColor(book.difficulty)}`}>
            {book.difficulty}
          </span>
        </div>
        <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">{book.title_en}</h3>
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            {book.readTime || '5'} min
          </div>
          {score && (
            <span className="bg-red-100 text-red-800 font-bold px-2 py-1 rounded">
              {score.correct}/{score.total}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// READING VIEW COMPONENT
const ReadingView = ({ book, score, onStartPractice, onNextArticle }) => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-bold bg-purple-100 text-purple-800 px-3 py-1 rounded">
            {book.category}
          </span>
          <span className="text-xs font-semibold text-gray-600">{book.difficulty}</span>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Clock size={14} />
            {book.readTime || '5'} min
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">{book.title_en}</h1>
      </div>

      {/* Passage */}
      <div className="prose prose-sm max-w-none mb-8">
        {Array.isArray(book.passage_en) ? (
          book.passage_en.map((paragraph, i) => (
            <p key={i} className="text-gray-700 leading-relaxed mb-4 text-base">
              {paragraph}
            </p>
          ))
        ) : (
          <p className="text-gray-700 leading-relaxed mb-4 text-base">{book.passage_en}</p>
        )}
      </div>

      {/* Score Display */}
      {score && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-center">
          <p className="text-sm text-gray-600 mb-2">YOUR SCORE</p>
          <p className="text-4xl font-bold text-blue-600">
            {score.correct}/{score.total}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-between">
        <button
          onClick={onNextArticle}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
        >
          Next Article →
        </button>
        <button
          onClick={onStartPractice}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
        >
          Start Practice
        </button>
      </div>
    </div>
  );
};

// PRACTICE VIEW COMPONENT
const PracticeView = ({ book, userAnswers, onSelectAnswer, onSubmit, currentQuestionIndex, onQuestionChange, isFullScreen }) => {
  if (!isFullScreen) {
    // SIDEBAR LAYOUT (Easy Science/Literature and History Easy)
    return (
      <div className="flex h-full">
        {/* Left - Passage */}
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-8 bg-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{book.title_en}</h2>
          <div className="prose prose-sm max-w-none">
            {Array.isArray(book.passage_en) ? (
              book.passage_en.map((paragraph, i) => (
                <p key={i} className="text-gray-700 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-gray-700 leading-relaxed mb-4">{book.passage_en}</p>
            )}
          </div>
        </div>

        {/* Right - Questions Sidebar */}
        <div className="w-1/2 overflow-y-auto p-8 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Practice Questions</h3>
          <div className="space-y-6">
            {book.questions.map((question, idx) => (
              <div key={question.id} className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="font-semibold text-gray-900 mb-4 text-sm">
                  {idx + 1}. {question.question_en}
                </p>
                <div className="space-y-2">
                  {question.options.map(option => (
                    <button
                      key={option.label}
                      onClick={() => onSelectAnswer(question.id, option.label)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                        userAnswers[question.id] === option.label
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-semibold text-gray-900">{option.label}</span>
                      <span className="text-gray-700"> {option.text_en}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <button
            onClick={onSubmit}
            className="w-full mt-8 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            Submit Answers
          </button>
        </div>
      </div>
    );
  } else {
    // FULL-SCREEN LAYOUT (History Medium and Hard)
    return (
      <div className="flex h-full">
        {/* Left - Fixed Passage */}
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-8 bg-white sticky top-0 h-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{book.title_en}</h2>
          <div className="prose prose-sm max-w-none">
            {Array.isArray(book.passage_en) ? (
              book.passage_en.map((paragraph, i) => (
                <p key={i} className="text-gray-700 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-gray-700 leading-relaxed mb-4">{book.passage_en}</p>
            )}
          </div>
        </div>

        {/* Right - Scrollable Questions Panel */}
        <div className="w-1/2 overflow-y-auto p-8 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Practice Questions ({book.questions.length})</h3>
          <div className="space-y-6">
            {book.questions.map((question, idx) => (
              <div key={question.id} className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="font-semibold text-gray-900 mb-4 text-sm">
                  {idx + 1}. {question.question_en}
                </p>
                <div className="space-y-2">
                  {question.options.map(option => (
                    <button
                      key={option.label}
                      onClick={() => onSelectAnswer(question.id, option.label)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                        userAnswers[question.id] === option.label
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-semibold text-gray-900">{option.label}</span>
                      <span className="text-gray-700"> {option.text_en}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <button
            onClick={onSubmit}
            className="w-full mt-8 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            Submit Answers
          </button>
        </div>
      </div>
    );
  }
};

// REVIEW VIEW COMPONENT
const ReviewView = ({ book, userAnswers, score, onNextArticle, onBackToLibrary, isFullScreen }) => {
  if (!isFullScreen) {
    // SIDEBAR LAYOUT
    return (
      <div className="flex h-full">
        {/* Left - Passage */}
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-8 bg-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{book.title_en}</h2>
          <div className="prose prose-sm max-w-none">
            {Array.isArray(book.passage_en) ? (
              book.passage_en.map((paragraph, i) => (
                <p key={i} className="text-gray-700 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-gray-700 leading-relaxed mb-4">{book.passage_en}</p>
            )}
          </div>

          {/* Score Display */}
          {score && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center sticky bottom-8">
              <p className="text-sm text-gray-600 mb-2">YOUR SCORE</p>
              <p className="text-4xl font-bold text-blue-600">
                {score.correct}/{score.total}
              </p>
            </div>
          )}
        </div>

        {/* Right - Review Panel */}
        <div className="w-1/2 overflow-y-auto p-8 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Review</h3>
          <div className="space-y-6">
            {book.questions.map((question, idx) => {
              const userAnswer = userAnswers[question.id];
              const isCorrect = userAnswer === question.correct;

              return (
                <div key={question.id} className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <p className="font-semibold text-gray-900 mb-4 text-sm">
                    {idx + 1}. {question.question_en}
                  </p>
                  <div className="space-y-2 mb-4">
                    {question.options.map(option => {
                      const isUserAnswer = userAnswer === option.label;
                      const isCorrectAnswer = option.label === question.correct;
                      let bgColor = 'bg-white border-gray-200';

                      if (isUserAnswer && isCorrect) bgColor = 'bg-green-50 border-green-500';
                      if (isUserAnswer && !isCorrect) bgColor = 'bg-red-50 border-red-500';
                      if (isCorrectAnswer && !isCorrect) bgColor = 'bg-green-50 border-green-500';

                      return (
                        <div
                          key={option.label}
                          className={`w-full text-left p-3 rounded-lg border-2 ${bgColor}`}
                        >
                          <span className="font-semibold text-gray-900">{option.label}</span>
                          <span className="text-gray-700"> {option.text_en}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-sm text-gray-600 italic">{question.explanation_en}</p>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={onBackToLibrary}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold text-sm"
            >
              All Articles
            </button>
            <button
              onClick={onNextArticle}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold text-sm"
            >
              Next Article →
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    // FULL-SCREEN LAYOUT
    return (
      <div className="flex h-full">
        {/* Left - Fixed Passage */}
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-8 bg-white sticky top-0 h-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{book.title_en}</h2>
          <div className="prose prose-sm max-w-none">
            {Array.isArray(book.passage_en) ? (
              book.passage_en.map((paragraph, i) => (
                <p key={i} className="text-gray-700 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-gray-700 leading-relaxed mb-4">{book.passage_en}</p>
            )}
          </div>

          {/* Score Display */}
          {score && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center sticky bottom-8">
              <p className="text-sm text-gray-600 mb-2">YOUR SCORE</p>
              <p className="text-4xl font-bold text-blue-600">
                {score.correct}/{score.total}
              </p>
            </div>
          )}
        </div>

        {/* Right - Scrollable Review Panel */}
        <div className="w-1/2 overflow-y-auto p-8 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Review ({book.questions.length})</h3>
          <div className="space-y-6">
            {book.questions.map((question, idx) => {
              const userAnswer = userAnswers[question.id];
              const isCorrect = userAnswer === question.correct;

              return (
                <div key={question.id} className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <p className="font-semibold text-gray-900 mb-4 text-sm">
                    {idx + 1}. {question.question_en}
                  </p>
                  <div className="space-y-2 mb-4">
                    {question.options.map(option => {
                      const isUserAnswer = userAnswer === option.label;
                      const isCorrectAnswer = option.label === question.correct;
                      let bgColor = 'bg-white border-gray-200';

                      if (isUserAnswer && isCorrect) bgColor = 'bg-green-50 border-green-500';
                      if (isUserAnswer && !isCorrect) bgColor = 'bg-red-50 border-red-500';
                      if (isCorrectAnswer && !isCorrect) bgColor = 'bg-green-50 border-green-500';

                      return (
                        <div
                          key={option.label}
                          className={`w-full text-left p-3 rounded-lg border-2 ${bgColor}`}
                        >
                          <span className="font-semibold text-gray-900">{option.label}</span>
                          <span className="text-gray-700"> {option.text_en}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-sm text-gray-600 italic">{question.explanation_en}</p>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={onBackToLibrary}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold text-sm"
            >
              All Articles
            </button>
            <button
              onClick={onNextArticle}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold text-sm"
            >
              Next Article →
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default ReadingSection;