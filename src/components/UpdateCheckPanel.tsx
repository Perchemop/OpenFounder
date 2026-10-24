import React, { useEffect, useState } from 'react';
import { RefreshCw, ArrowUpCircle, WifiOff, HelpCircle } from 'lucide-react';
import {
  CURRENT_APP_VERSION,
  RELEASES_URL,
  checkForUpdate,
  describeUpdateState,
  readCache,
  writeCache,
  type UpdateState,
} from '../updateCheck';

/**
 * Update check against GitHub Releases. Fails soft: offline, rate-limited, or
 * malformed responses render as "could not check", never as "up to date" and
 * never as an error dialog.
 */
export const UpdateCheckPanel: React.FC = () => {
  const [state, setState] = useState<UpdateState>({ status: 'unknown', reason: 'not_checked' });
  const [isChecking, setIsChecking] = useState(false);

  const runCheck = async () => {
    setIsChecking(true);
    setState({ status: 'checking' });
    const next = await checkForUpdate();
    setState(next);
    setIsChecking(false);
  };

  useEffect(() => {
    // A recent cached check avoids hammering the API on every settings visit.
    const cached = readCache(Date.now());
    if (cached?.latestTag) {
      setState({ status: 'up_to_date', current: CURRENT_APP_VERSION, latest: cached.latestTag });
      return;
    }
    void runCheck();
  }, []);

  const detail =
    state.status === 'unknown' && state.detail
      ? ` — ${state.detail}`
      : '';

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Version {CURRENT_APP_VERSION}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center space-x-1">
            {state.status === 'update_available' ? (
              <ArrowUpCircle className="w-3 h-3 text-emerald-500" />
            ) : state.status === 'unknown' ? (
              state.reason === 'offline' ? (
                <WifiOff className="w-3 h-3 text-zinc-400" />
              ) : (
                <HelpCircle className="w-3 h-3 text-zinc-400" />
              )
            ) : null}
            <span>
              {describeUpdateState(state)}
              {detail}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              writeCache(null, 0);
              void runCheck();
            }}
            disabled={isChecking}
            className="inline-flex items-center space-x-1 text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Check</span>
          </button>
          {state.status === 'update_available' && (
            <a
              href={state.url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700"
            >
              <ArrowUpCircle className="w-3 h-3" />
              <span>Release notes</span>
            </a>
          )}
        </div>
      </div>

      {state.status === 'update_available' && state.notes && (
        <p className="mt-2 text-[10px] text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap line-clamp-4">
          {state.notes.slice(0, 600)}
        </p>
      )}

      <p className="mt-2 text-[10px] text-zinc-400">
        Checked against GitHub Releases ({RELEASES_URL.replace('https://', '')}), cached for an
        hour. A failed check reports "unavailable" rather than claiming you are up to date.
      </p>
    </div>
  );
};
