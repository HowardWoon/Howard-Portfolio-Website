import sys

with open('components/portfolio-page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

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

# normalize line endings before replace
content = content.replace('\r\n', '\n')
old_email = old_email.replace('\r\n', '\n')

content = content.replace(old_email, new_email)

with open('components/portfolio-page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done python script 2")
