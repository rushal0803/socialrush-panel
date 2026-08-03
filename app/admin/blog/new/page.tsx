import BlogEditor from "@/components/admin/BlogEditor";
export default function NewArticlePage(){ return <main className="p-5 sm:p-8"><h1 className="text-3xl font-black text-white">Create article</h1><p className="mt-2 text-slate-400">Drafts are private until published.</p><div className="mt-6 max-w-4xl"><BlogEditor /></div></main>; }
