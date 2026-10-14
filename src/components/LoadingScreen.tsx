import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

interface LoadingScreenProps {
  onFinish?: () => void;
  canSkip?: boolean;
  /** 当前应用使用本地数据；这是品牌开场时长，不是假装网络进度。 */
  duration?: number;
}

/**
 * 品牌开场：三枚抽象食材错峰入碗，接一个很轻的落点回应。
 * 配色全部复用页面令牌，白卡无黑边；不下载图片、视频或新增动画库。
 * 循环交给 CSS，只动 transform / opacity，不用 30ms setState 刷百分比。
 * 完成 / 跳过共用一次性出口，所有计时器与焦点均在卸载时清理。
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onFinish,
  canSkip = true,
  duration = 1800
}) => {
  const reduceMotion = useReducedMotion();
  const [finishing, setFinishing] = useState(false);
  const completed = useRef(false);
  const mounted = useRef(false);
  const onFinishRef = useRef(onFinish);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  onFinishRef.current = onFinish;

  const finish = useCallback(() => {
    if (!mounted.current || completed.current) return;
    completed.current = true;
    setFinishing(true);
    // 只留一个很短的收笔，不等当前循环整段跑完，也不强迫用户看完。
    finishTimer.current = setTimeout(() => {
      if (mounted.current) onFinishRef.current?.();
    }, reduceMotion ? 60 : 140);
  }, [reduceMotion]);

  useEffect(() => {
    mounted.current = true;
    completed.current = false;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // 聚焦容器而不是「跳过」按钮 —— 按钮被程序聚焦会点亮 :focus-visible 焦点环，
    // 开场时那个绿圈很难看。容器是 outline:none，键盘 Tab 时才把焦点交给按钮。
    rootRef.current?.focus({ preventScroll: true });
    const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 1800;
    const timer = setTimeout(finish, safeDuration);

    return () => {
      mounted.current = false;
      clearTimeout(timer);
      if (finishTimer.current !== null) clearTimeout(finishTimer.current);
      // 返回重播按钮，首屏则不抢页面焦点。焦点必须在 inert 已解除后恢复。
      if (previousFocus && previousFocus !== document.body && previousFocus.isConnected) {
        queueMicrotask(() => {
          if (!previousFocus.closest('[inert]')) previousFocus.focus({ preventScroll: true });
        });
      }
    };
  }, [duration, finish]);

  return (
    <div
      ref={rootRef}
      id="app-loading-screen"
      className="brand-loader"
      data-finishing={finishing ? 'true' : 'false'}
      tabIndex={-1}
      aria-label="轻食页面开场"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && canSkip) finish();
        // 开场覆盖页面时不允许 Tab 进入下层导航；跳过仍可由键盘操作。
        if (event.key === 'Tab') {
          event.preventDefault();
          (skipRef.current ?? rootRef.current)?.focus({ preventScroll: true });
        }
      }}
    >
      <header className="brand-loader__header">
        {/* 左上角黑色涂鸦：与「我的」页头部同一套手绘语言 */}
        <svg className="brand-loader__doodle" viewBox="0 0 36 16" fill="none" aria-hidden="true">
          <path d="M3 13 11 3M14 13 22 3M25 13 33 3" stroke="var(--brand-black)" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
        <span className="brand-loader__wordmark">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none">
            <path d="M12 19C5 19 3 13 3 6c7 0 10 3 10 9C13 8 16 4 22 3c0 8-3 13-10 13v5" fill="white" />
            <path d="M12 20v-7M12 16l5-6M12 16l-5-5" stroke="var(--brand-black)" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          SLIM BOWL
        </span>
        {canSkip && (
          <button ref={skipRef} type="button" className="brand-loader__skip" onClick={finish} disabled={finishing}>
            跳过<span aria-hidden="true">↗</span>
          </button>
        )}
      </header>

      <div className="brand-loader__main">
        <div className="brand-loader__art" aria-hidden="true">
          <div className="brand-loader__disc" />
          <span className="brand-loader__fresh">FRESH!</span>
          <svg className="brand-loader__spark" viewBox="0 0 24 24" fill="var(--brand-black)">
            <path d="M12 1c0 7-4 11-11 11 7 0 11 4 11 11 0-7 4-11 11-11C16 12 12 8 12 1Z" />
          </svg>
          <div className="brand-loader__plate" />
          <div className="brand-loader__bowl">
            <svg viewBox="0 0 128 92" fill="none">
              {/* 碗体：上缘半椭圆 + 碗身合成一条闭合轮廓。
                  黑描边是抽卡页餐盖（青柠盖 + 黑色轮廓）的插画语言，
                  属于品牌图形、不是 UI 描边 —— 与「主页面去黑边」不冲突。 */}
              <path
                d="M10 20a54 14 0 0 1 108 0c-3 36-20 57-54 57S13 56 10 20Z"
                fill="white"
                stroke="var(--brand-black)"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <ellipse cx="64" cy="20" rx="44" ry="9" fill="var(--lime-100)" />
              <path d="M53 49c6 6 16 6 22 0" stroke="var(--brand-black)" strokeWidth="3" strokeLinecap="round" />
              <circle cx="49" cy="38" r="2" fill="var(--brand-black)" />
              <circle cx="79" cy="38" r="2" fill="var(--brand-black)" />
            </svg>
          </div>
          <span className="brand-loader__ingredient brand-loader__ingredient--leaf">
            <svg viewBox="0 0 44 44" fill="none">
              <path d="M9 36C5 15 20 5 37 6c2 20-9 34-28 30Z" fill="var(--lime-900)" />
              <path d="m12 32 17-17m-9 9V16m0 8h8" stroke="var(--lime-400)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span className="brand-loader__ingredient brand-loader__ingredient--tomato">
            <svg viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="23" r="16" fill="white" />
              <path d="M18 11c-6 4-8 9-6 14" stroke="var(--lime-900)" strokeWidth="3" strokeLinecap="round" />
              <path d="m22 6 3-4" stroke="var(--lime-900)" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>
          <span className="brand-loader__ingredient brand-loader__ingredient--broccoli">
            <svg viewBox="0 0 44 44" fill="none">
              {/* 西兰花：云状花球 + 浅色茎，比"胶囊"更明确是食物 */}
              <path d="M22 36V24" stroke="var(--lime-900)" strokeWidth="8" strokeLinecap="round" />
              <circle cx="13" cy="17" r="8.5" fill="var(--lime-900)" />
              <circle cx="31" cy="17" r="8.5" fill="var(--lime-900)" />
              <circle cx="22" cy="11" r="9.5" fill="var(--lime-900)" />
              <circle cx="22" cy="21" r="9" fill="var(--lime-900)" />
              <circle cx="17.5" cy="13" r="2.4" fill="var(--lime-400)" />
              <circle cx="27" cy="19" r="1.8" fill="var(--lime-400)" />
            </svg>
          </span>
        </div>

        <div className="brand-loader__copy">
          <h1>GOOD FOOD<span className="brand-loader__period">.</span></h1>
          <p>新鲜一点，轻盈一点</p>
        </div>
        <div className="brand-loader__status" role="status" aria-live="polite" aria-atomic="true">
          <span className="brand-loader__dots" aria-hidden="true"><i /><i /><i /></span>
          <span>{finishing ? '准备好了' : '美味准备中'}</span>
        </div>
      </div>
      <footer className="brand-loader__footer">GOOD FOOD. BETTER MOOD.</footer>
    </div>
  );
};
