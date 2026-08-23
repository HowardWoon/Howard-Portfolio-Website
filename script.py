import sys

with open('components/portfolio-page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state
content = content.replace(
    'const [copiedEmail, setCopiedEmail] = useState(false);',
    'const [copiedEmail, setCopiedEmail] = useState(false);\n  const [revealEmail, setRevealEmail] = useState(false);'
)

# 2. Email Reveal
old_email = '''                    <div className="flex items-center justify-between p-4 rounded-xl bg-canvas border border-line shadow-inner">
                      <span className="truncate text-ink font-medium">{personalDetails.email}</span>
                      <button
                        onClick={handleCopyEmail}
                        className="p-2 rounded-lg hover:bg-surface-2 text-ink-3 hover:text-ink transition-colors shrink-0"
                        title="Copy Email"
                      >
                        {copiedEmail ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>'''

new_email = '''                    <div className="flex items-center justify-between p-4 rounded-xl bg-canvas border border-line shadow-inner">
                      {!revealEmail ? (
                        <button
                          onClick={() => setRevealEmail(true)}
                          className="text-ink font-bold hover:text-signal transition-colors underline decoration-line underline-offset-4"
                        >
                          Reveal Email Address
                        </button>
                      ) : (
                        <>
                          <span className="truncate text-ink font-medium">{personalDetails.email}</span>
                          <button
                            onClick={handleCopyEmail}
                            className="p-2 rounded-lg hover:bg-surface-2 text-ink-3 hover:text-ink transition-colors shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-signal"
                            title="Copy Email"
                          >
                            {copiedEmail ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </>
                      )}
                    </div>'''

content = content.replace(old_email, new_email)

# 3. Hero Stats
old_stats = '''            <div className="flex flex-wrap gap-10 sm:gap-20 pt-12 border-t border-line w-full">
              {heroMetrics.map((m, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className="text-4xl font-mono tracking-tighter text-signal mb-1.5 font-bold">{m.value}</div>
                  <div className="text-xs text-ink-3 font-medium uppercase tracking-wider">{m.label}</div>
                </div>
              ))}
            </div>'''

new_stats = '''            <div className="flex flex-col sm:flex-row w-full divide-y sm:divide-y-0 sm:divide-x divide-line pt-12 border-t border-line">
              {heroMetrics.map((m, idx) => (
                <div key={idx} className="flex-1 py-8 sm:py-0 sm:px-8 first:sm:pl-0 last:sm:pr-0 flex flex-col justify-center">
                  <div className="text-5xl sm:text-6xl font-mono tracking-tighter text-signal mb-2 font-extrabold">{m.value}</div>
                  <div className="text-xs text-ink-3 font-bold uppercase tracking-widest">{m.label}</div>
                </div>
              ))}
            </div>'''

content = content.replace(old_stats, new_stats)

with open('components/portfolio-page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done python script")
