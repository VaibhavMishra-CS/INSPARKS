import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, X, Clock, Check } from 'lucide-react';

// ============================================================
// CONSTANTS
// ============================================================
const CATEGORY_ORDER = ['Literature', 'Science', 'History', 'Humanities'];
const DIFFICULTIES = ['Any', 'Easy', 'Medium', 'Hard'];
const HIGHLIGHT_COLORS = ['#F5B942', '#3FBF7F', '#E2685E']; // orange, green, red swatches (top bar)

const TRANSLATABLE_CATEGORIES = ['Science', 'Literature'];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function ReadingSection() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [view, setView] = useState('library'); // 'library' | 'reading'
  const [libraryCategoryFilter, setLibraryCategoryFilter] = useState('All');
  const [libraryDifficultyFilter, setLibraryDifficultyFilter] = useState('Any');

  const [activeBookId, setActiveBookId] = useState(null);
  const [sidebarDifficultyFilter, setSidebarDifficultyFilter] = useState('Any');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [passageTranslated, setPassageTranslated] = useState(false);

  const [practiceOpen, setPracticeOpen] = useState(false);
  const [practiceTranslated, setPracticeTranslated] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [submittedBooks, setSubmittedBooks] = useState({});

  const [scores, setScores] = useState({});

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
    for (const cat of CATEGORY_ORDER) {
      map[cat].sort((a, b) => a.title_en.localeCompare(b.title_en));
    }
    return map;
  }, [books]);

  const todaysPicks = useMemo(() => {
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

  const startPractice = () => setPracticeOpen(true);

  // ============================================================
  // RENDER: LOADING / ERROR
  // ============================================================
  if (loading) {
    return (
      <div style={styles.centeredScreen}>
        <div style={styles.loadingSpinner} />
        <p style={{ color: 'var(--text-secondary)', marginTop: 16 }}>Loading reading passages…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={styles.centeredScreen}>
        <p style={{ color: 'var(--accent-red)', fontWeight: 600 }}>{loadError}</p>
      </div>
    );
  }

  // ============================================================
  // RENDER: LIBRARY VIEW (Crackd.it style — photo 1)
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
  // RENDER: READING VIEW (sidebar + passage — photo 3)
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
          style={{ ...styles.sidebarToggle, left: sidebarCollapsed ? 8 : 316 }}
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
// LibraryHeader
// ============================================================
function LibraryHeader({ libraryCategoryFilter, setLibraryCategoryFilter, libraryDifficultyFilter, setLibraryDifficultyFilter }) {
  const cats = ['All', ...CATEGORY_ORDER];
  return (
    <div style={styles.libraryHeader}>
      <div style={styles.pillRow}>
        {cats.map((cat) => (
          <button key={cat} onClick={() => setLibraryCategoryFilter(cat)} style={libraryCategoryFilter === cat ? styles.pillActive : styles.pill}>
            {cat}
          </button>
        ))}
      </div>
      <div style={styles.pillRow}>
        {DIFFICULTIES.map((d) => (
          <button key={d} onClick={() => setLibraryDifficultyFilter(d)} style={libraryDifficultyFilter === d ? styles.pillActiveSmall : styles.pillSmall}>
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionLabel({ label, badge }) {
  return (
    <div style={styles.sectionLabelRow}>
      <h2 style={styles.sectionLabelText}>{label}</h2>
      {badge && <span style={styles.sectionBadge}>{badge}</span>}
    </div>
  );
}

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
// Tags & badges — colors adapted to navy/white theme
// ============================================================
const CATEGORY_COLORS = {
  Literature: { bg: '#EDE9FE', text: '#6D28D9' },
  Science:    { bg: '#DBEAFE', text: '#1D4ED8' },
  History:    { bg: '#FEF3C7', text: '#B45309' },
  Humanities: { bg: '#D1FAE5', text: '#047857' },
};

function CategoryTag({ category, small }) {
  const c = CATEGORY_COLORS[category] || { bg: '#F3F4F6', text: '#374151' };
  return (
    <span style={{ ...styles.tag, background: c.bg, color: c.text, fontSize: small ? 10 : 11, padding: small ? '2px 8px' : '4px 10px' }}>
      {category.toUpperCase()}
    </span>
  );
}

const DIFFICULTY_COLORS = {
  Easy:   { bg: '#F3F4F6', text: '#059669' },
  Medium: { bg: '#F3F4F6', text: '#D97706' },
  Hard:   { bg: '#F3F4F6', text: '#DC2626' },
};

function DifficultyTag({ difficulty, small }) {
  const c = DIFFICULTY_COLORS[difficulty] || { bg: '#F3F4F6', text: '#374151' };
  return (
    <span style={{ ...styles.tag, background: c.bg, color: c.text, fontSize: small ? 10 : 11, padding: small ? '2px 8px' : '4px 10px' }}>
      {difficulty}
    </span>
  );
}

function ScoreBadge({ score }) {
  const passed = score.correct >= Math.ceil(score.total / 2);
  return (
    <span style={{ ...styles.scoreBadge, background: passed ? '#D1FAE5' : '#FEE2E2', color: passed ? '#047857' : '#DC2626' }}>
      <Check size={11} style={{ marginRight: 2 }} />
      {score.correct}/{score.total}
    </span>
  );
}

// ============================================================
// ReadingTopBar — matches photo 3 (Exit + highlight swatches + title)
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
// Sidebar — book list (matches photo 3 left panel)
// ============================================================
function Sidebar({ booksByCategory, expandedCategories, toggleCategory, activeBookId, onSelectBook, difficultyFilter, setDifficultyFilter, scores, todaysPicks }) {
  return (
    <div style={styles.sidebar}>
      <div style={styles.sidebarDifficultyRow}>
        {DIFFICULTIES.map((d) => (
          <button key={d} onClick={() => setDifficultyFilter(d)} style={difficultyFilter === d ? styles.pillActiveSmall : styles.pillSmall}>
            {d}
          </button>
        ))}
      </div>

      <div style={styles.sidebarScroll}>
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
              <SidebarBookRow key={b.id} book={b} active={b.id === activeBookId} onClick={() => onSelectBook(b)} score={scores[b.id]} />
            ))}

        {CATEGORY_ORDER.map((cat) => {
          const list = (booksByCategory[cat] || []).filter((b) => difficultyFilter === 'Any' || b.difficulty === difficultyFilter);
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
                  <SidebarBookRow key={b.id} book={b} active={b.id === activeBookId} onClick={() => onSelectBook(b)} score={scores[b.id]} />
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
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        <span style={{ color: colorText || 'var(--text-primary)', fontWeight: 700, fontSize: 12.5, textTransform: 'uppercase' }}>{label}</span>
      </span>
      <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>{count}</span>
    </button>
  );
}

function SidebarBookRow({ book, active, onClick, score }) {
  return (
    <button onClick={onClick} style={{ ...styles.sidebarBookRow, ...(active ? styles.sidebarBookRowActive : {}) }}>
      <span style={styles.sidebarBookTag}>{book.category.slice(0, 3).toUpperCase()}</span>
      <span style={styles.sidebarBookTitle}>{book.title_en}</span>
      {score && <Check size={12} color="#047857" />}
    </button>
  );
}

// ============================================================
// PassagePane — main reading content
// ============================================================
function PassagePane({ book, isTranslatable, passageTranslated, setPassageTranslated, onStartPractice, submitted, score }) {
  const passage = passageTranslated && book.passage_jp ? book.passage_jp : book.passage_en;
  return (
    <div style={styles.passageWrap}>
      <div style={styles.passageMeta}>
        <CategoryTag category={book.category} />
        <DifficultyTag difficulty={book.difficulty} />
        <span style={styles.passageTime}><Clock size={13} style={{ marginRight: 4 }} />{book.readTime}</span>
        {isTranslatable && (
          <button style={styles.translateBtn} onClick={() => setPassageTranslated((v) => !v)}>
            {passageTranslated ? 'English' : '日本語'}
          </button>
        )}
      </div>

      <h1 style={styles.passageTitle}>{book.title_en}</h1>

      <div style={styles.passageBody}>
        {(Array.isArray(passage) ? passage : [passage]).map((line, i) => (
          <p key={i} style={styles.passageLine}>{line}</p>
        ))}
      </div>

      <div style={styles.passageFooter}>
        {submitted && score ? (
          <ScoreBadge score={score} />
        ) : (
          <button style={styles.practiceBtn} onClick={onStartPractice}>Practice Questions</button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// PracticePanel — MCQ side panel
// ============================================================
function PracticePanel({ book, isTranslatable, practiceTranslated, setPracticeTranslated, userAnswers, onSelectAnswer, onSubmit, submitted, canSubmit, onClose, score }) {
  return (
    <div style={styles.practicePanel}>
      <div style={styles.practiceHeader}>
        <h3 style={{ margin: 0, fontSize: 15 }}>Practice</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isTranslatable && (
            <button style={styles.translateBtnSmall} onClick={() => setPracticeTranslated((v) => !v)}>
              {practiceTranslated ? 'EN' : 'JP'}
            </button>
          )}
          <button style={styles.practiceCloseBtn} onClick={onClose}><X size={16} /></button>
        </div>
      </div>

      <div style={styles.practiceQuestions}>
        {book.questions.map((q, idx) => {
          const questionText = practiceTranslated ? q.question_jp : q.question_en;
          const selected = userAnswers[q.id];
          return (
            <div key={q.id} style={styles.questionBlock}>
              <div style={styles.questionText}>{idx + 1}. {questionText}</div>
              {q.options.map((opt) => {
                const isSelected = selected === opt.label;
                const isCorrect = submitted && opt.label === q.correct;
                const isWrongSelected = submitted && isSelected && opt.label !== q.correct;
                return (
                  <button
                    key={opt.label}
                    onClick={() => onSelectAnswer(q.id, opt.label)}
                    style={{
                      ...styles.optionBtn,
                      ...(isSelected && !submitted ? styles.optionSelected : {}),
                      ...(isCorrect ? styles.optionCorrect : {}),
                      ...(isWrongSelected ? styles.optionWrong : {}),
                    }}
                  >
                    <span style={styles.optionLabel}>{opt.label}</span>
                    {practiceTranslated ? opt.text_jp : opt.text_en}
                  </button>
                );
              })}
              {submitted && (
                <div style={styles.explanation}>
                  {practiceTranslated ? q.explanation_jp : q.explanation_en}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={styles.practiceFooter}>
        {submitted ? (
          score && <div style={styles.finalScore}>Score: {score.correct}/{score.total}</div>
        ) : (
          <button style={{ ...styles.submitBtn, opacity: canSubmit ? 1 : 0.5 }} disabled={!canSubmit} onClick={onSubmit}>
            Submit
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// STYLES — using CSS variables from theme.css for full theme support
// ============================================================
const styles = {
  page: { minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Inter', sans-serif" },
  centeredScreen: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' },
  loadingSpinner: { width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },

  // Library header
  libraryHeader: { padding: '24px 32px 0', display: 'flex', flexDirection: 'column', gap: 12 },
  pillRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  pill: { padding: '8px 18px', borderRadius: 999, border: '1px solid var(--border-bright)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' },
  pillActive: { padding: '8px 18px', borderRadius: 999, border: '1px solid var(--accent-navy)', background: 'var(--accent-navy)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' },
  pillSmall: { padding: '6px 14px', borderRadius: 999, border: '1px solid var(--border-bright)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' },
  pillActiveSmall: { padding: '6px 14px', borderRadius: 999, border: '1px solid var(--accent-navy)', background: 'var(--accent-navy)', color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' },

  libraryBody: { padding: '24px 32px 48px' },
  sectionLabelRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionLabelText: { margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' },
  sectionBadge: { fontSize: 11, fontWeight: 700, color: '#fff', background: 'var(--accent-navy)', padding: '3px 9px', borderRadius: 999 },

  todaysPicksGrid: { display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 },
  featuredCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 22, cursor: 'pointer', boxShadow: 'var(--card-shadow)' },
  featuredTitle: { fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '10px 0 8px' },
  featuredSnippet: { fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 },
  todaysPicksSmallCol: { display: 'flex', flexDirection: 'column', gap: 10 },
  smallCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, cursor: 'pointer' },
  smallCardTitle: { fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)', margin: '8px 0 8px' },
  smallCardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },

  libraryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 },
  gridCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, cursor: 'pointer' },
  gridCardTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '10px 0 10px' },

  tagRow: { display: 'flex', gap: 6 },
  tag: { borderRadius: 6, fontWeight: 700, letterSpacing: '0.03em' },
  timeRow: { display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-tertiary)', fontSize: 12.5 },
  scoreBadge: { display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999 },

  // Reading detail view
  topBar: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' },
  exitBtn: { display: 'flex', alignItems: 'center', padding: '9px 16px', borderRadius: 8, border: 'none', background: 'var(--accent-navy)', color: '#fff', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' },
  divider: { width: 1, height: 22, background: 'var(--border)' },
  swatchRow: { display: 'flex', alignItems: 'center', gap: 8 },
  swatch: { width: 20, height: 20, borderRadius: 5, cursor: 'pointer', border: '1px solid var(--border)' },
  swatchClear: { width: 20, height: 20, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', color: 'var(--text-tertiary)', cursor: 'pointer' },
  topBarTitle: { flex: 1, textAlign: 'center', fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 },

  readingBody: { display: 'flex', position: 'relative', minHeight: 'calc(100vh - 58px)' },
  sidebar: { width: 300, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-elevated)' },
  sidebarDifficultyRow: { display: 'flex', gap: 6, padding: 16, borderBottom: '1px solid var(--border)' },
  sidebarScroll: { flex: 1, overflowY: 'auto', padding: '8px 0' },
  sidebarCategoryHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer' },
  sidebarBookRow: { display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 16px 9px 30px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13 },
  sidebarBookRowActive: { background: 'var(--accent-navy-bg)', borderLeft: '3px solid var(--accent-navy)' },
  sidebarBookTag: { fontSize: 9.5, fontWeight: 700, color: 'var(--text-tertiary)', width: 26, flexShrink: 0 },
  sidebarBookTitle: { color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },

  sidebarToggle: { position: 'absolute', top: 16, zIndex: 10, width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' },

  readingMain: { flex: 1, overflowY: 'auto', padding: '36px 48px' },
  passageWrap: { maxWidth: 720, margin: '0 auto' },
  passageMeta: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 },
  passageTime: { display: 'flex', alignItems: 'center', fontSize: 12.5, color: 'var(--text-tertiary)' },
  translateBtn: { marginLeft: 'auto', padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-bright)', background: 'var(--bg-card-hover)', color: 'var(--text-primary)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' },
  translateBtnSmall: { padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border-bright)', background: 'var(--bg-card-hover)', color: 'var(--text-primary)', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' },
  passageTitle: { fontSize: 30, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20 },
  passageBody: { fontSize: 16.5, lineHeight: 1.8, color: 'var(--text-primary)' },
  passageLine: { marginBottom: 18 },
  passageFooter: { marginTop: 30, paddingTop: 20, borderTop: '1px solid var(--border)' },
  practiceBtn: { padding: '12px 26px', borderRadius: 8, border: 'none', background: 'var(--accent-navy)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' },

  // Practice panel
  practicePanel: { width: 380, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-elevated)' },
  practiceHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottom: '1px solid var(--border)' },
  practiceCloseBtn: { background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex' },
  practiceQuestions: { flex: 1, overflowY: 'auto', padding: 16 },
  questionBlock: { marginBottom: 24 },
  questionText: { fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 },
  optionBtn: { display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '10px 12px', marginBottom: 6, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 12.5, cursor: 'pointer' },
  optionSelected: { borderColor: 'var(--accent-navy)', background: 'var(--accent-navy-bg)' },
  optionCorrect: { borderColor: 'var(--accent-green)', background: 'rgba(30,158,99,0.1)' },
  optionWrong: { borderColor: 'var(--accent-red)', background: 'rgba(214,69,69,0.1)' },
  optionLabel: { fontWeight: 700, width: 16, flexShrink: 0 },
  explanation: { fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, padding: 10, background: 'var(--bg-card-hover)', borderRadius: 8 },
  practiceFooter: { padding: 16, borderTop: '1px solid var(--border)' },
  submitBtn: { width: '100%', padding: 12, borderRadius: 8, border: 'none', background: 'var(--accent-navy)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  finalScore: { textAlign: 'center', fontWeight: 700, color: 'var(--text-primary)' },
};