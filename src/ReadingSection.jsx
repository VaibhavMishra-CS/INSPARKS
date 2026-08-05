import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, X, Clock, Languages, Check } from 'lucide-react';

// ============================================================
// CONSTANTS
// ============================================================
const CATEGORY_ORDER = ['Literature', 'Science', 'History', 'Humanities'];
const DIFFICULTIES = ['Any', 'Easy', 'Medium', 'Hard'];
const HIGHLIGHT_COLORS = ['#FFD966', '#93E6A0', '#F7A8C4']; // yellow, green, pink swatches (top bar)

// Only these two categories get translation buttons
const TRANSLATABLE_CATEGORIES = ['Science', 'Literature'];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function ReadingSection() {
  // ---- data ----
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // ---- top-level nav ----
  const [view, setView] = useState('library'); // 'library' | 'reading'
  const [libraryCategoryFilter, setLibraryCategoryFilter] = useState('All');
  const [libraryDifficultyFilter, setLibraryDifficultyFilter] = useState('Any');

  // ---- reading view state ----
  const [activeBookId, setActiveBookId] = useState(null);
  const [sidebarDifficultyFilter, setSidebarDifficultyFilter] = useState('Any');
  const [expandedCategories, setExpandedCategories] = useState({}); // { Literature: true, ... }
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ---- passage translation ----
  const [passageTranslated, setPassageTranslated] = useState(false);

  // ---- practice panel ----
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [practiceTranslated, setPracticeTranslated] = useState(false);
  const [userAnswers, setUserAnswers] = useState({}); // { [bookId]: { [questionId]: 'A' } }
  const [submittedBooks, setSubmittedBooks] = useState({}); // { [bookId]: true }

  // ---- persisted scores (per book, so the "1/5" badge in sidebar/library works) ----
  const [scores, setScores] = useState({}); // { [bookId]: { correct, total } }

  // ============================================================
  // LOAD DATA
  // ============================================================
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setLoadError(null);
      const allBooks = [];
      const categoryFiles = ['science', 'literature', 'history', 'humanities'];

      for (const category of categoryFiles) {
        try {
          const response = await fetch(`/data/Reading/${category}.json`);
          if (!response.ok) {
            console.error(`Failed to load ${category}.json - Status: ${response.status}`);
            continue;
          }
          const data = await response.json();
          if (Array.isArray(data)) {
            allBooks.push(...data);
          } else {
            console.error(`${category}.json is not an array`);
          }
        } catch (err) {
          console.error(`Error loading ${category}.json:`, err);
        }
      }

      if (allBooks.length === 0) {
        setLoadError('Could not load reading passages. Please refresh the page.');
      }

      setBooks(allBooks);
      setLoading(false);
    };

    loadAllData();
  }, []);

  // ============================================================
  // DERIVED DATA
  // ============================================================
  const booksByCategory = useMemo(() => {
    const map = {};
    for (const cat of CATEGORY_ORDER) map[cat] = [];
    for (const b of books) {
      if (map[b.category]) map[b.category].push(b);
    }
    // alphabetical within each category, matching crackd.it style
    for (const cat of CATEGORY_ORDER) {
      map[cat].sort((a, b) => a.title_en.localeCompare(b.title_en));
    }
    return map;
  }, [books]);

  const todaysPicks = useMemo(() => {
    // stable-ish daily selection: one from each category where possible, capped at 5
    const picks = [];
    for (const cat of CATEGORY_ORDER) {
      const list = booksByCategory[cat];
      if (list && list.length > 0) picks.push(list[0]);
      if (picks.length >= 5) break;
    }
    return picks.slice(0, 5);
  }, [booksByCategory]);

  const libraryFilteredBooks = useMemo(() => {
    return books.filter((b) => {
      const catOk = libraryCategoryFilter === 'All' || b.category === libraryCategoryFilter;
      const diffOk = libraryDifficultyFilter === 'Any' || b.difficulty === libraryDifficultyFilter;
      return catOk && diffOk;
    });
  }, [books, libraryCategoryFilter, libraryDifficultyFilter]);

  const activeBook = useMemo(() => books.find((b) => b.id === activeBookId) || null, [books, activeBookId]);

  const isTranslatable = activeBook && TRANSLATABLE_CATEGORIES.includes(activeBook.category);

  // ============================================================
  // HANDLERS
  // ============================================================
  const openBook = (book) => {
    setActiveBookId(book.id);
    setView('reading');
    setPracticeOpen(false);
    setPassageTranslated(false);
    setPracticeTranslated(false);
    // auto-expand the sidebar category this book belongs to
    setExpandedCategories((prev) => ({ ...prev, [book.category]: true }));
  };

  const exitReading = () => {
    setView('library');
    setActiveBookId(null);
    setPracticeOpen(false);
  };

  const toggleCategory = (cat) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleSelectAnswer = (bookId, questionId, label) => {
    // no-op once submitted for this book - answers lock after submit
    if (submittedBooks[bookId]) return;
    setUserAnswers((prev) => ({
      ...prev,
      [bookId]: { ...(prev[bookId] || {}), [questionId]: label },
    }));
  };

  const allQuestionsAnswered = (book) => {
    if (!book || !book.questions) return false;
    const answersForBook = userAnswers[book.id] || {};
    return book.questions.every((q) => answersForBook[q.id]);
  };

  const handleSubmit = (book) => {
    if (!allQuestionsAnswered(book)) return;
    const answersForBook = userAnswers[book.id] || {};
    let correct = 0;
    book.questions.forEach((q) => {
      if (answersForBook[q.id] === q.correct) correct += 1;
    });
    setScores((prev) => ({ ...prev, [book.id]: { correct, total: book.questions.length } }));
    setSubmittedBooks((prev) => ({ ...prev, [book.id]: true }));
  };

  const startPractice = () => {
    setPracticeOpen(true);
  };

  // ============================================================
  // RENDER: LOADING / ERROR
  // ============================================================
  if (loading) {
    return (
      <div style={styles.centeredScreen}>
        <div style={styles.loadingSpinner} />
        <p style={{ color: '#6B7280', marginTop: 16 }}>Loading reading passages…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={styles.centeredScreen}>
        <p style={{ color: '#DC2626', fontWeight: 600 }}>{loadError}</p>
      </div>
    );
  }

  // ============================================================
  // RENDER: LIBRARY VIEW
  // ============================================================
  if (view === 'library') {
    return (
      <div style={styles.page}>
        <LibraryHeader
          libraryCategoryFilter={libraryCategoryFilter}
          setLibraryCategoryFilter={setLibraryCategoryFilter}
          libraryDifficultyFilter={libraryDifficultyFilter}
          setLibraryDifficultyFilter={setLibraryDifficultyFilter}
        />

        <div style={styles.libraryBody}>
          <SectionLabel label="Today's Picks" badge="DAILY" />
          <TodaysPicksRow picks={todaysPicks} onOpen={openBook} scores={scores} />

          <div style={{ height: 32 }} />

          <SectionLabel label="Library" badge={`${libraryFilteredBooks.length}/${books.length}`} />
          <LibraryGrid books={libraryFilteredBooks} onOpen={openBook} scores={scores} />
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: READING VIEW
  // ============================================================
  return (
    <div style={styles.page}>
      <ReadingTopBar onExit={exitReading} title={activeBook ? activeBook.title_en : ''} />

      <div style={styles.readingBody}>
        {!sidebarCollapsed && (
          <Sidebar
            booksByCategory={booksByCategory}
            expandedCategories={expandedCategories}
            toggleCategory={toggleCategory}
            activeBookId={activeBookId}
            onSelectBook={openBook}
            difficultyFilter={sidebarDifficultyFilter}
            setDifficultyFilter={setSidebarDifficultyFilter}
            scores={scores}
            todaysPicks={todaysPicks}
          />
        )}

        <button
          onClick={() => setSidebarCollapsed((v) => !v)}
          style={{
            ...styles.sidebarToggle,
            left: sidebarCollapsed ? 8 : 316,
          }}
          aria-label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div style={styles.readingMain}>
          {activeBook && (
            <PassagePane
              book={activeBook}
              isTranslatable={isTranslatable}
              passageTranslated={passageTranslated}
              setPassageTranslated={setPassageTranslated}
              onStartPractice={startPractice}
              submitted={!!submittedBooks[activeBook.id]}
              userAnswers={userAnswers[activeBook.id] || {}}
              score={scores[activeBook.id]}
              onSelectAllArticles={exitReading}
              books={books}
              onOpenBook={openBook}
            />
          )}
        </div>

        {practiceOpen && activeBook && (
          <PracticePanel
            book={activeBook}
            isTranslatable={isTranslatable}
            practiceTranslated={practiceTranslated}
            setPracticeTranslated={setPracticeTranslated}
            userAnswers={userAnswers[activeBook.id] || {}}
            onSelectAnswer={(qId, label) => handleSelectAnswer(activeBook.id, qId, label)}
            onSubmit={() => handleSubmit(activeBook)}
            submitted={!!submittedBooks[activeBook.id]}
            canSubmit={allQuestionsAnswered(activeBook)}
            onClose={() => setPracticeOpen(false)}
            score={scores[activeBook.id]}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================
// SUBCOMPONENT: LibraryHeader
// ============================================================
function LibraryHeader({
  libraryCategoryFilter,
  setLibraryCategoryFilter,
  libraryDifficultyFilter,
  setLibraryDifficultyFilter,
}) {
  const cats = ['All', ...CATEGORY_ORDER];
  return (
    <div style={styles.libraryHeader}>
      <div style={styles.pillRow}>
        {cats.map((cat) => (
          <button
            key={cat}
            onClick={() => setLibraryCategoryFilter(cat)}
            style={libraryCategoryFilter === cat ? styles.pillActive : styles.pill}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={styles.pillRow}>
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            onClick={() => setLibraryDifficultyFilter(d)}
            style={libraryDifficultyFilter === d ? styles.pillActiveSmall : styles.pillSmall}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// SUBCOMPONENT: SectionLabel
// ============================================================
function SectionLabel({ label, badge }) {
  return (
    <div style={styles.sectionLabelRow}>
      <h2 style={styles.sectionLabelText}>{label}</h2>
      {badge && <span style={styles.sectionBadge}>{badge}</span>}
    </div>
  );
}

// ============================================================
// SUBCOMPONENT: TodaysPicksRow
// ============================================================
function TodaysPicksRow({ picks, onOpen, scores }) {
  if (picks.length === 0) return null;
  const [featured, ...rest] = picks;

  return (
    <div style={styles.todaysPicksGrid}>
      <FeaturedCard book={featured} onOpen={onOpen} />
      <div style={styles.todaysPicksSmallCol}>
        {rest.map((b) => (
          <SmallPickCard key={b.id} book={b} onOpen={onOpen} score={scores[b.id]} />
        ))}
      </div>
    </div>
  );
}

function FeaturedCard({ book, onOpen }) {
  const snippet = Array.isArray(book.passage_en) ? book.passage_en.join(' ') : book.passage_en;
  return (
    <div style={styles.featuredCard} onClick={() => onOpen(book)}>
      <div style={styles.tagRow}>
        <CategoryTag category={book.category} />
        <DifficultyTag difficulty={book.difficulty} />
      </div>
      <h3 style={styles.featuredTitle}>{book.title_en}</h3>
      <p style={styles.featuredSnippet}>{snippet.slice(0, 220)}…</p>
      <div style={styles.timeRow}>
        <Clock size={14} />
        <span>{book.readTime}</span>
      </div>
    </div>
  );
}

function SmallPickCard({ book, onOpen, score }) {
  return (
    <div style={styles.smallCard} onClick={() => onOpen(book)}>
      <div style={styles.tagRow}>
        <CategoryTag category={book.category} small />
        <DifficultyTag difficulty={book.difficulty} small />
      </div>
      <h4 style={styles.smallCardTitle}>{book.title_en}</h4>
      <div style={styles.smallCardFooter}>
        <div style={styles.timeRow}>
          <Clock size={12} />
          <span style={{ fontSize: 12 }}>{book.readTime}</span>
        </div>
        {score && <ScoreBadge score={score} />}
      </div>
    </div>
  );
}

// ============================================================
// SUBCOMPONENT: LibraryGrid
// ============================================================
function LibraryGrid({ books, onOpen, scores }) {
  return (
    <div style={styles.libraryGrid}>
      {books.map((b) => (
        <div key={b.id} style={styles.gridCard} onClick={() => onOpen(b)}>
          <div style={styles.tagRow}>
            <CategoryTag category={b.category} small />
            <DifficultyTag difficulty={b.difficulty} small />
          </div>
          <h4 style={styles.gridCardTitle}>{b.title_en}</h4>
          <div style={styles.smallCardFooter}>
            <div style={styles.timeRow}>
              <Clock size={12} />
              <span style={{ fontSize: 12 }}>{b.readTime}</span>
            </div>
            {scores[b.id] && <ScoreBadge score={scores[b.id]} />}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// SUBCOMPONENT: Tags & badges
// ============================================================
const CATEGORY_COLORS = {
  Literature: { bg: '#EDE9FE', text: '#6D28D9' },
  Science: { bg: '#DBEAFE', text: '#1D4ED8' },
  History: { bg: '#FEF3C7', text: '#B45309' },
  Humanities: { bg: '#D1FAE5', text: '#047857' },
};

function CategoryTag({ category, small }) {
  const c = CATEGORY_COLORS[category] || { bg: '#F3F4F6', text: '#374151' };
  return (
    <span
      style={{
        ...styles.tag,
        background: c.bg,
        color: c.text,
        fontSize: small ? 10 : 11,
        padding: small ? '2px 8px' : '4px 10px',
      }}
    >
      {category.toUpperCase()}
    </span>
  );
}

const DIFFICULTY_COLORS = {
  Easy: { bg: '#F3F4F6', text: '#059669' },
  Medium: { bg: '#F3F4F6', text: '#D97706' },
  Hard: { bg: '#F3F4F6', text: '#DC2626' },
};

function DifficultyTag({ difficulty, small }) {
  const c = DIFFICULTY_COLORS[difficulty] || { bg: '#F3F4F6', text: '#374151' };
  return (
    <span
      style={{
        ...styles.tag,
        background: c.bg,
        color: c.text,
        fontSize: small ? 10 : 11,
        padding: small ? '2px 8px' : '4px 10px',
      }}
    >
      {difficulty}
    </span>
  );
}

function ScoreBadge({ score }) {
  const passed = score.correct >= Math.ceil(score.total / 2);
  return (
    <span
      style={{
        ...styles.scoreBadge,
        background: passed ? '#D1FAE5' : '#FEE2E2',
        color: passed ? '#047857' : '#DC2626',
      }}
    >
      <Check size={11} style={{ marginRight: 2 }} />
      {score.correct}/{score.total}
    </span>
  );
}

// ============================================================
// SUBCOMPONENT: ReadingTopBar
// ============================================================
function ReadingTopBar({ onExit, title }) {
  return (
    <div style={styles.topBar}>
      <button style={styles.exitBtn} onClick={onExit}>
        <X size={16} style={{ marginRight: 6 }} />
        Exit
      </button>
      <div style={styles.divider} />
      <div style={styles.swatchRow}>
        {HIGHLIGHT_COLORS.map((c) => (
          <span key={c} style={{ ...styles.swatch, background: c }} />
        ))}
        <span style={styles.swatchClear}>
          <X size={12} />
        </span>
      </div>
      <div style={styles.topBarTitle}>{title}</div>
      <div style={{ width: 140 }} />
    </div>
  );
}

// ============================================================
// SUBCOMPONENT: Sidebar
// ============================================================
function Sidebar({
  booksByCategory,
  expandedCategories,
  toggleCategory,
  activeBookId,
  onSelectBook,
  difficultyFilter,
  setDifficultyFilter,
  scores,
  todaysPicks,
}) {
  return (
    <div style={styles.sidebar}>
      <div style={styles.sidebarDifficultyRow}>
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            onClick={() => setDifficultyFilter(d)}
            style={difficultyFilter === d ? styles.pillActiveSmall : styles.pillSmall}
          >
            {d}
          </button>
        ))}
      </div>

      <div style={styles.sidebarScroll}>
        {/* Today's Picks */}
        <SidebarCategoryHeader
          label="Today's Picks"
          count={todaysPicks.length}
          expanded={!!expandedCategories["Today's Picks"]}
          onToggle={() => toggleCategory("Today's Picks")}
        />
        {expandedCategories["Today's Picks"] &&
          todaysPicks
            .filter((b) => difficultyFilter === 'Any' || b.difficulty === difficultyFilter)
            .map((b) => (
              <SidebarBookRow
                key={b.id}
                book={b}
                active={b.id === activeBookId}
                onClick={() => onSelectBook(b)}
                score={scores[b.id]}
              />
            ))}

        {/* Category groups */}
        {CATEGORY_ORDER.map((cat) => {
          const list = (booksByCategory[cat] || []).filter(
            (b) => difficultyFilter === 'Any' || b.difficulty === difficultyFilter
          );
          return (
            <div key={cat}>
              <SidebarCategoryHeader
                label={cat}
                count={(booksByCategory[cat] || []).length}
                expanded={!!expandedCategories[cat]}
                onToggle={() => toggleCategory(cat)}
                colorText={CATEGORY_COLORS[cat]?.text}
              />
              {expandedCategories[cat] &&
                list.map((b) => (
                  <SidebarBookRow
                    key={b.id}
                    book={b}
                    active={b.id === activeBookId}
                    onClick={() => onSelectBook(b)}
                    score={scores[b.id]}
                  />
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SidebarCategoryHeader({ label, count, expanded, onToggle, colorText }) {
  return (
    <button style={styles.sidebarCategoryHeader} onClick={onToggle}>
      {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      <span style={{ ...styles.sidebarCategoryLabel, color: colorText || '#111827' }}>
        {label.toUpperCase()}
      </span>
      <span style={styles.sidebarCategoryCount}>{count}</span>
    </button>
  );
}

function SidebarBookRow({ book, active, onClick, score }) {
  const catAbbrev = {
    Literature: 'LIT',
    Science: 'SCI',
    History: 'HIS',
    Humanities: 'HUM',
  }[book.category];

  return (
    <button style={active ? styles.sidebarRowActive : styles.sidebarRow} onClick={onClick}>
      <span style={styles.sidebarRowTag}>{catAbbrev}</span>
      <span style={styles.sidebarRowTitle}>{book.title_en}</span>
      {score && (
        <span style={styles.sidebarRowScore}>
          {score.correct}/{score.total}
        </span>
      )}
    </button>
  );
}

// ============================================================
// SUBCOMPONENT: PassagePane
// ============================================================
function PassagePane({
  book,
  isTranslatable,
  passageTranslated,
  setPassageTranslated,
  onStartPractice,
  submitted,
  userAnswers,
  score,
  onSelectAllArticles,
  books,
  onOpenBook,
}) {
  const jpLines = Array.isArray(book.passage_jp) ? book.passage_jp : [book.passage_jp];
  const enLines = Array.isArray(book.passage_en) ? book.passage_en : [book.passage_en];

  const nextBook = useMemo(() => {
    const idx = books.findIndex((b) => b.id === book.id);
    if (idx === -1) return null;
    return books[(idx + 1) % books.length];
  }, [books, book.id]);

  return (
    <div style={styles.passageScroll}>
      <div style={styles.passageHeaderRow}>
        <div style={styles.tagRow}>
          <CategoryTag category={book.category} />
          <DifficultyTag difficulty={book.difficulty} />
          <span style={styles.readTimeInline}>
            <Clock size={13} style={{ marginRight: 4 }} />
            {book.readTime}
          </span>
        </div>
        {isTranslatable && (
          <button
            style={passageTranslated ? styles.translateBtnActive : styles.translateBtn}
            onClick={() => setPassageTranslated((v) => !v)}
          >
            <Languages size={14} style={{ marginRight: 6 }} />
            Translate to English
          </button>
        )}
      </div>

      <h1 style={styles.passageTitle}>{book.title_en}</h1>

      <div style={styles.passageBody}>
        {jpLines.map((jpLine, i) => (
          <div key={i} style={styles.passageLineBlock}>
            <p style={styles.passageJpLine}>{jpLine}</p>
            {isTranslatable && passageTranslated && (
              <p style={styles.passageEnLine}>{enLines[i]}</p>
            )}
          </div>
        ))}
      </div>

      {book.source && <p style={styles.sourceNote}>{book.source}</p>}

      {!submitted && (
        <div style={styles.practiceCallout}>
          <p style={styles.practiceCalloutText}>
            Finished reading? Test your comprehension with {book.questions.length} practice questions.
          </p>
          <button style={styles.startPracticeBtn} onClick={onStartPractice}>
            <Check size={16} style={{ marginRight: 8 }} />
            Start Practice
          </button>
        </div>
      )}

      {submitted && (
        <ExplanationsBlock book={book} userAnswers={userAnswers} score={score} />
      )}

      <div style={styles.passageFooterNav}>
        <button style={styles.footerNavBtn} onClick={onSelectAllArticles}>
          <ChevronLeft size={16} style={{ marginRight: 4 }} />
          All Articles
        </button>
        {nextBook && (
          <button style={styles.footerNavBtnPrimary} onClick={() => onOpenBook(nextBook)}>
            Next Article
            <ChevronRight size={16} style={{ marginLeft: 4 }} />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SUBCOMPONENT: ExplanationsBlock (shown below passage, post-submit)
// ============================================================
function ExplanationsBlock({ book, userAnswers, score }) {
  return (
    <div style={styles.explanationsWrap}>
      <div style={styles.scoreHeaderRow}>
        <span style={styles.scoreHeaderLabel}>YOUR SCORE</span>
        <span style={styles.scoreHeaderValue}>
          {score.correct}
          <span style={styles.scoreHeaderTotal}>/{score.total}</span>
        </span>
      </div>

      {book.questions.map((q, i) => {
        const userPicked = userAnswers[q.id];
        const wasCorrect = userPicked === q.correct;
        return (
          <div key={q.id} style={styles.explanationCard}>
            <div style={styles.explanationQHeader}>
              <span
                style={{
                  ...styles.explanationQNum,
                  background: wasCorrect ? '#D1FAE5' : '#FEE2E2',
                  color: wasCorrect ? '#047857' : '#DC2626',
                }}
              >
                {i + 1}
              </span>
              <p style={styles.explanationQText}>{q.question_jp}</p>
            </div>
            <p style={styles.explanationBody}>{q.explanation_jp}</p>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// SUBCOMPONENT: PracticePanel
// ============================================================
function PracticePanel({
  book,
  isTranslatable,
  practiceTranslated,
  setPracticeTranslated,
  userAnswers,
  onSelectAnswer,
  onSubmit,
  submitted,
  canSubmit,
  onClose,
  score,
}) {
  return (
    <div style={styles.practicePanel}>
      <div style={styles.practiceHeaderRow}>
        <div style={styles.practiceHeaderLeft}>
          <h3 style={styles.practiceTitle}>Practice</h3>
          {isTranslatable && !submitted && (
            <button
              style={practiceTranslated ? styles.translateBtnSmallActive : styles.translateBtnSmall}
              onClick={() => setPracticeTranslated((v) => !v)}
            >
              <Languages size={13} style={{ marginRight: 4 }} />
              Translate
            </button>
          )}
        </div>
        <button style={styles.practiceCloseBtn} onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <div style={styles.practiceScroll}>
        {book.questions.map((q, i) => (
          <QuestionBlock
            key={q.id}
            index={i}
            question={q}
            translated={isTranslatable && practiceTranslated}
            selected={userAnswers[q.id]}
            onSelect={(label) => onSelectAnswer(q.id, label)}
            submitted={submitted}
          />
        ))}
      </div>

      {!submitted && (
        <div style={styles.practiceFooter}>
          <button
            style={canSubmit ? styles.submitBtn : styles.submitBtnDisabled}
            disabled={!canSubmit}
            onClick={onSubmit}
          >
            {canSubmit ? 'Submit Answers' : `Answer all ${book.questions.length} questions`}
          </button>
        </div>
      )}

      {submitted && score && (
        <div style={styles.practiceFooterScore}>
          <span style={styles.practiceFooterScoreText}>
            You scored {score.correct}/{score.total}
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SUBCOMPONENT: QuestionBlock
// ============================================================
function QuestionBlock({ index, question, translated, selected, onSelect, submitted }) {
  const qText = translated ? question.question_en : question.question_jp;

  return (
    <div style={styles.questionBlock}>
      <p style={styles.questionText}>
        <span style={styles.questionNum}>{index + 1}.</span> {qText}
      </p>
      <div style={styles.optionsCol}>
        {question.options.map((opt) => {
          const optText = translated ? opt.text_en : opt.text_jp;
          const isSelected = selected === opt.label;
          const isCorrectOpt = opt.label === question.correct;

          let optionStyle = styles.optionRow;
          if (submitted) {
            if (isCorrectOpt) {
              optionStyle = styles.optionRowCorrect;
            } else if (isSelected && !isCorrectOpt) {
              optionStyle = styles.optionRowWrong;
            } else {
              optionStyle = styles.optionRowNeutralSubmitted;
            }
          } else if (isSelected) {
            optionStyle = styles.optionRowSelected;
          }

          return (
            <button
              key={opt.label}
              style={optionStyle}
              onClick={() => onSelect(opt.label)}
              disabled={submitted}
            >
              <span style={styles.optionLabel}>{opt.label}</span>
              <span style={styles.optionText}>{optText}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================
const styles = {
  page: {
    minHeight: '100vh',
    background: '#FAFAFA',
    fontFamily: "'Sora', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  centeredScreen: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    width: 36,
    height: 36,
    border: '3px solid #E5E7EB',
    borderTopColor: '#2563EB',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },

  // ---- library ----
  libraryHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: '24px 32px 8px',
    borderBottom: '1px solid #EEE',
    background: '#fff',
  },
  libraryBody: {
    padding: '24px 32px 64px',
    maxWidth: 1400,
    margin: '0 auto',
  },
  pillRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  pill: {
    padding: '8px 18px',
    borderRadius: 999,
    border: '1px solid #E5E7EB',
    background: '#fff',
    color: '#374151',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  },
  pillActive: {
    padding: '8px 18px',
    borderRadius: 999,
    border: '1px solid #2563EB',
    background: '#2563EB',
    color: '#fff',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  },
  pillSmall: {
    padding: '5px 12px',
    borderRadius: 999,
    border: '1px solid #E5E7EB',
    background: '#fff',
    color: '#6B7280',
    fontWeight: 600,
    fontSize: 12,
    cursor: 'pointer',
  },
  pillActiveSmall: {
    padding: '5px 12px',
    borderRadius: 999,
    border: '1px solid #2563EB',
    background: '#2563EB',
    color: '#fff',
    fontWeight: 600,
    fontSize: 12,
    cursor: 'pointer',
  },

  sectionLabelRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionLabelText: { fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 },
  sectionBadge: {
    fontSize: 11,
    fontWeight: 700,
    color: '#2563EB',
    background: '#DBEAFE',
    padding: '3px 10px',
    borderRadius: 999,
  },

  todaysPicksGrid: { display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 },
  todaysPicksSmallCol: { display: 'grid', gridTemplateRows: '1fr 1fr', gap: 16 },

  featuredCard: {
    background: '#fff',
    border: '1px solid #EEE',
    borderRadius: 16,
    padding: 24,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  featuredTitle: { fontSize: 24, fontWeight: 800, margin: '4px 0', color: '#111827' },
  featuredSnippet: { fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: 0 },

  smallCard: {
    background: '#fff',
    border: '1px solid #EEE',
    borderRadius: 14,
    padding: 16,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    justifyContent: 'space-between',
  },
  smallCardTitle: { fontSize: 15, fontWeight: 700, margin: 0, color: '#111827' },
  smallCardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },

  libraryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 14,
  },
  gridCard: {
    background: '#fff',
    border: '1px solid #EEE',
    borderRadius: 14,
    padding: 16,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  gridCardTitle: { fontSize: 14, fontWeight: 700, margin: 0, color: '#111827' },

  tagRow: { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  tag: { borderRadius: 999, fontWeight: 700, letterSpacing: 0.3 },
  timeRow: { display: 'flex', alignItems: 'center', gap: 4, color: '#9CA3AF', fontSize: 13 },
  scoreBadge: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: 999,
  },

  // ---- reading top bar ----
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '14px 24px',
    borderBottom: '1px solid #EEE',
    background: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  exitBtn: {
    display: 'flex',
    alignItems: 'center',
    background: '#2563EB',
    color: '#fff',
    border: 'none',
    borderRadius: 999,
    padding: '9px 18px',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
  },
  divider: { width: 1, height: 24, background: '#E5E7EB' },
  swatchRow: { display: 'flex', alignItems: 'center', gap: 8 },
  swatch: { width: 20, height: 20, borderRadius: 6, cursor: 'pointer', border: '1px solid rgba(0,0,0,0.06)' },
  swatchClear: {
    width: 20,
    height: 20,
    borderRadius: 6,
    background: '#F3F4F6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9CA3AF',
    cursor: 'pointer',
  },
  topBarTitle: { flex: 1, textAlign: 'center', fontWeight: 700, fontSize: 15, color: '#111827' },

  // ---- reading body layout ----
  readingBody: { display: 'flex', height: 'calc(100vh - 57px)', position: 'relative' },
  sidebar: {
    width: 300,
    borderRight: '1px solid #EEE',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  sidebarDifficultyRow: {
    display: 'flex',
    gap: 6,
    padding: '14px 16px',
    borderBottom: '1px solid #F3F4F6',
  },
  sidebarScroll: { flex: 1, overflowY: 'auto', padding: '8px 0' },
  sidebarCategoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  },
  sidebarCategoryLabel: { flex: 1, fontSize: 12, fontWeight: 800, letterSpacing: 0.4 },
  sidebarCategoryCount: { fontSize: 12, color: '#9CA3AF', fontWeight: 600 },
  sidebarRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '9px 16px 9px 38px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  },
  sidebarRowActive: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '9px 16px 9px 38px',
    background: '#EFF6FF',
    borderLeft: '3px solid #2563EB',
    border: 'none',
    borderLeftWidth: 3,
    borderLeftStyle: 'solid',
    borderLeftColor: '#2563EB',
    cursor: 'pointer',
    textAlign: 'left',
  },
  sidebarRowTag: { fontSize: 10, fontWeight: 800, color: '#9CA3AF', width: 28 },
  sidebarRowTitle: { flex: 1, fontSize: 13.5, color: '#374151', fontWeight: 500 },
  sidebarRowScore: {
    fontSize: 10,
    fontWeight: 700,
    color: '#fff',
    background: '#DC2626',
    borderRadius: 999,
    padding: '2px 7px',
  },
  sidebarToggle: {
    position: 'absolute',
    top: 16,
    zIndex: 20,
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: '1px solid #E5E7EB',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },

  readingMain: { flex: 1, overflowY: 'auto', minWidth: 0 },
  passageScroll: { maxWidth: 760, margin: '0 auto', padding: '40px 32px 100px' },
  passageHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  readTimeInline: { display: 'flex', alignItems: 'center', fontSize: 13, color: '#9CA3AF', marginLeft: 4 },
  translateBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    borderRadius: 999,
    border: '1px solid #E5E7EB',
    background: '#fff',
    color: '#374151',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
  },
  translateBtnActive: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    borderRadius: 999,
    border: '1px solid #2563EB',
    background: '#EFF6FF',
    color: '#2563EB',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
  },
  passageTitle: { fontSize: 32, fontWeight: 800, color: '#111827', margin: '0 0 28px' },
  passageBody: { display: 'flex', flexDirection: 'column', gap: 20 },
  passageLineBlock: { display: 'flex', flexDirection: 'column', gap: 4 },
  passageJpLine: { fontSize: 17, lineHeight: 1.9, color: '#1F2937', margin: 0 },
  passageEnLine: { fontSize: 14.5, lineHeight: 1.7, color: '#DC2626', margin: 0, fontStyle: 'italic' },
  sourceNote: { fontSize: 12.5, color: '#9CA3AF', fontStyle: 'italic', marginTop: 24 },

  practiceCallout: {
    marginTop: 40,
    padding: '28px 24px',
    background: '#F9FAFB',
    borderRadius: 16,
    textAlign: 'center',
  },
  practiceCalloutText: { fontSize: 14.5, color: '#6B7280', margin: '0 0 16px' },
  startPracticeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '13px 28px',
    borderRadius: 999,
    border: 'none',
    background: '#059669',
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
  },

  passageFooterNav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 48,
    paddingTop: 24,
    borderTop: '1px solid #F3F4F6',
  },
  footerNavBtn: {
    display: 'flex',
    alignItems: 'center',
    background: 'transparent',
    border: 'none',
    color: '#6B7280',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  },
  footerNavBtnPrimary: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    borderRadius: 999,
    border: 'none',
    background: '#2563EB',
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
  },

  // ---- explanations ----
  explanationsWrap: { marginTop: 40, paddingTop: 24, borderTop: '1px solid #F3F4F6' },
  scoreHeaderRow: { textAlign: 'center', marginBottom: 28 },
  scoreHeaderLabel: { display: 'block', fontSize: 12, fontWeight: 800, letterSpacing: 1, color: '#9CA3AF' },
  scoreHeaderValue: { fontSize: 40, fontWeight: 800, color: '#059669' },
  scoreHeaderTotal: { fontSize: 22, color: '#9CA3AF', fontWeight: 600 },
  explanationCard: {
    background: '#F9FAFB',
    borderRadius: 14,
    padding: '18px 20px',
    marginBottom: 12,
  },
  explanationQHeader: { display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 8 },
  explanationQNum: {
    flexShrink: 0,
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 800,
  },
  explanationQText: { fontSize: 14.5, fontWeight: 600, color: '#1F2937', margin: 0, lineHeight: 1.6 },
  explanationBody: { fontSize: 13.5, color: '#6B7280', margin: '0 0 0 36px', lineHeight: 1.7 },

  // ---- practice panel ----
  practicePanel: {
    width: 440,
    borderLeft: '1px solid #EEE',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  practiceHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 20px',
    borderBottom: '1px solid #F3F4F6',
  },
  practiceHeaderLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  practiceTitle: { fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 },
  practiceCloseBtn: {
    background: 'transparent',
    border: 'none',
    color: '#9CA3AF',
    cursor: 'pointer',
    padding: 4,
  },
  translateBtnSmall: {
    display: 'flex',
    alignItems: 'center',
    padding: '5px 12px',
    borderRadius: 999,
    border: '1px solid #E5E7EB',
    background: '#fff',
    color: '#374151',
    fontWeight: 600,
    fontSize: 12,
    cursor: 'pointer',
  },
  translateBtnSmallActive: {
    display: 'flex',
    alignItems: 'center',
    padding: '5px 12px',
    borderRadius: 999,
    border: '1px solid #2563EB',
    background: '#EFF6FF',
    color: '#2563EB',
    fontWeight: 700,
    fontSize: 12,
    cursor: 'pointer',
  },
  practiceScroll: { flex: 1, overflowY: 'auto', padding: '20px' },

  questionBlock: { marginBottom: 26 },
  questionText: { fontSize: 14.5, fontWeight: 600, color: '#1F2937', lineHeight: 1.6, margin: '0 0 12px' },
  questionNum: { color: '#2563EB', fontWeight: 800 },
  optionsCol: { display: 'flex', flexDirection: 'column', gap: 8 },

  optionRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '12px 14px',
    borderRadius: 10,
    border: '1.5px solid #E5E7EB',
    background: '#fff',
    cursor: 'pointer',
    textAlign: 'left',
  },
  optionRowSelected: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '12px 14px',
    borderRadius: 10,
    border: '1.5px solid #2563EB',
    background: '#EFF6FF',
    cursor: 'pointer',
    textAlign: 'left',
  },
  optionRowCorrect: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '12px 14px',
    borderRadius: 10,
    border: '1.5px solid #059669',
    background: '#ECFDF5',
    cursor: 'default',
    textAlign: 'left',
  },
  optionRowWrong: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '12px 14px',
    borderRadius: 10,
    border: '1.5px solid #DC2626',
    background: '#FEF2F2',
    cursor: 'default',
    textAlign: 'left',
  },
  optionRowNeutralSubmitted: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '12px 14px',
    borderRadius: 10,
    border: '1.5px solid #E5E7EB',
    background: '#fff',
    opacity: 0.6,
    cursor: 'default',
    textAlign: 'left',
  },
  optionLabel: {
    flexShrink: 0,
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: '#F3F4F6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 800,
    color: '#6B7280',
  },
  optionText: { fontSize: 13.5, color: '#374151', lineHeight: 1.55, paddingTop: 2 },

  practiceFooter: { padding: '16px 20px', borderTop: '1px solid #F3F4F6' },
  submitBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: 12,
    border: 'none',
    background: '#059669',
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
  },
  submitBtnDisabled: {
    width: '100%',
    padding: '14px',
    borderRadius: 12,
    border: 'none',
    background: '#E5E7EB',
    color: '#9CA3AF',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'not-allowed',
  },
  practiceFooterScore: {
    padding: '16px 20px',
    borderTop: '1px solid #F3F4F6',
    textAlign: 'center',
  },
  practiceFooterScoreText: { fontSize: 14, fontWeight: 700, color: '#059669' },
};