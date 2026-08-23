import sys

with open('components/portfolio-page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

content = content.replace(
    '''              </FadeIn>
            ))}
          </div>
        </section>

        {/* ================= 3. EXPERIENCE ================= */}''',
    '''              </FadeIn>
            ))}
          </div>
          
          <div className="flex justify-center mt-12 w-full">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-surface border border-line hover:border-signal text-ink font-bold text-sm transition-all hover:-translate-y-1 hover:shadow-xl group"
            >
              Like what you see? Let's talk <ArrowRight className="w-4 h-4 text-signal group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </section>

        {/* ================= 3. EXPERIENCE ================= */}'''
)

with open('components/portfolio-page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
