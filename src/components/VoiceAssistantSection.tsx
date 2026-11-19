import {Check, Mic, MicOff, Plus, Send, Trash2} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import type {AutomationTask, ProjectEntry, VoiceCommandResponse} from '../types/portfolio';

interface VoiceAssistantSectionProps {
  project: ProjectEntry;
  initialTasks: AutomationTask[];
}

const PRESET_COMMANDS = [
  'What is my SGPA?',
  'Explain my tech stack',
  'Calculate (8.3 + 7.78) / 2',
  'Add task: Practice Python OOP',
  'Show tasks',
  'What is the current UTC time?',
];

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: {results: ArrayLike<ArrayLike<{transcript: string}>>}) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

export function VoiceAssistantSection({project, initialTasks}: VoiceAssistantSectionProps) {
  const [commandInput, setCommandInput] = useState('What is my SGPA?');
  const [running, setRunning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<VoiceCommandResponse[]>([]);
  const [tasks, setTasks] = useState<AutomationTask[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskBusy, setTaskBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    setSpeechSupported(Boolean(win.SpeechRecognition || win.webkitSpeechRecognition));
  }, []);

  async function executeVoiceCommand(cmdText: string) {
    const trimmed = cmdText.trim();
    if (!trimmed) {
      setErrorMsg('Enter or select a command to send to the Python voice engine.');
      return;
    }
    setRunning(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/voice-assistant/simulate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({command: trimmed}),
      });
      if (!res.ok) {
        throw new Error('Python voice engine returned an error.');
      }
      const data: VoiceCommandResponse = await res.json();
      setHistory((prev) => [data, ...prev].slice(0, 6));
      if (data.tasks) {
        setTasks(data.tasks);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to reach Python backend.');
    } finally {
      setRunning(false);
    }
  }

  function handleMicToggle() {
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechCtor = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechCtor) {
      setErrorMsg('Browser speech recognition is unavailable here; type or pick a command instead.');
      return;
    }

    const recognition = new SpeechCtor();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? '';
      if (transcript) {
        setCommandInput(transcript);
        void executeVoiceCommand(transcript);
      }
    };
    recognition.onerror = () => {
      setListening(false);
      setErrorMsg('Microphone capture was interrupted or denied. Type a command directly.');
    };
    recognition.onend = () => {
      setListening(false);
    };

    setErrorMsg(null);
    setListening(true);
    recognition.start();
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newTaskTitle.trim();
    if (trimmed.length < 2) {
      return;
    }
    setTaskBusy(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title: trimmed}),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks ?? []);
        setNewTaskTitle('');
      }
    } finally {
      setTaskBusy(false);
    }
  }

  async function handleToggleTask(id: number) {
    setTaskBusy(true);
    try {
      const res = await fetch(`/api/notes/${id}`, {method: 'PATCH'});
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks ?? []);
      }
    } finally {
      setTaskBusy(false);
    }
  }

  async function handleDeleteTask(id: number) {
    setTaskBusy(true);
    try {
      const res = await fetch(`/api/notes/${id}`, {method: 'DELETE'});
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks ?? []);
      }
    } finally {
      setTaskBusy(false);
    }
  }

  return (
    <section id="projects" className="border-y border-zinc-200 bg-white py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-sm font-medium text-[#1D4ED8]">02. Featured Engineering</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-zinc-950 [text-wrap:balance]">
              {project.title}
            </h2>
            <p className="mt-1 font-serif text-lg italic text-zinc-600">{project.subtitle}</p>

            <p className="mt-5 text-base leading-relaxed text-zinc-600">{project.summary}</p>

            <div className="mt-6 border-t border-zinc-200 pt-5">
              <p className="text-xs font-medium text-zinc-500">Technical Stack</p>
              <p className="mt-2 font-mono text-xs leading-relaxed text-zinc-900">
                {project.stack.join(' · ')}
              </p>
            </div>

            <ul className="mt-6 space-y-2.5 text-sm text-zinc-700">
              {project.highlights.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1D4ED8]" aria-hidden="true" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-zinc-200 pt-6">
              <p className="text-xs font-medium text-zinc-500">Command Processing Architecture</p>
              <div className="mt-4 divide-y divide-zinc-100 border border-zinc-200 bg-[#F8F8F6]">
                {project.architecture.map((stage) => (
                  <div key={stage.stage} className="px-4 py-3">
                    <p className="font-mono text-xs font-medium text-zinc-950">{stage.stage}</p>
                    <p className="mt-0.5 text-xs text-zinc-600">{stage.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="rounded-2xl border border-zinc-200 bg-[#F8F8F6] p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-4">
                <div>
                  <h3 className="font-display text-lg font-semibold text-zinc-950">
                    Interactive Python Command Runner
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Dispatched live to Python 3.11 AST &amp; intent engine with SQLite persistence
                  </p>
                </div>
                <span className="font-mono text-xs text-[#1D4ED8] whitespace-nowrap">
                  POST /api/voice-assistant/simulate
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {PRESET_COMMANDS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setCommandInput(preset);
                      void executeVoiceCommand(preset);
                    }}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition-colors duration-150 hover:border-[#1D4ED8] hover:text-[#1D4ED8] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void executeVoiceCommand(commandInput);
                }}
                className="mt-4 flex flex-col gap-2 sm:flex-row"
              >
                <label htmlFor="voice-command-input" className="sr-only">
                  Voice command input
                </label>
                <input
                  id="voice-command-input"
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="Type a command (e.g., Calculate 8.3 * 12 or Add task: Revise Java)"
                  className="h-11 flex-1 rounded-lg border border-zinc-300 bg-white px-3.5 text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-[#1D4ED8] focus:outline-none"
                />

                <div className="flex items-center gap-2 shrink-0">
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={handleMicToggle}
                      aria-label={listening ? 'Stop voice recognition' : 'Start voice recognition'}
                      className={`inline-flex h-11 items-center gap-2 rounded-lg border px-3.5 text-xs font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${
                        listening
                          ? 'border-red-600 bg-red-600 text-white'
                          : 'border-zinc-300 bg-white text-zinc-800 hover:border-zinc-950'
                      }`}
                    >
                      {listening ? (
                        <>
                          <MicOff className="h-4 w-4" aria-hidden="true" />
                          <span>Listening</span>
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4" aria-hidden="true" />
                          <span>Speak</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={running}
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[#1D4ED8] disabled:opacity-60 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
                  >
                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{running ? 'Running...' : 'Run Command'}</span>
                  </button>
                </div>
              </form>

              {errorMsg && (
                <p role="alert" className="mt-3 text-xs font-medium text-red-700">
                  {errorMsg}
                </p>
              )}

              <div className="mt-5 space-y-3">
                {history.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-5 text-xs text-zinc-500">
                    Select any preset or enter a command above to observe Python intent parsing,
                    AST arithmetic evaluation, or SQLite task automation.
                  </div>
                ) : (
                  history.map((entry, idx) => (
                    <div
                      key={`${entry.timestamp}-${idx}`}
                      className="rounded-xl border border-zinc-200 bg-white p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
                        <span className="font-mono font-medium text-zinc-900">
                          &ldquo;{entry.command}&rdquo;
                        </span>
                        <span className="font-mono tabular-nums">
                          {entry.intent} · {entry.handler} · {entry.executionMs.toFixed(2)} ms
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-800">{entry.reply}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-[#F8F8F6] p-6">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div>
                  <h3 className="font-display text-base font-semibold text-zinc-950">
                    SQLite Task Automation Queue
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Persisted in Python SQLite; updated by voice commands or manual input
                  </p>
                </div>
                <span className="font-mono text-xs text-zinc-600 tabular-nums">
                  {tasks.filter((t) => !t.completed).length} pending
                </span>
              </div>

              <form onSubmit={handleAddTask} className="mt-4 flex gap-2">
                <label htmlFor="manual-task-input" className="sr-only">
                  Add a new automation task
                </label>
                <input
                  id="manual-task-input"
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Add task to Python SQLite queue..."
                  className="h-10 flex-1 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-[#1D4ED8] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={taskBusy || newTaskTitle.trim().length < 2}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-4 text-xs font-semibold text-zinc-900 transition-colors hover:border-zinc-950 disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Add Task</span>
                </button>
              </form>

              <ul className="mt-4 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
                {tasks.length === 0 ? (
                  <li className="px-4 py-4 text-xs text-zinc-500">
                    No tasks in queue. Try running &ldquo;Add task: Study ML basics&rdquo; above.
                  </li>
                ) : (
                  tasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                    >
                      <button
                        type="button"
                        onClick={() => void handleToggleTask(task.id)}
                        disabled={taskBusy}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                            task.completed
                              ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                              : 'border-zinc-300 bg-white'
                          }`}
                        >
                          {task.completed && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                        </span>
                        <span
                          className={`truncate ${
                            task.completed ? 'text-zinc-400 line-through' : 'text-zinc-800'
                          }`}
                        >
                          {task.title}
                        </span>
                      </button>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="hidden sm:inline font-mono text-[11px] text-zinc-400">
                          {task.source}
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleDeleteTask(task.id)}
                          disabled={taskBusy}
                          aria-label={`Delete task ${task.title}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
