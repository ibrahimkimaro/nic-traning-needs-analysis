import { useState } from 'react';
import { AlertCircle, BookOpen, Loader2, Send, Sparkles } from 'lucide-react';
import { api } from '../auth/api';

const KnowledgeAssistant = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const askAssistant = async (event) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery || loading) return;

    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await api.ai.answerKnowledge(trimmedQuery);
      setResult(response);
      console.log('Knowledge Assistant response:', response);
    } catch (requestError) {
      setError(requestError.message || 'The assistant could not process your question.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)] gap-6">
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-[#264033] text-white">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-white/10">
              <Sparkles className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Knowledge Assistant</h2>
              <p className="text-sm text-emerald-100 mt-1">
                Find answers from approved training and organizational documents.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={askAssistant} className="p-6 space-y-3">
          <label htmlFor="knowledge-query" className="text-sm font-bold text-slate-800">
            Your question
          </label>
          <textarea
            id="knowledge-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="For example: What training is recommended for claims processing?"
            rows={4}
            maxLength={2000}
            className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#264033] focus:ring-2 focus:ring-emerald-100"
          />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-xs text-slate-400">{query.length}/2000 characters</span>
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#264033] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#1a2d24] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? 'Searching approved documents...' : 'Ask question'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mx-6 mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="border-t border-slate-100 p-6 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Answer</h3>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${result.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {result.status || 'UNKNOWN'}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {result.answer || result.error || 'No answer was returned.'}
            </p>
            {result.status === 'FAILED' && (
              <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                We could not prepare an answer right now. Please try again shortly.
              </p>
            )}
            {result.sources?.length > 0 && (
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <BookOpen className="w-4 h-4" /> Sources used
                </h4>
                <p className="text-xs text-slate-500">
                  Based on {result.sources.length} approved document source{result.sources.length === 1 ? '' : 's'}.
                </p>
                <div className="space-y-2">
                  {result.sources.map((source, index) => (
                    <div key={source.chunk_id || index} className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                      <p className="font-bold text-slate-800">
                        {source.file_name || `Source ${index + 1}`}
                        {source.page_number ? `, page ${source.page_number}` : ''}
                      </p>
                      <p className="mt-1 line-clamp-3 leading-5">{source.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <aside className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-6 h-fit space-y-4">
        <div className="flex items-center gap-2 text-[#264033]">
          <BookOpen className="w-5 h-5" />
          <h3 className="font-bold">Approved information</h3>
        </div>
        <ol className="space-y-3 text-sm text-slate-600">
          <li><strong className="text-slate-800">1.</strong> Your question is matched against approved document content.</li>
          <li><strong className="text-slate-800">2.</strong> Relevant approved passages are used to prepare the answer.</li>
          <li><strong className="text-slate-800">3.</strong> The answer includes the documents and pages used.</li>
        </ol>
        <p className="border-t border-emerald-200 pt-4 text-xs leading-5 text-slate-500">
          The assistant cannot approve requests, change permissions, or calculate official budgets.
        </p>
      </aside>
    </div>
  );
};

export default KnowledgeAssistant;
