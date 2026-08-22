import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { videoData } from './src/videoData.js';
import { ICONS, getComprehensionFace, mountSidebar } from './src/icons.js';
import { requireAuth, signOutUser, auth } from './src/auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';
import {
  getWatched, setWatched,
  getHiddenVideos, setHiddenVideos,
  getHiddenChannels, setHiddenChannels,
  getAlbum, setAlbum,
} from './src/localStorageState.js';
import {
  CATEGORY_TABS, CATEGORY_TAXONOMY,
  LEVEL_OPTIONS, PROGRESS_OPTIONS, SUBTITLE_OPTIONS, DURATION_OPTIONS,
} from './src/categoryTaxonomy.js';

const db = getFirestore();

export default function Dashboard() {
  // ---- auth / user ----
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState({ level: 1, points: 1000, grammarPoints: 0, streakDays: 0, cardCount: 0 });

  // ---- view state ----
  const [view, setView] = useState('rails'); // 'rails' | 'seeAll' | 'hidden'
  const [activeCategory, setActiveCategory] = useState('all');
  const [seeAllCategoryKey, setSeeAllCategoryKey] = useState(null);

  // ---- popovers / modals ----
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [streakPopoverOpen, setStreakPopoverOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [openCardMenuId, setOpenCardMenuId] = useState(null);

  // ---- hidden view sub-tab ----
  const [hiddenTab, setHiddenTab] = useState('videos'); // 'channels' | 'videos'

  // ---- filters (UI state; sub-tags are inert until Gemini classification exists) ----
  const [filters, setFilters] = useState({
    level: 'All',
    progress: 'All',
    subtitles: 'All',
    duration: 'Any',
    categories: [], // selected top-level category keys from the modal
  });

  // ---- localStorage-backed sets ----
  const [watched, setWatchedState] = useState(() => getWatched());
  const [hiddenVideos, setHiddenVideosState] = useState(() => getHiddenVideos());
  const [hiddenChannels, setHiddenChannelsState] = useState(() => getHiddenChannels());
  const [album, setAlbumState] = useState(() => getAlbum());

  // ============================================================
  // AUTH BOOTSTRAP
  // ============================================================
  useEffect(() => {
    mountSidebar('home');
    requireAuth('index.html').then(async (u) => {
      setUser(u);
      try {
        const snap = await getDoc(doc(db, 'users', u.uid));
        const data = snap.exists() ? snap.data() : {};
        setUserStats({
          level: data.lastLevelNum ?? 1,
          points: data.knownVocab ?? 1000,
          grammarPoints: data.knownGrammar ?? 0,
          streakDays: data.streak ?? 0,
          cardCount: data.dailyGoalProgress ?? 0,
        });
      } catch (err) {
        console.error('Failed to load user stats:', err);
      }
    }).catch(() => { window.location.href = 'index.html'; });
  }, []);

  // ============================================================
  // ACTIONS — watched / hidden / album (persist to localStorage)
  // ============================================================
  const toggleWatched = useCallback((id) => {
    setWatchedState(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      setWatched(next);
      return next;
    });
  }, []);

  const hideVideo = useCallback((id) => {
    setHiddenVideosState(prev => {
      const next = new Set(prev);
      next.add(id);
      setHiddenVideos(next);
      return next;
    });
  }, []);

  const hideChannel = useCallback((channel) => {
    setHiddenChannelsState(prev => {
      const next = new Set(prev);
      next.add(channel);
      setHiddenChannels(next);
      return next;
    });
  }, []);

  const unhideVideo = useCallback((id) => {
    setHiddenVideosState(prev => {
      const next = new Set(prev);
      next.delete(id);
      setHiddenVideos(next);
      return next;
    });
  }, []);

  const unhideChannel = useCallback((channel) => {
    setHiddenChannelsState(prev => {
      const next = new Set(prev);
      next.delete(channel);
      setHiddenChannels(next);
      return next;
    });
  }, []);

  const addToAlbum = useCallback((id) => {
    setAlbumState(prev => {
      const next = new Set(prev);
      next.add(id);
      setAlbum(next);
      return next;
    });
  }, []);

  // ============================================================
  // DERIVED DATA
  // ============================================================
  const visibleVideos = useMemo(() => {
    return videoData.filter(v => !hiddenVideos.has(v.id) && !hiddenChannels.has(v.channel));
  }, [hiddenVideos, hiddenChannels]);

  const videosByCategory = useMemo(() => {
    const map = {};
    CATEGORY_TABS.forEach(c => { if (c.key !== 'all') map[c.key] = []; });
    visibleVideos.forEach(v => {
      if (map[v.category]) map[v.category].push(v);
    });
    return map;
  }, [visibleVideos]);

  const categoryLabel = (key) => CATEGORY_TABS.find(c => c.key === key)?.label || key;

  const seeAllVideos = useMemo(() => {
    if (!seeAllCategoryKey) return [];
    return videosByCategory[seeAllCategoryKey] || [];
  }, [seeAllCategoryKey, videosByCategory]);

  const hiddenVideoList = useMemo(
    () => videoData.filter(v => hiddenVideos.has(v.id)),
    [hiddenVideos]
  );
  const hiddenChannelList = useMemo(() => [...hiddenChannels], [hiddenChannels]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const openSeeAll = (categoryKey) => {
    setSeeAllCategoryKey(categoryKey);
    setView('seeAll');
  };
  const backToRails = () => {
    setView('rails');
    setSeeAllCategoryKey(null);
  };
  const openHidden = () => setView('hidden');
  const closeHidden = () => setView('rails');

  const toggleFilterCategory = (key) => {
    setFilters(prev => {
      const has = prev.categories.includes(key);
      return { ...prev, categories: has ? prev.categories.filter(c => c !== key) : [...prev.categories, key] };
    });
  };

  const applyFilters = () => setFilterModalOpen(false);

  // ============================================================
  // RENDER: VIDEO CARD
  // ============================================================
  const VideoCard = ({ video }) => {
    const face = getComprehensionFace(video.comprehension);
    const isWatched = watched.has(video.id);
    const menuOpen = openCardMenuId === video.id;

    return (
      <div className="video-card">
        <div className="thumbnail-container" onClick={() => window.location.href = `reading.html?v=${video.id}`}>
          <span className="level-badge">{video.level}</span>
          <img src={video.thumbnail} alt={video.title} loading="lazy" />
          {video.duration && <span className="duration-badge">{video.duration}</span>}
          {isWatched && (
            <span className="completed-badge" dangerouslySetInnerHTML={{ __html: `${ICONS.completedCheck} Completed` }} />
          )}
        </div>
        <div className="video-info">
          <button
            className="video-menu-trigger"
            onClick={(e) => { e.stopPropagation(); setOpenCardMenuId(menuOpen ? null : video.id); }}
            dangerouslySetInnerHTML={{ __html: ICONS.dotsVertical }}
          />
          {menuOpen && (
            <div className="video-menu-popup open" onClick={(e) => e.stopPropagation()}>
              <button className="video-menu-item" onClick={() => { addToAlbum(video.id); setOpenCardMenuId(null); }}>
                <span dangerouslySetInnerHTML={{ __html: ICONS.addAlbum }} /> Add to album
              </button>
              <button className="video-menu-item" onClick={() => { toggleWatched(video.id); setOpenCardMenuId(null); }}>
                <span dangerouslySetInnerHTML={{ __html: ICONS.markWatched }} />
                {isWatched ? ' Unmark as watched' : ' Mark as watched'}
              </button>
              <button className="video-menu-item" onClick={() => { hideVideo(video.id); setOpenCardMenuId(null); }}>
                <span dangerouslySetInnerHTML={{ __html: ICONS.hideVideo }} /> Hide this video
              </button>
              <button className="video-menu-item" onClick={() => { hideChannel(video.channel); setOpenCardMenuId(null); }}>
                <span dangerouslySetInnerHTML={{ __html: ICONS.hideChannel }} /> Hide channel videos
              </button>
            </div>
          )}
          <h3 className="video-title">{video.title}</h3>
          <p className="video-channel">{video.channel}</p>
          <div className="comprehension-bar">
            <span dangerouslySetInnerHTML={{ __html: face.icon }} />
            <span>Comprehension: {video.comprehension}</span>
            <span className="help-icon" dangerouslySetInnerHTML={{ __html: ICONS.helpCircle }} />
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER: TOP BAR (shared across all views)
  // ============================================================
  const TopBar = () => (
    <header className="top-nav-bar panel">
      <div className="left-metrics">
        <div className="metric-chip level-chip">
          <span>{userStats.level} lvl</span>
        </div>
        <div className="metric-chip">
          <span>{userStats.cardCount} / 15</span>
        </div>
        <div className="metric-chip">
          <span dangerouslySetInnerHTML={{ __html: ICONS.statLeaf }} />
          <span>{userStats.points}</span>
          <span className="stat-tooltip">Known vocabulary</span>
        </div>
        <div className="metric-chip">
          <span dangerouslySetInnerHTML={{ __html: ICONS.statBook }} />
          <span>{userStats.grammarPoints}</span>
          <span className="stat-tooltip">Known grammar</span>
        </div>
        <div
          className="metric-chip streak-chip"
          onMouseEnter={() => setStreakPopoverOpen(true)}
          onMouseLeave={() => setStreakPopoverOpen(false)}
        >
          <span dangerouslySetInnerHTML={{ __html: userStats.streakDays > 0 ? ICONS.statFlame : ICONS.statFlameOutline }} />
          <span>{userStats.streakDays} days</span>
          {streakPopoverOpen && <StreakPopover />}
        </div>
      </div>

      <div className="right-profile-controls">
        <div className="top-user-profile" onClick={() => setProfileMenuOpen(v => !v)}>
          <div className="profile-avatar">{(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}</div>
          <div className="profile-info">
            <span className="profile-greeting">Good Day! 👋</span>
            <span className="profile-name">{user?.displayName || (user?.email || '').split('@')[0] || 'User'}</span>
          </div>
        </div>

        {profileMenuOpen && (
          <div className="profile-dropdown-menu open" onClick={(e) => e.stopPropagation()}>
            <div className="profile-menu-section-label">Navigation</div>
            <a className="profile-menu-item" href="profile.html">Profile &amp; Stats</a>
            <a className="profile-menu-item" href="subscription.html">Subscription</a>
            <div className="profile-menu-divider" />
            <div className="profile-menu-section-label">Help</div>
            <a className="profile-menu-item" href="guide.html">Guide</a>
            <a className="profile-menu-item" href="support.html">Support</a>
            <div className="profile-menu-divider" />
            <div className="profile-menu-section-label">Account</div>
            <button className="profile-menu-item" onClick={() => signOutUser()}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );

  const StreakPopover = () => (
    <div className="streak-popover" onClick={(e) => e.stopPropagation()}>
      <div className="streak-mascot" dangerouslySetInnerHTML={{ __html: ICONS.streakMascot }} />
      <h3>Start your streak today!</h3>
      <p>Do a review, roleplay, shadowing or watch a minute of video each day to build your streak.</p>
      <div className="streak-week-row">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
          <div key={d} className="streak-day">
            <span className="streak-day-circle" />
            <span className="streak-day-label">{d}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ============================================================
  // RENDER: CONTROL ROW (Refresh / Filter / Hidden / My Imports)
  // ============================================================
  const ControlRow = ({ showBack, backLabel }) => (
    <div className="header-actions">
      {showBack ? (
        <button className="action-btn back-btn" onClick={backToRails}>
          <span dangerouslySetInnerHTML={{ __html: ICONS.chevronLeft }} /> Back
        </button>
      ) : null}
      <button className="action-btn icon-only" onClick={() => window.location.reload()} title="Refresh">
        <span dangerouslySetInnerHTML={{ __html: ICONS.refresh }} />
      </button>
      <button className="action-btn icon-only" onClick={() => setFilterModalOpen(true)} title="Filters">
        <span dangerouslySetInnerHTML={{ __html: ICONS.filterIcon }} />
      </button>
      <button className="action-btn" onClick={openHidden}>
        Hidden ({hiddenVideos.size}v, {hiddenChannels.size}c)
      </button>
      <button className="action-btn">
        <span dangerouslySetInnerHTML={{ __html: ICONS.youtubeImport }} /> My Imports
      </button>
    </div>
  );

  // ============================================================
  // RENDER: RAILS VIEW
  // ============================================================
  const RailsView = () => {
    const categoriesToShow = activeCategory === 'all'
      ? CATEGORY_TABS.filter(c => c.key !== 'all').map(c => c.key)
      : [activeCategory];

    return (
      <>
        <section className="catalog-header-section">
          <div className="title-row">
            <h2>Videos</h2>
            <ControlRow showBack={false} />
          </div>
          <div className="category-scroll-bar">
            {CATEGORY_TABS.map(c => (
              <button
                key={c.key}
                className={`category-pill${activeCategory === c.key ? ' active' : ''}`}
                onClick={() => setActiveCategory(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </section>

        {categoriesToShow.map(catKey => {
          const list = videosByCategory[catKey] || [];
          if (list.length === 0) return null;
          return (
            <section className="video-rail-section" key={catKey}>
              <div className="rail-header">
                <h3>{categoryLabel(catKey)}</h3>
                <button className="see-all-link" onClick={() => openSeeAll(catKey)}>See All →</button>
              </div>
              <div className="video-rail">
                {list.slice(0, 10).map(v => <VideoCard key={v.id} video={v} />)}
              </div>
            </section>
          );
        })}
      </>
    );
  };

  // ============================================================
  // RENDER: SEE ALL VIEW
  // ============================================================
  const SeeAllView = () => (
    <>
      <section className="catalog-header-section">
        <div className="title-row">
          <h2>{categoryLabel(seeAllCategoryKey)} ({seeAllVideos.length})</h2>
          <ControlRow showBack={true} />
        </div>
      </section>
      <section className="video-catalog-section">
        <div className="video-grid">
          {seeAllVideos.map(v => <VideoCard key={v.id} video={v} />)}
        </div>
      </section>
    </>
  );

  // ============================================================
  // RENDER: HIDDEN VIEW
  // ============================================================
  const HiddenView = () => (
    <section className="catalog-header-section">
      <div className="title-row">
        <h2>Videos ({hiddenVideoList.length + hiddenChannelList.length})</h2>
        <div className="header-actions">
          <button className="action-btn icon-only" onClick={() => setFilterModalOpen(true)}>
            <span dangerouslySetInnerHTML={{ __html: ICONS.filterIcon }} />
          </button>
          <button className="action-btn" onClick={closeHidden}>Videos</button>
          <button className="action-btn">
            <span dangerouslySetInnerHTML={{ __html: ICONS.youtubeImport }} /> My Imports
          </button>
        </div>
      </div>

      <div className="hidden-tabs">
        <button className={`hidden-tab${hiddenTab === 'channels' ? ' active' : ''}`} onClick={() => setHiddenTab('channels')}>
          Channels ({hiddenChannelList.length})
        </button>
        <button className={`hidden-tab${hiddenTab === 'videos' ? ' active' : ''}`} onClick={() => setHiddenTab('videos')}>
          Videos ({hiddenVideoList.length})
        </button>
      </div>

      {hiddenTab === 'channels' ? (
        hiddenChannelList.length === 0 ? (
          <EmptyHiddenState />
        ) : (
          <div className="hidden-channel-list">
            {hiddenChannelList.map(ch => (
              <div className="hidden-channel-row" key={ch}>
                <span>{ch}</span>
                <button className="btn btn-ghost" onClick={() => unhideChannel(ch)}>Unhide Channel</button>
              </div>
            ))}
          </div>
        )
      ) : (
        hiddenVideoList.length === 0 ? (
          <EmptyHiddenState />
        ) : (
          <div className="video-grid">
            {hiddenVideoList.map(v => (
              <div className="video-card" key={v.id}>
                <div className="thumbnail-container">
                  <span className="level-badge">{v.level}</span>
                  <img src={v.thumbnail} alt={v.title} />
                </div>
                <div className="video-info">
                  <h3 className="video-title">{v.title}</h3>
                  <p className="video-channel">{v.channel}</p>
                  <button className="btn btn-ghost" onClick={() => unhideVideo(v.id)}>Unhide</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </section>
  );

  const EmptyHiddenState = () => (
    <div className="hidden-empty-state">
      <span className="hidden-empty-icon" dangerouslySetInnerHTML={{ __html: ICONS.infoCircle }} />
      <h3>No hidden videos yet</h3>
      <p>Hide a video from the action menu and it will appear here.</p>
      <button className="btn btn-primary btn-full" onClick={closeHidden}>Back to videos</button>
    </div>
  );

  // ============================================================
  // RENDER: FILTER MODAL
  // ============================================================
  const FilterModal = () => (
    <div className="filter-modal-overlay" onClick={() => setFilterModalOpen(false)}>
      <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
        <div className="filter-modal-header">
          <h2>All Filters</h2>
          <button className="modal-close-btn" onClick={() => setFilterModalOpen(false)} dangerouslySetInnerHTML={{ __html: ICONS.closeX }} />
        </div>

        <div className="filter-modal-body">
          <div className="filter-section">
            <div className="filter-section-label">Level</div>
            <div className="filter-pill-row">
              {LEVEL_OPTIONS.map(l => (
                <button
                  key={l}
                  className={`filter-pill${filters.level === l ? ' active' : ''}`}
                  onClick={() => setFilters(f => ({ ...f, level: l }))}
                >{l}</button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-section-label">Progress</div>
            <div className="filter-pill-row">
              {PROGRESS_OPTIONS.map(p => (
                <button
                  key={p}
                  className={`filter-pill${filters.progress === p ? ' active' : ''}`}
                  onClick={() => setFilters(f => ({ ...f, progress: p }))}
                >{p}</button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-section-label">Subtitles</div>
            <div className="filter-pill-row">
              {SUBTITLE_OPTIONS.map(s => (
                <button
                  key={s}
                  className={`filter-pill${filters.subtitles === s ? ' active' : ''}`}
                  onClick={() => setFilters(f => ({ ...f, subtitles: s }))}
                >{s}</button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-section-label">Duration</div>
            <div className="filter-pill-row">
              {DURATION_OPTIONS.map(d => (
                <button
                  key={d}
                  className={`filter-pill${filters.duration === d ? ' active' : ''}`}
                  onClick={() => setFilters(f => ({ ...f, duration: d }))}
                >{d}</button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-section-label filter-section-label--large">Category</div>
            {CATEGORY_TAXONOMY.map(cat => (
              <div key={cat.key} className="filter-category-block">
                <div className="filter-category-name">{cat.label}</div>
                <div className="filter-pill-row">
                  {cat.subTags.map(tag => (
                    <button
                      key={tag}
                      className="filter-pill filter-pill--tag"
                      title="Sub-tag filtering activates once video classification is added"
                    >{tag}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="filter-modal-footer">
          <button className="btn btn-primary btn-full" onClick={applyFilters}>Apply filters</button>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // ROOT RENDER
  // ============================================================
  return (
    <div className="app-shell">
      <aside className="sidebar"></aside>
      <main className="dashboard-main" onClick={() => { setProfileMenuOpen(false); setOpenCardMenuId(null); }}>
        <TopBar />
        {view === 'rails' && <RailsView />}
        {view === 'seeAll' && <SeeAllView />}
        {view === 'hidden' && <HiddenView />}
      </main>
      {filterModalOpen && <FilterModal />}
    </div>
  );
}