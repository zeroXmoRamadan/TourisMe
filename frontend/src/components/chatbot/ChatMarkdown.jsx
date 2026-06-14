import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const markdownComponents = {
    h1: ({ children }) => (
        <h1 className="text-base font-bold text-white mt-3 mb-2 first:mt-0">{children}</h1>
    ),
    h2: ({ children }) => (
        <h2 className="text-sm font-bold text-white mt-3 mb-1.5 first:mt-0">{children}</h2>
    ),
    h3: ({ children }) => (
        <h3 className="text-sm font-semibold text-primary-300 mt-2 mb-1 first:mt-0">{children}</h3>
    ),
    p: ({ children }) => (
        <p className="my-1.5 leading-relaxed text-white/90 first:mt-0 last:mb-0">{children}</p>
    ),
    ul: ({ children }) => (
        <ul className="my-2 space-y-1 list-disc list-outside ml-4 text-white/90">{children}</ul>
    ),
    ol: ({ children }) => (
        <ol className="my-2 space-y-1 list-decimal list-outside ml-4 text-white/90">{children}</ol>
    ),
    li: ({ children }) => <li className="leading-relaxed pl-0.5">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
    em: ({ children }) => <em className="italic text-white/80">{children}</em>,
    a: ({ href, children }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-400 hover:text-primary-300 underline underline-offset-2"
        >
            {children}
        </a>
    ),
    blockquote: ({ children }) => (
        <blockquote className="border-l-2 border-primary-500/50 pl-3 my-2 text-white/70 italic">
            {children}
        </blockquote>
    ),
    hr: () => <hr className="border-white/10 my-3" />,
    code: ({ className, children }) => {
        const isBlock = className?.includes('language-');
        if (isBlock) {
            return (
                <pre className="my-2 p-3 rounded-lg bg-dark-900/80 border border-white/10 overflow-x-auto text-xs">
                    <code className={`${className} text-white/90 font-mono`}>{children}</code>
                </pre>
            );
        }
        return (
            <code className="px-1.5 py-0.5 rounded bg-dark-900/80 text-primary-300 text-xs font-mono">
                {children}
            </code>
        );
    },
    table: ({ children }) => (
        <div className="my-2 overflow-x-auto rounded-lg border border-white/10">
            <table className="min-w-full text-xs border-collapse">{children}</table>
        </div>
    ),
    thead: ({ children }) => <thead className="bg-dark-900/60">{children}</thead>,
    tbody: ({ children }) => <tbody className="divide-y divide-white/10">{children}</tbody>,
    tr: ({ children }) => <tr>{children}</tr>,
    th: ({ children }) => (
        <th className="border border-white/10 px-2 py-1.5 text-left font-semibold text-white">
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className="border border-white/10 px-2 py-1.5 text-white/85">{children}</td>
    ),
};

const ChatMarkdown = ({ content }) => (
    <div className="chat-markdown text-sm">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {content}
        </ReactMarkdown>
    </div>
);

export default ChatMarkdown;
